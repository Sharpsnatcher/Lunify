// Трекер привычек
class HabitsTracker {
    constructor() {
        // Безопасная загрузка данных
        try {
            this.habits = JSON.parse(localStorage.getItem('habits') || '[]');
        } catch (error) {
            console.error('Ошибка загрузки привычек:', error);
            localStorage.removeItem('habits');
            this.habits = [];
        }
        this.selectedIcon = '💧';
    }

    init() {
        console.log('✓ Инициализация трекера привычек');

        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        document.getElementById('closeHabitModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Icon selection
        document.querySelectorAll('.habit-icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.habit-icon-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedIcon = btn.dataset.icon;
            });
        });

        // Save habit
        document.getElementById('saveHabitBtn').addEventListener('click', () => {
            this.saveHabit();
        });

        // Load default habits if empty
        if (this.habits.length === 0) {
            this.loadDefaultHabits();
        }

        this.displayHabits();
    }

    loadDefaultHabits() {
        this.habits = [
            {
                id: Date.now(),
                name: 'Выпить воду',
                icon: '💧',
                streak: 0,
                completedDates: []
            },
            {
                id: Date.now() + 1,
                name: 'Медитация',
                icon: '🧘',
                streak: 0,
                completedDates: []
            },
            {
                id: Date.now() + 2,
                name: 'Упражнения',
                icon: '🏃',
                streak: 0,
                completedDates: []
            }
        ];
        this.saveToStorage();
    }

    openModal() {
        document.getElementById('addHabitModal').classList.add('show');
        document.getElementById('habitNameInput').value = '';
        document.querySelectorAll('.habit-icon-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector('.habit-icon-btn').classList.add('selected');
        this.selectedIcon = '💧';
    }

    closeModal() {
        document.getElementById('addHabitModal').classList.remove('show');
    }

    saveHabit() {
        const name = document.getElementById('habitNameInput').value.trim();
        
        if (!name) {
            alert('Введите название привычки');
            return;
        }

        const habit = {
            id: Date.now(),
            name: name,
            icon: this.selectedIcon,
            streak: 0,
            completedDates: []
        };

        this.habits.push(habit);
        this.saveToStorage();
        this.displayHabits();
        this.closeModal();
        this.showToast('✅ Привычка добавлена!');
    }

    displayHabits() {
        const list = document.getElementById('habitsList');
        
        if (this.habits.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #8e8e93;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                    <div>Нажмите "+" чтобы добавить привычку</div>
                </div>
            `;
            return;
        }

        list.innerHTML = '';

        this.habits.forEach(habit => {
            const today = new Date().toDateString();
            const isCompletedToday = habit.completedDates.includes(today);

            const item = document.createElement('div');
            item.className = 'habit-item';
            item.innerHTML = `
                <div class="habit-icon">${habit.icon}</div>
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-streak">🔥 ${habit.streak} дней подряд</div>
                </div>
                <button class="habit-check ${isCompletedToday ? 'completed' : ''}" data-id="${habit.id}">
                    ${isCompletedToday ? '✓' : ''}
                </button>
            `;

            // Check button
            const checkBtn = item.querySelector('.habit-check');
            checkBtn.addEventListener('click', () => {
                this.toggleHabit(habit.id);
            });

            list.appendChild(item);
        });
    }

    toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toDateString();
        const index = habit.completedDates.indexOf(today);

        if (index > -1) {
            // Uncomplete
            habit.completedDates.splice(index, 1);
            habit.streak = Math.max(0, habit.streak - 1);
            this.showToast('❌ Отменено');
        } else {
            // Complete
            habit.completedDates.push(today);
            
            // Calculate streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (habit.completedDates.includes(yesterdayStr)) {
                habit.streak++;
            } else {
                habit.streak = 1;
            }
            
            this.showToast('✅ Отлично!');
        }

        this.saveToStorage();
        this.displayHabits();
    }

    saveToStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
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
window.habitsTracker = new HabitsTracker();