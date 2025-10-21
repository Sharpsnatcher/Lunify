// Дыхательные упражнения
class BreathingExercises {
    constructor() {
        this.isActive = false;
        this.currentCycle = 0;
        this.totalCycles = 5;
        this.currentExercise = '478';
        this.currentInterval = null;
        
        this.exercises = {
            '478': {
                name: '4-7-8',
                description: 'Техника 4-7-8',
                instructions: [
                    'Вдох через нос (4 секунды)',
                    'Задержка дыхания (7 секунд)',
                    'Выдох через рот (8 секунд)'
                ],
                phases: [
                    { type: 'inhale', duration: 4, text: 'Вдох' },
                    { type: 'hold', duration: 7, text: 'Задержка' },
                    { type: 'exhale', duration: 8, text: 'Выдох' }
                ]
            },
            'box': {
                name: 'Квадрат',
                description: 'Дыхание по квадрату',
                instructions: [
                    'Вдох (4 секунды)',
                    'Задержка (4 секунды)',
                    'Выдох (4 секунды)',
                    'Задержка (4 секунды)'
                ],
                phases: [
                    { type: 'inhale', duration: 4, text: 'Вдох' },
                    { type: 'hold', duration: 4, text: 'Задержка' },
                    { type: 'exhale', duration: 4, text: 'Выдох' },
                    { type: 'hold', duration: 4, text: 'Задержка' }
                ]
            },
            'calm': {
                name: 'Спокойствие',
                description: 'Медленное дыхание',
                instructions: [
                    'Вдох через нос (5 секунд)',
                    'Выдох через рот (5 секунд)'
                ],
                phases: [
                    { type: 'inhale', duration: 5, text: 'Вдох' },
                    { type: 'exhale', duration: 5, text: 'Выдох' }
                ]
            },
            'energy': {
                name: 'Энергия',
                description: 'Бодрящее дыхание',
                instructions: [
                    'Быстрый вдох (2 секунды)',
                    'Задержка (2 секунды)',
                    'Резкий выдох (2 секунды)'
                ],
                phases: [
                    { type: 'inhale', duration: 2, text: 'Вдох' },
                    { type: 'hold', duration: 2, text: 'Задержка' },
                    { type: 'exhale', duration: 2, text: 'Выдох' }
                ]
            },
            'triangle': {
                name: 'Треугольник',
                description: 'Баланс и гармония',
                instructions: [
                    'Вдох (4 секунды)',
                    'Задержка (4 секунды)',
                    'Выдох (4 секунды)'
                ],
                phases: [
                    { type: 'inhale', duration: 4, text: 'Вдох' },
                    { type: 'hold', duration: 4, text: 'Задержка' },
                    { type: 'exhale', duration: 4, text: 'Выдох' }
                ]
            },
            'deep': {
                name: 'Глубокое',
                description: 'Против тревоги',
                instructions: [
                    'Глубокий вдох (6 секунд)',
                    'Задержка (3 секунды)',
                    'Медленный выдох (6 секунд)',
                    'Пауза (2 секунды)'
                ],
                phases: [
                    { type: 'inhale', duration: 6, text: 'Глубокий вдох' },
                    { type: 'hold', duration: 3, text: 'Задержка' },
                    { type: 'exhale', duration: 6, text: 'Медленный выдох' },
                    { type: 'hold', duration: 2, text: 'Пауза' }
                ]
            }
        };
    }

    init() {
        console.log('🧘 Инициализация дыхательных упражнений');

        // Exercise selection
        document.querySelectorAll('.exercise-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.exercise-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.currentExercise = card.dataset.exercise;
                this.updateInstructions();
                this.reset();
            });
        });

        // Click on breath circle to start/stop
        const breathCircle = document.getElementById('breathCircle');
        if (breathCircle) {
            console.log('✅ Breath circle found, adding click handler');
            breathCircle.style.cursor = 'pointer';
            breathCircle.addEventListener('click', () => {
                console.log('🎯 Circle clicked! isActive:', this.isActive);
                if (!this.isActive) {
                    console.log('▶️ Starting exercise');
                    this.start();
                } else {
                    console.log('⏸️ Stopping exercise');
                    this.stop();
                }
            });
        } else {
            console.error('❌ Breath circle not found!');
        }

        this.updateInstructions();
    }

    updateInstructions() {
        const exercise = this.exercises[this.currentExercise];
        const instructionsDiv = document.getElementById('breathInstructions');
        
        instructionsDiv.innerHTML = `
            <h3>${exercise.description}</h3>
            <ul>
                ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
            </ul>
        `;
    }

    start() {
        console.log('🚀 Start method called');
        this.isActive = true;
        this.currentCycle = 0;

        const text = document.getElementById('breathText');
        text.textContent = 'Приготовьтесь...';

        this.runCycle();
    }

    stop() {
        console.log('⏹️ Stop method called');
        this.isActive = false;

        // Clear any running interval
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }

        this.reset();
    }

    reset() {
        console.log('🔄 Reset method called');
        const circle = document.getElementById('breathCircle');
        const text = document.getElementById('breathText');

        // Reset cycle counter
        this.currentCycle = 0;

        // Remove all animation classes
        circle.className = 'breath-circle';

        // Reset text to initial state
        text.innerHTML = 'Нажмите<br>"Начать"';

        this.updateCounter();
    }

    async runCycle() {
        if (!this.isActive || this.currentCycle >= this.totalCycles) {
            if (this.currentCycle >= this.totalCycles) {
                this.complete();
            }
            return;
        }

        const exercise = this.exercises[this.currentExercise];
        
        for (const phase of exercise.phases) {
            if (!this.isActive) return;
            
            await this.runPhase(phase);
        }

        this.currentCycle++;
        this.updateCounter();
        
        // Continue to next cycle
        setTimeout(() => this.runCycle(), 500);
    }

    runPhase(phase) {
        return new Promise((resolve) => {
            const circle = document.getElementById('breathCircle');
            const text = document.getElementById('breathText');

            circle.className = `breath-circle ${phase.type}`;
            text.textContent = phase.text;

            let timeLeft = phase.duration;

            // Store interval reference so it can be cleared
            this.currentInterval = setInterval(() => {
                timeLeft--;
                text.textContent = `${phase.text} (${timeLeft})`;

                if (timeLeft <= 0 || !this.isActive) {
                    clearInterval(this.currentInterval);
                    this.currentInterval = null;
                    resolve();
                }
            }, 1000);
        });
    }

    updateCounter() {
        const counter = document.getElementById('breathCounter');
        counter.textContent = `Циклов: ${this.currentCycle} / ${this.totalCycles}`;
    }

    complete() {
        console.log('✅ Exercise completed!');
        this.isActive = false;

        const circle = document.getElementById('breathCircle');
        const text = document.getElementById('breathText');

        circle.className = 'breath-circle';
        text.innerHTML = '✨ Отлично!<br>Нажмите для<br>повтора';

        this.showToast('🎉 Упражнение завершено!');
        this.currentCycle = 0;
        this.updateCounter();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 15px;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Export
window.breathingExercises = new BreathingExercises();