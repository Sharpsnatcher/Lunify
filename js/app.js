// Главный файл приложения
const voiceAnalyzer = new VoiceAnalyzer();
const aiChat = new AIChat();

// Безопасная загрузка истории с обработкой ошибок
let sessionHistory = [];
try {
    sessionHistory = JSON.parse(localStorage.getItem('mindcare_history') || '[]');
} catch (error) {
    console.error('Ошибка загрузки истории:', error);
    localStorage.removeItem('mindcare_history');
    sessionHistory = [];
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 MindCare загружен');
    console.log('Провайдер AI:', AI_CONFIG.provider);

    // Initialize all modules
    initTabs();
    initVoice();
    initChat();
    initTabToggle();
    initSidebarToggle(); // NEW: Initialize sidebar toggle
    initResultsClose(); // NEW: Initialize results close button

    // Initialize new features
    if (window.moodDiary) window.moodDiary.init();
    if (window.breathingExercises) window.breathingExercises.init();
    if (window.habitsTracker) window.habitsTracker.init();
    if (window.analyticsManager) window.analyticsManager.init();
    if (window.authManager) window.authManager.init();
    if (window.themeManager) window.themeManager.init();

    // Mark as loaded after animations complete
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// NEW: Initialize Results Close Button
function initResultsClose() {
    const closeBtn = document.getElementById('closeResultsBtn');
    const resultsCard = document.getElementById('resultsCard');

    if (closeBtn && resultsCard) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Закрытие окна результатов');

            resultsCard.classList.remove('show');

            // Явно скрываем через style
            setTimeout(() => {
                resultsCard.style.display = 'none';
            }, 400); // После анимации

            // Reset voice button for new recording
            const voiceBtn = document.getElementById('voiceBtn');
            const voiceStatus = document.getElementById('voiceStatus');
            if (voiceBtn && voiceStatus) {
                voiceBtn.textContent = '🎤';
                voiceStatus.textContent = 'Нажмите для новой записи';
            }
        });

        console.log('✅ Обработчик кнопки закрытия установлен');
    } else {
        console.warn('⚠️ Кнопка закрытия или карточка результатов не найдены');
    }
}

// NEW: Initialize Sidebar Toggle (Yandex Music Style)
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('appSidebar');

    if (!toggleBtn || !sidebar) {
        console.log('Sidebar elements not found');
        return;
    }

    // Проверка, мобильное ли устройство
    const isMobile = () => {
        const width = window.innerWidth;
        console.log('Current width:', width, 'isMobile:', width <= 768);
        return width <= 768;
    };

    // Toggle sidebar on button click
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        const mobile = isMobile();
        console.log('🔘 Button clicked, isMobile:', mobile, 'width:', window.innerWidth);

        if (mobile) {
            // На мобильных используем класс 'active'
            const isActive = sidebar.classList.toggle('active');
            console.log('📱 Sidebar toggled (mobile):', isActive ? 'active (visible)' : 'hidden');
            console.log('Classes:', sidebar.className);
        } else {
            // На десктопе используем класс 'collapsed'
            const isCollapsed = sidebar.classList.toggle('collapsed');
            toggleBtn.classList.toggle('collapsed', isCollapsed);

            // Update chat input position
            const chatInput = document.getElementById('chatInputContainer');
            if (chatInput) {
                chatInput.style.left = isCollapsed ? '0' : '280px';
            }

            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', isCollapsed);

            console.log('💻 Sidebar toggled (desktop):', isCollapsed ? 'collapsed' : 'expanded');
        }
    });

    // Restore saved state (только для десктопа)
    if (!isMobile()) {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');

            // Also update chat input position
            const chatInput = document.getElementById('chatInputContainer');
            if (chatInput) {
                chatInput.style.left = '0';
            }
        }
    } else {
        console.log('📱 Mobile mode detected, sidebar starts hidden');
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobile()) {
            const isClickInside = sidebar.contains(e.target) || toggleBtn.contains(e.target);
            if (!isClickInside && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                console.log('Sidebar closed (clicked outside)');
            }
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) {
                sidebar.classList.remove('active');
            } else {
                sidebar.classList.remove('collapsed');
                toggleBtn.classList.remove('collapsed');
            }
        }, 250);
    });

    console.log('✅ Sidebar toggle initialized, current mode:', isMobile() ? 'mobile' : 'desktop');
}

