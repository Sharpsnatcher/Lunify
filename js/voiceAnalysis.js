// Голосовой анализ
class VoiceAnalyzer {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
    }

    async startRecording() {
        try {
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
            
            return true;
        } catch (error) {
            console.error('Ошибка доступа к микрофону:', error);
            alert('Необходим доступ к микрофону для анализа голоса');
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.audioChunks = [];
                    resolve(audioBlob);
                };
                this.mediaRecorder.stop();
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
        
        const btn = document.getElementById('voiceBtn');
        if (btn) {
            const scale = 1 + (average / 255) * 0.2;
            btn.style.transform = `scale(${scale})`;
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
}