// Голосовой анализ
class VoiceAnalyzer {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;

        // Speech Recognition (для распознавания речи)
        this.recognition = null;
        this.recognizedText = '';
        this.lastInterimText = ''; // Сохраняем промежуточный текст
        this.isListening = false;

        // Text-to-Speech
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;

        // Режим работы: 'analysis' (только анализ голоса) или 'conversation' (разговор с ИИ)
        this.mode = 'conversation';

        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        // Проверяем поддержку Speech Recognition API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition API не поддерживается в этом браузере');
            return;
        }

        this.recognition = new SpeechRecognition();

        // Пробуем разные варианты русского языка
        this.recognition.lang = 'ru-RU';

        // Настройки для более агрессивного распознавания
        this.recognition.continuous = false; // ИЗМЕНЕНО: false может работать лучше
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 5; // Еще больше вариантов

        console.log('🎤 Speech Recognition настроен:', {
            lang: this.recognition.lang,
            continuous: this.recognition.continuous,
            interimResults: this.recognition.interimResults,
            maxAlternatives: this.recognition.maxAlternatives
        });

        this.recognition.onstart = () => {
            console.log('Распознавание речи начато');
            this.isListening = true;
        };

        this.recognition.onresult = (event) => {
            console.log('📝 Получен результат распознавания!');
            console.log('   Количество результатов:', event.results.length);
            console.log('   ResultIndex:', event.resultIndex);

            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                const confidence = result[0].confidence;
                const isFinal = result.isFinal;

                console.log(`   Результат ${i}:`, {
                    text: transcript,
                    isFinal: isFinal,
                    confidence: confidence,
                    alternatives: result.length
                });

                if (isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Обновляем распознанный текст (даже если промежуточный!)
            if (finalTranscript) {
                this.recognizedText += finalTranscript;
                console.log('✅ ФИНАЛЬНЫЙ текст добавлен:', this.recognizedText);
            }

            // НОВОЕ: Сохраняем и промежуточный текст на случай, если финального не будет
            if (interimTranscript && !finalTranscript) {
                console.log('⏳ Промежуточный текст:', interimTranscript);
                // Сохраняем последний промежуточный результат как запасной
                this.lastInterimText = interimTranscript;
            }

            // Вызываем callback для обновления UI
            if (this.onTranscriptUpdate) {
                this.onTranscriptUpdate(interimTranscript, finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Ошибка распознавания речи:', event.error);
            if (event.error === 'no-speech') {
                console.warn('⚠️ Речь не обнаружена - говорите громче!');
                // Вызываем callback для показа текстового ввода
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed('no-speech');
                }
            } else if (event.error === 'audio-capture') {
                console.error('❌ Не удалось захватить аудио - проверьте микрофон!');
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed('audio-capture');
                }
            } else if (event.error === 'not-allowed') {
                console.error('❌ Доступ к микрофону запрещен!');
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed('not-allowed');
                }
            }
        };

        this.recognition.onend = () => {
            console.log('Распознавание речи завершено');
            this.isListening = false;
        };
    }

    // Запуск записи с распознаванием речи
    async startRecording() {
        try {
            this.recognizedText = ''; // Сбрасываем предыдущий текст
            this.lastInterimText = ''; // Сбрасываем промежуточный текст

            // ОТКЛЮЧЕНО: Теперь используем Groq Whisper вместо Web Speech API
            // Останавливаем и удаляем предыдущее распознавание
            // if (this.recognition) {
            //     try {
            //         this.recognition.abort();
            //         this.isListening = false;
            //         console.log('🛑 Остановлено предыдущее распознавание');
            //     } catch (e) {
            //         console.warn('Ошибка при остановке:', e);
            //     }
            //     this.recognition = null;
            // }

            // ОТКЛЮЧЕНО: Создаем НОВЫЙ экземпляр распознавания для режима разговора
            // if (this.mode === 'conversation') {
            //     this.initSpeechRecognition();
            //     console.log('🔄 Создан новый экземпляр распознавания');
            // }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(stream);

            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            source.connect(this.analyser);

            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.visualize();

            // ОТКЛЮЧЕНО: Запускаем НОВЫЙ экземпляр распознавания речи
            // Теперь используем Groq Whisper API после остановки записи
            // if (this.mode === 'conversation' && this.recognition) {
            //     try {
            //         this.recognition.start();
            //         console.log('✅ Распознавание речи запущено');
            //     } catch (error) {
            //         console.error('❌ Не удалось запустить распознавание речи:', error);
            //     }
            // }

            console.log('🎙️ Запись началась. Используем Groq Whisper для распознавания после остановки.');
            return true;
        } catch (error) {
            console.error('Ошибка доступа к микрофону:', error);
            alert('Необходим доступ к микрофону для анализа голоса');
            return false;
        }
    }

    // Остановка распознавания речи
    stopSpeechRecognition() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                console.log('⏹️ Распознавание речи остановлено');
            } catch (error) {
                console.warn('⚠️ Ошибка при остановке распознавания:', error);
            }
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            // Останавливаем распознавание речи
            this.stopSpeechRecognition();

            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.audioChunks = [];
                    resolve(audioBlob);
                };
                this.mediaRecorder.stop();
            } else {
                resolve(null);
            }

            if (this.audioContext) {
                this.audioContext.close();
            }

            this.isRecording = false;
        });
    }

    visualize() {
        if (!this.isRecording) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;

        // Визуализация на кнопке
        const btn = document.getElementById('voiceBtn');
        if (btn) {
            const scale = 1 + (average / 255) * 0.2;
            btn.style.transform = `scale(${scale})`;
        }

        // Показываем уровень звука в статусе (для диагностики)
        const status = document.getElementById('voiceStatus');
        if (status && this.mode === 'conversation') {
            const volumePercent = Math.round((average / 255) * 100);
            if (volumePercent > 5) { // Если есть звук
                status.textContent = `🎤 Слышу вас... (громкость: ${volumePercent}%)`;
            }
        }

        requestAnimationFrame(() => this.visualize());
    }

    async analyzeAudio(audioBlob) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
        
        return this.extractFeatures(audioBuffer);
    }

    extractFeatures(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        // 1. Энергия
        let energy = 0;
        for (let i = 0; i < channelData.length; i++) {
            energy += channelData[i] * channelData[i];
        }
        energy = Math.sqrt(energy / channelData.length);
        
        // 2. Частота (Zero-Crossing Rate)
        let zeroCrossings = 0;
        for (let i = 1; i < channelData.length; i++) {
            if ((channelData[i-1] >= 0 && channelData[i] < 0) || 
                (channelData[i-1] < 0 && channelData[i] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / channelData.length;
        const estimatedPitch = zcr * sampleRate / 2;
        
        // 3. Темп речи
        const threshold = 0.02;
        let speechSegments = 0;
        let inSpeech = false;
        
        for (let i = 0; i < channelData.length; i += sampleRate / 100) {
            const sample = Math.abs(channelData[Math.floor(i)]);
            if (sample > threshold && !inSpeech) {
                speechSegments++;
                inSpeech = true;
            } else if (sample <= threshold) {
                inSpeech = false;
            }
        }
        const tempo = speechSegments / audioBuffer.duration;
        
        // 4. Вариативность
        let variance = 0;
        const mean = energy;
        for (let i = 0; i < channelData.length; i += 100) {
            const sample = Math.abs(channelData[i]);
            variance += Math.pow(sample - mean, 2);
        }
        variance = Math.sqrt(variance / (channelData.length / 100));
        
        return {
            energy: energy,
            pitch: estimatedPitch,
            tempo: tempo,
            variance: variance,
            duration: audioBuffer.duration,
            energyLevel: energy < 0.05 ? 'низкая' : energy < 0.15 ? 'средняя' : 'высокая',
            pitchLevel: estimatedPitch < 150 ? 'низкая' : estimatedPitch < 250 ? 'средняя' : 'высокая',
            tempoLevel: tempo < 2 ? 'медленный' : tempo < 4 ? 'нормальный' : 'быстрый'
        };
    }

    detectEmotionalState(features) {
        const { energy, pitch, tempo, variance, energyLevel, pitchLevel, tempoLevel } = features;
        
        let state, icon, title, subtitle, badge, badgeClass, message, actions, exercises, crisis;
        
        // ДЕПРЕССИЯ: низкая энергия + низкая высота + медленный темп
        if (energyLevel === 'низкая' && pitchLevel === 'низкая' && tempoLevel === 'медленный') {
            state = 'depression';
            icon = '😔';
            title = 'Признаки подавленности';
            subtitle = 'Низкая энергия и монотонность голоса';
            badge = 'Высокий';
            badgeClass = 'badge-high';
            message = `Анализ вашего голоса показывает признаки депрессивного состояния:\n• Низкая энергия голоса (${(energy * 100).toFixed(1)}%)\n• Пониженная высота тона\n• Замедленный темп речи\n\nНастоятельно рекомендуем обратиться к психотерапевту.`;
            actions = [
                'Запишитесь к психотерапевту в ближайшие дни',
                'Ежедневные прогулки 20-30 минут',
                'Поддерживайте контакт с близкими людьми',
                'Старайтесь соблюдать режим сна',
                'Не принимайте важных решений'
            ];
            exercises = [
                'Дыхание 4-7-8 (3 раза в день)',
                'Дневник благодарности',
                'Техника "маленьких шагов"',
                'Утренний ритуал активации'
            ];
            crisis = false;
            
        // ТРЕВОГА: высокая энергия + высокая высота + быстрый темп
        } else if ((energyLevel === 'высокая' || tempoLevel === 'быстрый') && variance > 0.1) {
            state = 'anxiety';
            icon = '😰';
            title = 'Повышенная тревожность';
            subtitle = 'Напряженность и беспокойство в голосе';
            badge = 'Средний';
            badgeClass = 'badge-medium';
            message = `Ваш голос показывает признаки тревожности:\n• Повышенная энергия (${(energy * 100).toFixed(1)}%)\n• Быстрый темп речи\n• Нестабильность тона\n\nРекомендуем техники релаксации.`;
            actions = [
                'Практикуйте глубокое дыхание 3 раза в день',
                'Ограничьте кофеин и стимуляторы',
                'Техника прогрессивной релаксации',
                'Медитация осознанности 10-15 минут',
                'Рассмотрите консультацию с психологом'
            ];
            exercises = [
                'Техника заземления 5-4-3-2-1',
                'Прогрессивная мышечная релаксация',
                'Медитация сканирования тела',
                'Дыхание по квадрату (4-4-4-4)'
            ];
            crisis = false;
            
        // СТРЕСС: средние показатели с отклонениями
        } else if (energyLevel === 'средняя' && variance > 0.08) {
            state = 'stress';
            icon = '😓';
            title = 'Признаки стресса';
            subtitle = 'Напряжение в голосе';
            badge = 'Средний';
            badgeClass = 'badge-medium';
            message = `Ваш голос показывает признаки стресса:\n• Нестабильность тона\n• Переменная энергия\n\nВажно уделить время восстановлению.`;
            actions = [
                'Найдите время для отдыха и релаксации',
                'Физическая активность (прогулка, йога)',
                'Ограничьте стрессовые факторы',
                'Качественный сон 7-8 часов',
                'Общение с поддерживающими людьми'
            ];
            exercises = [
                'Дыхательные практики',
                'Короткие медитации 5-10 минут',
                'Прогулки на природе',
                'Легкая растяжка'
            ];
            crisis = false;
            
        // СПОКОЙСТВИЕ
        } else {
            state = 'calm';
            icon = '😊';
            title = 'Спокойное состояние';
            subtitle = 'Ваш голос звучит уверенно и стабильно';
            badge = 'Низкий';
            badgeClass = 'badge-low';
            message = `Отлично! Анализ вашего голоса показывает стабильное состояние:\n• Сбалансированная энергия\n• Стабильный тон\n• Размеренный темп речи`;
            actions = [
                'Продолжайте следить за своим здоровьем',
                'Поддерживайте режим сна 7-8 часов',
                'Регулярная физическая активность',
                'Практикуйте благодарность'
            ];
            exercises = [
                'Утренняя медитация для профилактики',
                'Ведение дневника эмоций',
                'Регулярные прогулки',
                'Практики осознанности'
            ];
            crisis = false;
        }
        
        return {
            state, icon, title, subtitle, badge, badgeClass,
            message, actions, exercises, crisis,
            voiceMetrics: features
        };
    }

    // Озвучивание текста через Text-to-Speech
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Останавливаем предыдущее воспроизведение
            this.stopSpeaking();

            if (!this.synthesis) {
                console.warn('Speech Synthesis API не поддерживается');
                resolve();
                return;
            }

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = options.lang || 'ru-RU';
            this.currentUtterance.rate = options.rate || 1.0;
            this.currentUtterance.pitch = options.pitch || 1.0;
            this.currentUtterance.volume = options.volume || 1.0;

            // Пытаемся выбрать русский голос
            const voices = this.synthesis.getVoices();
            const russianVoice = voices.find(voice => voice.lang.startsWith('ru'));
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
            }

            this.currentUtterance.onend = () => {
                console.log('Озвучивание завершено');
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                console.error('Ошибка озвучивания:', event);
                reject(event);
            };

            this.synthesis.speak(this.currentUtterance);
        });
    }

    // Остановка озвучивания
    stopSpeaking() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    }

    // Проверка, идет ли сейчас озвучивание
    isSpeaking() {
        return this.synthesis && this.synthesis.speaking;
    }

    // НОВОЕ: Распознавание речи через Groq Whisper API
    async transcribeWithGroq(audioBlob) {
        console.log('🎙️ Начинаем распознавание через Groq Whisper...');
        console.log('   Размер аудио:', (audioBlob.size / 1024).toFixed(2), 'KB');

        try {
            // Создаем FormData для отправки файла
            const formData = new FormData();

            // Groq Whisper принимает разные форматы, но mp3/wav работают лучше всего
            // Добавляем расширение .wav к файлу
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-large-v3');
            formData.append('language', 'ru'); // Русский язык
            formData.append('response_format', 'json');

            console.log('📤 Отправляем аудио в Groq Whisper API...');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.apiKeys.groq}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ошибка Groq API:', response.status, errorText);
                throw new Error(`Groq API error: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Groq Whisper ответ:', result);

            // Whisper API возвращает объект с полем 'text'
            const transcribedText = result.text || '';
            console.log('📝 Распознанный текст:', transcribedText);

            return transcribedText.trim();

        } catch (error) {
            console.error('❌ Ошибка распознавания через Groq:', error);
            throw error;
        }
    }

    // Получить распознанный текст
    getRecognizedText() {
        const finalText = this.recognizedText.trim();
        const interimText = this.lastInterimText.trim();

        console.log('📤 getRecognizedText вызван:', {
            finalText: finalText || '(пусто)',
            interimText: interimText || '(пусто)'
        });

        // Если есть финальный текст - используем его
        if (finalText) {
            return finalText;
        }

        // Если финального нет, но есть промежуточный - используем промежуточный
        if (interimText) {
            console.log('⚠️ Используем промежуточный текст, т.к. финального нет');
            return interimText;
        }

        // Ничего не распознано
        return '';
    }

    // Очистить распознанный текст
    clearRecognizedText() {
        this.recognizedText = '';
        this.lastInterimText = '';
    }

    // Установить режим работы
    setMode(mode) {
        if (mode === 'analysis' || mode === 'conversation') {
            this.mode = mode;
        }
    }

    // Получить текущий режим
    getMode() {
        return this.mode;
    }
}