// OLD: Toggle sidebar (keeping for backward compatibility)
function initTabToggle() {
    const toggleBtn = document.getElementById('tabToggleBtn');
    const sidebar = document.getElementById('sidebarTabs');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');

            // Save state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        // Restore state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
}

// Табы
function initTabs() {
    const tabs = document.querySelectorAll('.ios-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ios-tab').forEach(t => t.classList.remove('active'));

    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    const chatInput = document.getElementById('chatInputContainer');
    chatInput.style.display = tabName === 'chat' ? 'flex' : 'none';

    // Прокрутка контента наверх при смене таба
    console.log('🔄 Switching to tab:', tabName);

    // Небольшая задержка, чтобы дать время для рендера
    setTimeout(() => {
        // 1. Прокручиваем window
        window.scrollTo(0, 0);
        console.log('📜 Window scrolled');

        // 2. Прокручиваем body
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        console.log('📜 Body scrolled');

        // 3. Прокручиваем main content area
        const mainContentArea = document.getElementById('mainContentArea');
        if (mainContentArea) {
            console.log('📜 Main content area scroll before:', mainContentArea.scrollTop);
            mainContentArea.scrollTop = 0;
            console.log('📜 Main content area scrolled');
        }

        // 4. Прокручиваем активную вкладку
        const activeTab = document.getElementById(tabName + '-tab');
        if (activeTab) {
            console.log('📜 Active tab scroll before:', activeTab.scrollTop);
            activeTab.scrollTop = 0;
            console.log('📜 Active tab scrolled');
        }

        // 5. Ищем любой элемент с overflow
        const allScrollable = document.querySelectorAll('*');
        allScrollable.forEach(el => {
            if (el.scrollTop > 0) {
                console.log('📜 Found scrolled element:', el.className || el.id, 'scrollTop:', el.scrollTop);
                el.scrollTop = 0;
            }
        });
    }, 50);

    // Hide/show status bar and tabs for voice tab
    const statusBar = document.querySelector('.status-bar');
    const container = document.querySelector('.container');

    if (statusBar && container) {
        if (tabName === 'voice') {
            statusBar.style.opacity = '0';
            statusBar.style.pointerEvents = 'none';
            container.style.paddingTop = '0';
            // Tabs will auto-hide via CSS :has selector
        } else {
            statusBar.style.opacity = '1';
            statusBar.style.pointerEvents = 'auto';
            container.style.paddingTop = 'calc(44px + var(--safe-area-top) + 60px)';
        }
    }

    // Initialize theme toggle when switching to profile tab
    if (tabName === 'profile' && window.themeManager) {
        // Wait longer to ensure profile state is shown
        setTimeout(() => {
            console.log('🔧 Attempting to initialize theme toggle from switchTab...');
            window.themeManager.setupToggleButton();
        }, 200);
    }

    // Update analytics when switching to analytics tab
    if (tabName === 'analytics' && window.analyticsManager) {
        window.analyticsManager.updateAnalytics();
    }
}

