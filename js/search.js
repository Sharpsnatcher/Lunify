// Глобальная система поиска
class GlobalSearch {
    constructor() {
        this.searchData = [];
        this.searchInput = null;
        this.searchResults = null;
        this.isSearchOpen = false;
    }

    init() {
        this.searchInput = document.querySelector('.search-input');
        this.createSearchModal();
        this.buildSearchIndex();
        this.attachEventListeners();
        console.log('✅ Global Search initialized');
    }

    createSearchModal() {
        // Create search modal overlay
        const modal = document.createElement('div');
        modal.id = 'searchModal';
        modal.className = 'search-modal';
        modal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <div class="search-modal-input-wrapper">
                        <svg class="search-modal-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                            <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <input type="text" class="search-modal-input" placeholder="Поиск по приложению..." autofocus>
                        <button class="search-modal-close" id="closeSearchModal">✕</button>
                    </div>
                </div>
                <div class="search-modal-body">
                    <div class="search-suggestions" id="searchSuggestions">
                        <div class="search-section-title">Популярные разделы</div>
                        <div class="search-suggestion-item" data-tab="voice">
                            <span class="suggestion-icon">🎤</span>
                            <div class="suggestion-content">
                                <div class="suggestion-title">Голосовой анализ</div>
                                <div class="suggestion-desc">Анализ эмоционального состояния</div>
                            </div>
                        </div>
                        <div class="search-suggestion-item" data-tab="mood">
                            <span class="suggestion-icon">📔</span>
                            <div class="suggestion-content">
                                <div class="suggestion-title">Дневник настроения</div>
                                <div class="suggestion-desc">Отслеживайте своё настроение</div>
                            </div>
                        </div>
                        <div class="search-suggestion-item" data-tab="breathe">
                            <span class="suggestion-icon">🧘</span>
                            <div class="suggestion-content">
                                <div class="suggestion-title">Дыхательные практики</div>
                                <div class="suggestion-desc">6 техник дыхания</div>
                            </div>
                        </div>
                        <div class="search-suggestion-item" data-tab="events">
                            <span class="suggestion-icon">🎭</span>
                            <div class="suggestion-content">
                                <div class="suggestion-title">Мероприятия</div>
                                <div class="suggestion-desc">Психологические события</div>
                            </div>
                        </div>
                    </div>
                    <div class="search-results-container" id="searchResultsContainer" style="display: none;">
                        <div class="search-results-header">
                            <span id="searchResultsCount">Найдено: 0</span>
                        </div>
                        <div class="search-results-list" id="searchResultsList"></div>
                    </div>
                    <div class="search-empty" id="searchEmpty" style="display: none;">
                        <div class="search-empty-icon">🔍</div>
                        <div class="search-empty-text">Ничего не найдено</div>
                        <div class="search-empty-hint">Попробуйте изменить запрос</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add click handlers to suggestion items
        const suggestionItems = modal.querySelectorAll('.search-suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                if (tab) {
                    this.navigateToTab(tab);
                }
            });
        });
    }

    buildSearchIndex() {
        // Index all searchable content
        this.searchData = [
            // Tabs
            { type: 'tab', icon: '🎤', title: 'Голосовой анализ', description: 'Анализ эмоционального состояния по голосу', tab: 'voice', keywords: ['голос', 'анализ', 'эмоции', 'запись', 'аудио'] },
            { type: 'tab', icon: '📔', title: 'Дневник настроения', description: 'Отслеживайте своё настроение каждый день', tab: 'mood', keywords: ['дневник', 'настроение', 'эмоции', 'записи'] },
            { type: 'tab', icon: '🧘', title: 'Дыхательные практики', description: '6 техник дыхания для релаксации', tab: 'breathe', keywords: ['дыхание', 'релакс', 'медитация', 'стресс'] },
            { type: 'tab', icon: '✓', title: 'Трекер привычек', description: 'Отслеживайте полезные привычки', tab: 'habits', keywords: ['привычки', 'трекер', 'цели', 'прогресс'] },
            { type: 'tab', icon: '📊', title: 'Аналитика', description: 'Статистика вашего настроения', tab: 'analytics', keywords: ['аналитика', 'статистика', 'графики', 'отчёты'] },
            { type: 'tab', icon: '🎭', title: 'Мероприятия', description: 'Психологические события в Москве', tab: 'events', keywords: ['мероприятия', 'события', 'встречи', 'группы'] },
            { type: 'tab', icon: '🎵', title: 'Музыка по настроению', description: 'Подберите музыку под своё состояние', tab: 'music', keywords: ['музыка', 'плейлисты', 'треки', 'настроение'] },
            { type: 'tab', icon: '📚', title: 'Библиотека контента', description: 'Подкасты, медитации и истории', tab: 'content', keywords: ['контент', 'подкасты', 'медитации', 'истории'] },
            { type: 'tab', icon: '💬', title: 'Чат поддержки', description: 'Общайтесь с ИИ-помощником', tab: 'chat', keywords: ['чат', 'поддержка', 'помощь', 'общение'] },

            // Breathing exercises
            { type: 'breathing', icon: '😌', title: 'Дыхание 4-7-8', description: 'Техника для расслабления и снятия стресса', tab: 'breathe', keywords: ['4-7-8', 'расслабление', 'стресс'] },
            { type: 'breathing', icon: '📦', title: 'Квадратное дыхание', description: 'Техника от стресса и тревоги', tab: 'breathe', keywords: ['квадрат', 'стресс', 'тревога'] },
            { type: 'breathing', icon: '🌊', title: 'Спокойное дыхание', description: 'Медле��ное дыхание для успокоения', tab: 'breathe', keywords: ['спокойствие', 'медленное', 'релакс'] },
            { type: 'breathing', icon: '⚡', title: 'Бодрящее дыхание', description: 'Для повышения энергии', tab: 'breathe', keywords: ['энергия', 'бодрость', 'активность'] },
            { type: 'breathing', icon: '🔺', title: 'Треугольное дыхание', description: 'Для баланса и гармонии', tab: 'breathe', keywords: ['треугольник', 'баланс', 'гармония'] },
            { type: 'breathing', icon: '🫁', title: 'Глубокое дыхание', description: 'Против тревоги и паники', tab: 'breathe', keywords: ['глубокое', 'тревога', 'паника'] },

            // Events (examples from HTML)
            { type: 'event', icon: '🧘', title: 'Практика осознанности для начинающих', description: 'Центр йоги "Прана", 25 ноября', tab: 'events', keywords: ['медитация', 'осознанность', 'йога', 'начинающие'] },
            { type: 'event', icon: '🎨', title: 'Творческая мастерская: Рисуем эмоции', description: 'Арт-терапия, 28 ноября', tab: 'events', keywords: ['арт-терапия', 'творчество', 'рисование', 'эмоции'] },
            { type: 'event', icon: '🌊', title: 'Дыхательные практики от стресса', description: 'Wellness Центр, 2 декабря', tab: 'events', keywords: ['дыхание', 'стресс', 'практики'] },
            { type: 'event', icon: '❤️', title: 'Женский круг поддержки', description: 'Групповая терапия, 5 декабря', tab: 'events', keywords: ['женский', 'круг', 'группа', 'поддержка'] },
            { type: 'event', icon: '🧘', title: 'Йога для снятия тревожности', description: 'Yoga Space, 8 декабря', tab: 'events', keywords: ['йога', 'тревожность', 'релакс'] },

            // Music moods
            { type: 'music', icon: '😊', title: 'Поднять настроение', description: 'Веселые и энергичные треки', tab: 'music', keywords: ['веселье', 'энергия', 'позитив', 'радость'] },
            { type: 'music', icon: '😌', title: 'Успокоиться', description: 'Расслабляющая музыка', tab: 'music', keywords: ['успокоение', 'релакс', 'спокойствие'] },
            { type: 'music', icon: '🎯', title: 'Сосредоточиться', description: 'Музыка для концентрации', tab: 'music', keywords: ['фокус', 'концентрация', 'работа', 'учёба'] },
            { type: 'music', icon: '😴', title: 'Заснуть', description: 'Спокойная музыка для сна', tab: 'music', keywords: ['сон', 'засыпание', 'спокойствие'] },
            { type: 'music', icon: '⚡', title: 'Зарядиться энергией', description: 'Бодрящие треки', tab: 'music', keywords: ['энергия', 'бодрость', 'активность'] },

            // Podcasts
            { type: 'podcast', icon: '🎙️', title: 'Как справиться с выгоранием', description: 'Д-р Анна Петрова, 45 мин', tab: 'content', keywords: ['выгорание', 'психология', 'работа', 'стресс'] },
            { type: 'podcast', icon: '🎙️', title: 'Управление тревогой в повседневной жизни', description: 'Мария Соколова, 32 мин', tab: 'content', keywords: ['тревога', 'тревожность', 'техники', 'жизнь'] },
            { type: 'podcast', icon: '🎙️', title: 'Секреты здорового сна', description: 'Д-р Иван Смирнов, 28 мин', tab: 'content', keywords: ['сон', 'здоровье', 'режим', 'качество'] },
            { type: 'podcast', icon: '🎙️', title: 'Эмоциональный интеллект', description: 'Елена Волкова, 38 мин', tab: 'content', keywords: ['эмоции', 'интеллект', 'развитие', 'навыки'] },

            // Meditations
            { type: 'meditation', icon: '🌅', title: 'Утренняя медитация', description: 'Начни день с ясным умом, 10 мин', tab: 'content', keywords: ['утро', 'энергия', 'фокус', 'начало дня'] },
            { type: 'meditation', icon: '🌊', title: 'Снятие стресса', description: 'Освободись от напряжения, 15 мин', tab: 'content', keywords: ['стресс', 'напряжение', 'релакс'] },
            { type: 'meditation', icon: '❤️', title: 'Любящая доброта', description: 'Развитие сострадания, 12 мин', tab: 'content', keywords: ['любовь', 'доброта', 'сострадание', 'принятие'] },
            { type: 'meditation', icon: '🌙', title: 'Вечерняя медитация', description: 'Подготовься ко сну, 20 мин', tab: 'content', keywords: ['вечер', 'сон', 'покой', 'отдых'] },
            { type: 'meditation', icon: '🌸', title: 'Осознанность', description: 'Присутствие здесь и сейчас, 8 мин', tab: 'content', keywords: ['осознанность', 'mindfulness', 'концентрация'] },
            { type: 'meditation', icon: '🦋', title: 'Работа с тревогой', description: 'Успокоение встревоженного ума, 18 мин', tab: 'content', keywords: ['тревога', 'беспокойство', 'спокойствие'] },

            // Features & Help
            { type: 'feature', icon: '🆘', title: 'Экстренная помощь', description: 'Телефон доверия и скорая помощь', tab: 'voice', keywords: ['помощь', 'экстренная', 'кризис', 'срочно', 'телефон доверия'] },
            { type: 'feature', icon: '📞', title: 'Телефон доверия', description: '8-800-2000-122', tab: 'voice', keywords: ['телефон', 'доверие', 'помощь', 'поддержка'] },
        ];
    }

    attachEventListeners() {
        const modal = document.getElementById('searchModal');
        const modalInput = document.querySelector('.search-modal-input');
        const closeBtn = document.getElementById('closeSearchModal');

        // Open search modal when clicking sidebar search
        if (this.searchInput) {
            this.searchInput.addEventListener('click', () => {
                this.openSearchModal();
            });
            this.searchInput.addEventListener('focus', () => {
                this.openSearchModal();
            });
        }

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSearchModal();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSearchOpen) {
                this.closeSearchModal();
            }
        });

        // Search input handler
        if (modalInput) {
            modalInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K to open search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
        });
    }

    openSearchModal() {
        const modal = document.getElementById('searchModal');
        const modalInput = document.querySelector('.search-modal-input');

        modal.classList.add('active');
        this.isSearchOpen = true;

        // Focus input
        setTimeout(() => {
            if (modalInput) {
                modalInput.focus();
            }
        }, 100);
    }

    closeSearchModal() {
        const modal = document.getElementById('searchModal');
        const modalInput = document.querySelector('.search-modal-input');

        if (!modal) {
            console.warn('Search modal not found');
            return;
        }

        modal.classList.remove('active');
        this.isSearchOpen = false;

        // Clear search
        if (modalInput) {
            modalInput.value = '';
        }
        this.showSuggestions();
    }

    handleSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();

        if (trimmedQuery.length === 0) {
            this.showSuggestions();
            return;
        }

        // Search through indexed data
        const results = this.searchData.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(trimmedQuery);
            const descMatch = item.description.toLowerCase().includes(trimmedQuery);
            const keywordMatch = item.keywords.some(keyword =>
                keyword.toLowerCase().includes(trimmedQuery)
            );
            return titleMatch || descMatch || keywordMatch;
        });

        this.displayResults(results, trimmedQuery);
    }

    showSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        const resultsContainer = document.getElementById('searchResultsContainer');
        const emptyState = document.getElementById('searchEmpty');

        if (suggestions) suggestions.style.display = 'block';
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }

    displayResults(results, query) {
        const suggestions = document.getElementById('searchSuggestions');
        const resultsContainer = document.getElementById('searchResultsContainer');
        const resultsList = document.getElementById('searchResultsList');
        const resultsCount = document.getElementById('searchResultsCount');
        const emptyState = document.getElementById('searchEmpty');

        // Hide suggestions
        if (suggestions) suggestions.style.display = 'none';

        if (results.length === 0) {
            if (resultsContainer) resultsContainer.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        // Show results
        if (emptyState) emptyState.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'block';
        if (resultsCount) resultsCount.textContent = `Найдено: ${results.length}`;

        // Render results
        if (resultsList) {
            resultsList.innerHTML = results.map(item => {
                const highlightedTitle = this.highlightText(item.title, query);
                const highlightedDesc = this.highlightText(item.description, query);

                return `
                    <div class="search-result-item" data-tab="${item.tab}">
                        <span class="result-icon">${item.icon}</span>
                        <div class="result-content">
                            <div class="result-title">${highlightedTitle}</div>
                            <div class="result-description">${highlightedDesc}</div>
                            <div class="result-type">${this.getTypeLabel(item.type)}</div>
                        </div>
                        <span class="result-arrow">→</span>
                    </div>
                `;
            }).join('');

            // Add click handlers to newly created elements
            const resultItems = resultsList.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', () => {
                    const tab = item.dataset.tab;
                    if (tab) {
                        this.navigateToTab(tab);
                    }
                });
            });
        }
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    getTypeLabel(type) {
        const labels = {
            'tab': 'Раздел',
            'breathing': 'Дыхательная практика',
            'event': 'Мероприятие',
            'music': 'Музыка',
            'podcast': 'Подкаст',
            'meditation': 'Медитация',
            'feature': 'Функция'
        };
        return labels[type] || 'Контент';
    }

    navigateToTab(tabName) {
        console.log('Navigating to tab:', tabName);

        // Close modal FIRST
        this.closeSearchModal();
        console.log('Modal closed');

        // Then navigate
        setTimeout(() => {
            if (typeof switchTab === 'function') {
                switchTab(tabName);
                console.log('Navigated to:', tabName);
            } else {
                console.error('switchTab function not found');
            }
        }, 100);
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.globalSearch = new GlobalSearch();
        window.globalSearch.init();
    });
} else {
    window.globalSearch = new GlobalSearch();
    window.globalSearch.init();
}
