// Content Library - Podcasts, Stories, Meditations

class ContentLibrary {
    constructor() {
        this.initialized = false;
        this.currentFilter = 'all';
    }

    init() {
        if (this.initialized) return;

        console.log('📚 Content Library initialized');
        this.attachEventListeners();
        this.initialized = true;
    }

    attachEventListeners() {
        // Filter buttons for podcasts
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target);
            });
        });

        // Podcast cards
        const podcastCards = document.querySelectorAll('.podcast-card');
        podcastCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.podcast-title')?.textContent;
                this.playPodcast(title);
            });
        });

        // Story cards
        const storyCards = document.querySelectorAll('.story-card');
        storyCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.story-title')?.textContent;
                this.readStory(title, card);
            });
        });

        // Meditation play buttons
        const meditationBtns = document.querySelectorAll('.meditation-play-btn');
        meditationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.meditation-card');
                const title = card.querySelector('.meditation-title')?.textContent;
                const duration = card.querySelector('.meditation-duration')?.textContent;
                this.playMeditation(title, duration);
            });
        });
    }

    handleFilter(filterBtn) {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        filterBtn.classList.add('active');

        // Get filter value
        const filter = filterBtn.dataset.filter;
        this.currentFilter = filter;

        // Filter podcasts
        const podcasts = document.querySelectorAll('.podcast-card');
        podcasts.forEach(podcast => {
            const category = podcast.dataset.category;

            if (filter === 'all' || category === filter) {
                podcast.style.display = '';
                podcast.style.animation = 'fadeIn 0.5s ease';
            } else {
                podcast.style.display = 'none';
            }
        });

        console.log('Filter applied:', filter);
    }

    playPodcast(title) {
        this.showNotification(`Воспроизведение: ${title}`, 'info');

        // Create audio player modal
        this.showAudioPlayer({
            type: 'podcast',
            title: title,
            duration: '45:00'
        });
    }

    readStory(title, card) {
        const author = card.querySelector('.story-author')?.textContent;
        const excerpt = card.querySelector('.story-excerpt')?.textContent;
        const meta = card.querySelector('.story-meta')?.textContent;

        // Show full story modal
        this.showStoryModal({
            title,
            author,
            excerpt,
            meta
        });
    }

    playMeditation(title, duration) {
        this.showNotification(`Начинаем медитацию: ${title}`, 'success');

        // Show meditation player
        this.showMeditationPlayer({
            title,
            duration
        });
    }

    showAudioPlayer(content) {
        const overlay = document.createElement('div');
        overlay.className = 'audio-player-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const player = document.createElement('div');
        player.className = 'audio-player-modal';
        player.style.cssText = `
            background: var(--card-bg);
            border-radius: 24px;
            max-width: 500px;
            width: 90%;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
        `;

        player.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">🎙️</div>
                <h2 style="font-size: 24px; margin-bottom: 12px; color: var(--text-primary);">${content.title}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 32px;">${content.type === 'podcast' ? 'Подкаст' : 'Медитация'} • ${content.duration}</p>

                <div style="background: var(--bg-color); padding: 20px; border-radius: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: var(--text-secondary);">
                        <span>0:00</span>
                        <span>${content.duration}</span>
                    </div>
                    <div style="height: 6px; background: rgba(102, 126, 234, 0.2); border-radius: 3px; overflow: hidden;">
                        <div id="audioProgress" style="height: 100%; width: 0%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s;"></div>
                    </div>
                </div>

                <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 24px;">
                    <button class="audio-control-btn" style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-color); border: none; font-size: 24px; cursor: pointer;">⏮</button>
                    <button id="playPauseAudio" class="audio-control-btn" style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; font-size: 32px; color: white; cursor: pointer;">▶</button>
                    <button class="audio-control-btn" style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-color); border: none; font-size: 24px; cursor: pointer;">⏭</button>
                </div>

                <button id="closeAudioPlayer" style="width: 100%; padding: 14px; background: transparent; border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-secondary); cursor: pointer;">
                    Закрыть
                </button>
            </div>
        `;

        overlay.appendChild(player);
        document.body.appendChild(overlay);

        // Add event listeners
        const playBtn = player.querySelector('#playPauseAudio');
        const closeBtn = player.querySelector('#closeAudioPlayer');
        const progressBar = player.querySelector('#audioProgress');

        let isPlaying = false;
        let progress = 0;

        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? '⏸' : '▶';

            if (isPlaying) {
                // Simulate playback
                const interval = setInterval(() => {
                    if (!isPlaying || progress >= 100) {
                        clearInterval(interval);
                        return;
                    }
                    progress += 1;
                    progressBar.style.width = `${progress}%`;
                }, 500);
            }
        });

        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    showStoryModal(story) {
        const overlay = document.createElement('div');
        overlay.className = 'story-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 5000;
            overflow-y: auto;
            padding: 40px 20px;
            animation: fadeIn 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--card-bg);
            border-radius: 24px;
            max-width: 700px;
            margin: 0 auto;
            padding: 48px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
        `;

        modal.innerHTML = `
            <h1 style="font-size: 36px; margin-bottom: 12px; color: var(--text-primary);">${story.title}</h1>
            <p style="font-size: 16px; color: var(--text-secondary); font-style: italic; margin-bottom: 32px;">${story.author}</p>

            <div style="font-size: 17px; line-height: 1.8; color: var(--text-primary); margin-bottom: 32px;">
                <p style="margin-bottom: 20px;">${story.excerpt}</p>
                <p style="margin-bottom: 20px;">Это только начало моей истории. Путь к выздоровлению был долгим и непростым, но каждый шаг приближал меня к себе настоящему.</p>
                <p style="margin-bottom: 20px;">Я научился принимать свои эмоции, работать с ними и не бояться обращаться за помощью. Терапия, поддержка близких и вера в себя помогли мне преодолеть самые тяжелые моменты.</p>
                <p>Сегодня я хочу сказать всем, кто проходит через подобное: вы не одиноки, и выход есть всегда. Не бойтесь просить о помощи и верьте в свои силы.</p>
            </div>

            <div style="padding: 20px; background: var(--bg-color); border-radius: 16px; margin-bottom: 32px;">
                <p style="font-size: 14px; color: var(--text-secondary);">${story.meta}</p>
            </div>

            <button onclick="this.closest('.story-modal-overlay').remove()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;">
                Закрыть
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    showMeditationPlayer(meditation) {
        const overlay = document.createElement('div');
        overlay.className = 'meditation-player-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 5000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            animation: fadeIn 0.5s ease;
        `;

        overlay.innerHTML = `
            <button onclick="this.parentElement.remove()" style="position: absolute; top: 40px; right: 40px; width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 24px; cursor: pointer;">✕</button>

            <div style="text-align: center;">
                <div id="meditationIcon" style="font-size: 120px; margin-bottom: 32px; animation: pulse 3s ease-in-out infinite;">🧘</div>
                <h2 style="font-size: 48px; margin-bottom: 16px; font-weight: 700;">${meditation.title}</h2>
                <p style="font-size: 24px; opacity: 0.9; margin-bottom: 48px;">${meditation.duration}</p>

                <div style="margin-bottom: 48px;">
                    <div id="breathInstruction" style="font-size: 32px; font-weight: 600; margin-bottom: 16px;">Приготовьтесь</div>
                    <div id="breathCount" style="font-size: 72px; font-weight: 700;">3</div>
                </div>

                <button id="startMeditation" style="padding: 20px 48px; background: white; color: #667eea; border: none; border-radius: 50px; font-size: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);">
                    Начать медитацию
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Start meditation
        const startBtn = overlay.querySelector('#startMeditation');
        const instruction = overlay.querySelector('#breathInstruction');
        const count = overlay.querySelector('#breathCount');

        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
            this.runMeditationCycle(instruction, count);
        });

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }

    runMeditationCycle(instruction, count) {
        const breathingCycle = [
            { text: 'Вдох', duration: 4 },
            { text: 'Задержка', duration: 4 },
            { text: 'Выдох', duration: 6 },
            { text: 'Пауза', duration: 2 }
        ];

        let cycleIndex = 0;

        const nextPhase = () => {
            const phase = breathingCycle[cycleIndex];
            instruction.textContent = phase.text;

            let countdown = phase.duration;
            count.textContent = countdown;

            const countdownInterval = setInterval(() => {
                countdown--;
                count.textContent = countdown;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    cycleIndex = (cycleIndex + 1) % breathingCycle.length;
                    nextPhase();
                }
            }, 1000);
        };

        nextPhase();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 6000;
            font-size: 14px;
            font-weight: 600;
            animation: slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize content library
window.contentLibrary = new ContentLibrary();

// Auto-initialize when content tab is shown
document.addEventListener('DOMContentLoaded', () => {
    const contentTab = document.getElementById('content-tab');
    if (contentTab) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    window.contentLibrary.init();
                }
            });
        });

        observer.observe(contentTab, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initialize if already active
        if (contentTab.classList.contains('active')) {
            window.contentLibrary.init();
        }
    }
});

console.log('✅ Content Library Module loaded');