// Голосовой анализ
function initVoice() {
    console.log('🎤 НАЧАЛО initVoice()');

    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceHint = document.getElementById('voiceHint');
    const conversationModeBtn = document.getElementById('conversationModeBtn');
    const analysisModeBtn = document.getElementById('analysisModeBtn');

    console.log('🎤 Инициализация голосового модуля...');
    console.log('Элементы найдены:', {
        voiceBtn: !!voiceBtn,
        voiceStatus: !!voiceStatus,
        voiceHint: !!voiceHint,
        conversationModeBtn: !!conversationModeBtn,
        analysisModeBtn: !!analysisModeBtn
    });

    // Если кнопок переключателя нет, продолжаем работать в старом режиме
    if (!conversationModeBtn || !analysisModeBtn) {
        console.warn('⚠️ Кнопки переключения режимов не найдены! Работаем в режиме разговора по умолчанию.');
        // Не выходим из функции, продолжаем инициализацию основной кнопки
    }

    // Устанавливаем callback для обновления распознанного текста в реальном времени
    voiceAnalyzer.onTranscriptUpdate = (interimTranscript, finalTranscript) => {
        if (voiceAnalyzer.isRecording) {
            const text = finalTranscript || interimTranscript;
            if (text) {
                voiceStatus.textContent = `Вы говорите: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
            }
        }
    };

    // Callback при ошибке распознавания - показываем предложение текстового ввода
    voiceAnalyzer.onRecognitionFailed = (errorType) => {
        console.log('❌ Распознавание не работает, показываем текстовый ввод');
        const toggleBtn = document.getElementById('toggleInputModeBtn');
        if (toggleBtn) {
            toggleBtn.style.display = 'block';
            toggleBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
            toggleBtn.style.color = 'white';
            toggleBtn.style.border = 'none';
            toggleBtn.textContent = '⚠️ Распознавание не работает - переключитесь на текст';
            toggleBtn.style.animation = 'pulse 2s infinite';
        }
    };

    // Переключение режимов - добавляем обработчики только если кнопки существуют
    if (conversationModeBtn && analysisModeBtn) {
        console.log('✅ Добавляем обработчики для кнопок режимов');

        conversationModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Клик: Режим - Разговор с психологом');
            voiceAnalyzer.setMode('conversation');
            conversationModeBtn.classList.add('active');
            analysisModeBtn.classList.remove('active');
            if (voiceHint) voiceHint.textContent = 'Расскажите о ваших чувствах, я вас слушаю';
            if (voiceStatus) voiceStatus.textContent = 'Нажмите для начала разговора';
        });

        analysisModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Клик: Режим - Анализ голоса');
            voiceAnalyzer.setMode('analysis');
            analysisModeBtn.classList.add('active');
            conversationModeBtn.classList.remove('active');
            if (voiceHint) voiceHint.textContent = 'Анализ эмоционального состояния по голосу';
            if (voiceStatus) voiceStatus.textContent = 'Нажмите для записи';
        });

        console.log('✅ Обработчики кнопок режимов установлены');
    }

    voiceBtn.addEventListener('click', async () => {
        if (!voiceAnalyzer.isRecording) {
            const success = await voiceAnalyzer.startRecording();
            if (!success) return;

            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '⏹️';

            if (voiceAnalyzer.getMode() === 'conversation') {
                voiceStatus.textContent = 'Слушаю вас... Говорите свободно';
                // Показываем кнопку переключения на текстовый ввод в режиме разговора
                const toggleBtn = document.getElementById('toggleInputModeBtn');
                if (toggleBtn) toggleBtn.style.display = 'block';
            } else {
                voiceStatus.textContent = 'Идет запись... Говорите свободно';
            }
            voiceStatus.classList.add('recording');

        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            voiceStatus.textContent = 'Обрабатываю...';
            voiceStatus.classList.remove('recording');

            const audioBlob = await voiceAnalyzer.stopRecording();
            await processVoiceRecording(audioBlob);
        }
    });

    // Переключение между голосовым и текстовым вводом
    const toggleInputModeBtn = document.getElementById('toggleInputModeBtn');
    const textInputMode = document.getElementById('textInputMode');
    const sendTextBtn = document.getElementById('sendTextBtn');
    const manualTextInput = document.getElementById('manualTextInput');

    if (toggleInputModeBtn && textInputMode) {
        let isTextMode = false;

        toggleInputModeBtn.addEventListener('click', () => {
            isTextMode = !isTextMode;

            if (isTextMode) {
                // Показываем текстовый ввод, скрываем голосовую кнопку
                textInputMode.style.display = 'block';
                voiceBtn.style.display = 'none';
                voiceStatus.style.display = 'none';
                toggleInputModeBtn.textContent = '🎤 Переключить на голосовой ввод';
            } else {
                // Показываем голосовую кнопку, скрываем текстовый ввод
                textInputMode.style.display = 'none';
                voiceBtn.style.display = 'flex';
                voiceStatus.style.display = 'block';
                toggleInputModeBtn.textContent = '📝 Переключить на текстовый ввод';
            }
        });
    }

    // Обработка отправки текстового сообщения
    if (sendTextBtn && manualTextInput) {
        sendTextBtn.addEventListener('click', async () => {
            const text = manualTextInput.value.trim();

            if (!text) {
                alert('Пожалуйста, напишите что-нибудь');
                return;
            }

            // Отключаем кнопку во время обработки
            sendTextBtn.disabled = true;
            sendTextBtn.textContent = 'Отправляю...';

            try {
                // Показываем введенный текст
                displayRecognizedText(text);

                // Получаем ответ от AI
                const result = await aiChat.sendMessage(text);

                // Показываем ответ ИИ
                displayAIResponse(result.response);

                // Озвучиваем ответ
                await voiceAnalyzer.speak(result.response);

                // Проверяем кризис
                if (result.hasCrisis) {
                    showEmergencyCard();
                }

                // Очищаем поле ввода
                manualTextInput.value = '';

            } catch (error) {
                console.error('Ошибка обработки сообщения:', error);
                alert('Произошла ошибка. Попробуйте снова.');
            } finally {
                sendTextBtn.disabled = false;
                sendTextBtn.textContent = 'Отправить сообщение';
            }
        });

        // Отправка по Enter (Shift+Enter для новой строки)
        manualTextInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendTextBtn.click();
            }
        });
    }
}

async function processVoiceRecording(audioBlob) {
    const status = document.getElementById('voiceStatus');

    try {
        const mode = voiceAnalyzer.getMode();

        // В режиме разговора - работаем с распознанным текстом
        if (mode === 'conversation') {
            // НОВОЕ: Используем Groq Whisper API для распознавания
            status.textContent = 'Распознаю речь через Groq Whisper...';

            let recognizedText = '';
            try {
                recognizedText = await voiceAnalyzer.transcribeWithGroq(audioBlob);
                console.log('✅ Текст распознан через Groq:', recognizedText);
            } catch (error) {
                console.error('❌ Ошибка распознавания через Groq:', error);
                status.textContent = 'Ошибка распознавания речи';

                // Показываем кнопку переключения на текстовый ввод
                const toggleBtn = document.getElementById('toggleInputModeBtn');
                if (toggleBtn) {
                    toggleBtn.style.display = 'block';
                    toggleBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
                    toggleBtn.style.color = 'white';
                    toggleBtn.style.border = 'none';
                    toggleBtn.textContent = '⚠️ Ошибка распознавания - попробуйте текст';
                    toggleBtn.style.animation = 'pulse 2s infinite';
                }

                setTimeout(() => {
                    status.textContent = 'Используйте текстовый ввод';
                }, 2000);
                return;
            }

            if (!recognizedText) {
                status.textContent = 'Не удалось распознать речь';

                // Показываем кнопку переключения на текстовый ввод
                const toggleBtn = document.getElementById('toggleInputModeBtn');
                if (toggleBtn) {
                    toggleBtn.style.display = 'block';
                    toggleBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
                    toggleBtn.style.color = 'white';
                    toggleBtn.style.border = 'none';
                    toggleBtn.textContent = '⚠️ Распознавание не работает - попробуйте текст';
                    toggleBtn.style.animation = 'pulse 2s infinite';
                }

                setTimeout(() => {
                    status.textContent = 'Попробуйте еще раз или используйте текст';
                }, 2000);
                return;
            }

            status.textContent = 'Обрабатываю ваше сообщение...';

            // Показываем распознанный текст пользователю
            displayRecognizedText(recognizedText);

            // Отправляем в AI чат
            status.textContent = 'Получаю ответ от психолога...';
            const result = await aiChat.sendMessage(recognizedText);

            // Показываем ответ ИИ
            displayAIResponse(result.response);

            // Озвучиваем ответ ИИ
            status.textContent = 'Озвучиваю ответ...';
            await voiceAnalyzer.speak(result.response);

            status.textContent = 'Готов к новой записи';

            // Показываем экстренную помощь при кризисе
            if (result.hasCrisis) {
                showEmergencyCard();
            }

        } else {
            // Режим анализа голоса (старая логика)
            status.textContent = 'Извлекаю характеристики голоса...';

            const features = await voiceAnalyzer.analyzeAudio(audioBlob);

            status.textContent = 'Определяю эмоциональное состояние...';

            const emotionalState = voiceAnalyzer.detectEmotionalState(features);

            if (AI_CONFIG.provider !== 'demo') {
                status.textContent = 'Получаю комментарий от ИИ...';
                const aiInsights = await aiChat.getVoiceAnalysisInsight(features, emotionalState);
                if (aiInsights) {
                    emotionalState.aiInsights = aiInsights;
                }
            }

            status.textContent = 'Анализ завершен!';

            displayResults(emotionalState);
            saveToHistory(emotionalState);

            setTimeout(() => {
                status.textContent = 'Нажмите для новой записи';
            }, 2000);
        }

    } catch (error) {
        console.error('Ошибка анализа:', error);
        status.textContent = 'Ошибка анализа. Попробуйте снова';
        setTimeout(() => {
            status.textContent = 'Нажмите для записи';
        }, 2000);
    }
}

// Чат
function initChat() {
    const sendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    
    sendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    showTyping();
    
    try {
        const result = await aiChat.sendMessage(message);
        hideTyping();
        addChatMessage('assistant', result.response);
        
        if (result.hasCrisis) {
            showEmergencyInChat();
        }
    } catch (error) {
        hideTyping();
        console.error('Ошибка чата:', error);
        addChatMessage('assistant', 'Извините, произошла ошибка. Попробуйте позже.');
    }
}

function addChatMessage(role, content) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = content;
    
    messageDiv.appendChild(bubble);
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing';
    typingDiv.className = 'chat-message';
    typingDiv.innerHTML = `
        <div class="chat-bubble assistant">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

// Функции для отображения голосового разговора
function displayRecognizedText(text) {
    const resultsCard = document.getElementById('resultsCard');
    const resultMessage = document.getElementById('resultMessage');

    // Обновляем карточку результатов для отображения распознанного текста
    document.getElementById('resultIcon').textContent = '🎤';
    document.getElementById('resultTitle').textContent = 'Вы сказали:';
    document.getElementById('resultSubtitle').textContent = 'Распознанная речь';
    document.getElementById('resultBadge').style.display = 'none';

    resultMessage.innerHTML = `<p style="font-style: italic; color: #666;">"${text}"</p>`;

    // Скрываем списки рекомендаций
    document.getElementById('actionsList').parentElement.style.display = 'none';
    document.getElementById('exercisesList').parentElement.style.display = 'none';

    // Показываем карточку с анимацией
    resultsCard.style.display = 'block';
    setTimeout(() => {
        resultsCard.classList.add('show');
    }, 10);
}

function displayAIResponse(response) {
    const resultMessage = document.getElementById('resultMessage');

    // Обновляем заголовок
    document.getElementById('resultIcon').textContent = '🤖';
    document.getElementById('resultTitle').textContent = 'Ответ психолога:';
    document.getElementById('resultSubtitle').textContent = 'Lunify';

    // Добавляем ответ ИИ под распознанным текстом
    const aiResponseDiv = document.createElement('div');
    aiResponseDiv.style.marginTop = '20px';
    aiResponseDiv.style.padding = '15px';
    aiResponseDiv.style.background = '#f0f9ff';
    aiResponseDiv.style.borderRadius = '12px';
    aiResponseDiv.style.borderLeft = '4px solid #0ea5e9';
    aiResponseDiv.innerHTML = `<p style="line-height: 1.6; margin: 0;">${response}</p>`;

    resultMessage.appendChild(aiResponseDiv);
}

function showEmergencyCard() {
    const card = document.getElementById('emergencyCard');
    if (card) {
        card.style.display = 'block';
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function showEmergencyInChat() {
    const container = document.getElementById('chatMessages');
    const emergencyDiv = document.createElement('div');
    emergencyDiv.className = 'emergency-card';
    emergencyDiv.style.margin = '16px 0';
    emergencyDiv.innerHTML = `
        <div class="emergency-title">⚠️ Экстренная помощь</div>
        <div class="emergency-text">
            Пожалуйста, немедленно обратитесь за профессиональной помощью:
        </div>
        <button class="emergency-button" onclick="callHotline()">
            📞 Телефон доверия
            <span style="font-size: 15px; opacity: 0.8;">8-800-2000-122</span>
        </button>
        <button class="emergency-button" onclick="callEmergency()">
            🚑 Скорая помощь
            <span style="font-size: 15px; opacity: 0.8;">112</span>
        </button>
    `;
    container.appendChild(emergencyDiv);
    container.scrollTop = container.scrollHeight;
}

// Отображение результатов
function displayResults(scenario) {
    const card = document.getElementById('resultsCard');
    const banner = document.getElementById('resultBanner');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const subtitle = document.getElementById('resultSubtitle');
    const badge = document.getElementById('resultBadge');
    const message = document.getElementById('resultMessage');
    const actionsList = document.getElementById('actionsList');
    const exercisesList = document.getElementById('exercisesList');
    const emergency = document.getElementById('emergencyCard');

    banner.className = `result-banner ${scenario.state}`;
    icon.textContent = scenario.icon;
    title.textContent = scenario.title;
    subtitle.textContent = scenario.subtitle;
    badge.textContent = scenario.badge;
    badge.className = `ios-badge ${scenario.badgeClass}`;
    message.innerHTML = scenario.message.replace(/\n/g, '<br>');
    
    if (scenario.aiInsights) {
        message.innerHTML += `<br><br><strong>💡 Комментарий ИИ:</strong><br>${scenario.aiInsights}`;
    }

    actionsList.innerHTML = '';
    scenario.actions.forEach(action => {
        const item = document.createElement('div');
        item.className = 'ios-list-item';
        item.style.cssText = 'padding: 20px; border: none; border-radius: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: flex-start; gap: 16px;';
        item.innerHTML = `
            <div class="list-item-icon" style="font-size: 28px;">✓</div>
            <div class="list-item-content">
                <div class="list-item-text" style="font-size: 17px; color: #ffffff; line-height: 1.7; letter-spacing: -0.3px;">${action}</div>
            </div>
        `;
        actionsList.appendChild(item);
    });

    exercisesList.innerHTML = '';
    if (scenario.exercises && scenario.exercises.length > 0) {
        scenario.exercises.forEach(exercise => {
            const item = document.createElement('div');
            item.className = 'ios-list-item';
            item.style.cssText = 'padding: 20px; border: none; border-radius: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: flex-start; gap: 16px;';
            item.innerHTML = `
                <div class="list-item-icon" style="font-size: 28px;">🧘</div>
                <div class="list-item-content">
                    <div class="list-item-text" style="font-size: 17px; color: #ffffff; line-height: 1.7; letter-spacing: -0.3px;">${exercise}</div>
                </div>
            `;
            exercisesList.appendChild(item);
        });
    } else {
        exercisesList.innerHTML = '<div class="ios-list-item" style="padding: 20px; border: none; border-radius: 12px; background: rgba(255, 255, 255, 0.05);"><div class="list-item-text" style="font-size: 17px; color: #ffffff; letter-spacing: -0.3px;">Срочно обратитесь к специалисту</div></div>';
    }

    emergency.style.display = scenario.crisis ? 'block' : 'none';
    card.classList.add('show');
    card.scrollIntoView({ behavior: 'smooth' });
}

// История
function saveToHistory(scenario) {
    const session = {
        date: new Date().toISOString(),
        state: scenario.title,
        icon: scenario.icon,
        badge: scenario.badge,
        badgeClass: scenario.badgeClass
    };
    
    sessionHistory.unshift(session);
    if (sessionHistory.length > 10) {
        sessionHistory = sessionHistory.slice(0, 10);
    }
    
    localStorage.setItem('mindcare_history', JSON.stringify(sessionHistory));
}

// Экстренные контакты
function callHotline() {
    if (confirm('Позвонить на телефон доверия 8-800-2000-122?')) {
        window.location.href = 'tel:88002000122';
    }
}

function callEmergency() {
    if (confirm('Позвонить в скорую помощь 112?')) {
        window.location.href = 'tel:112';
    }
}

// Инициализация экстренных кнопок
document.addEventListener('DOMContentLoaded', () => {
    const hotlineBtn = document.getElementById('hotlineBtn');
    const emergencyBtn = document.getElementById('emergencyBtn');
    
    if (hotlineBtn) hotlineBtn.addEventListener('click', callHotline);
    if (emergencyBtn) emergencyBtn.addEventListener('click', callEmergency);
});