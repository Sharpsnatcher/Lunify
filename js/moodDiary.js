// Дневник настроения
class MoodDiary {
    constructor() {
        this.currentMood = null;
        this.selectedTags = [];
        this.moodEntries = JSON.parse(localStorage.getItem('mood_entries') || '[]');
    }

    init() {
        console.log('📔 Инициализация дневника настроения');
        
        // Mood emoji buttons
        document.querySelectorAll('.mood-emoji').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-emoji').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.currentMood = {
                    level: parseInt(btn.dataset.mood),
                    emoji: btn.dataset.emoji
                };
            });
        });

        // Tag buttons
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                btn.classList.toggle('selected');
                const tag = btn.dataset.tag;
                
                if (this.selectedTags.includes(tag)) {
                    this.selectedTags = this.selectedTags.filter(t => t !== tag);
                } else {
                    this.selectedTags.push(tag);
                }
            });
        });

        // Save button
        document.getElementById('saveMoodBtn').addEventListener('click', () => {
            this.saveMoodEntry();
        });

        this.displayMoodHistory();
    }

    saveMoodEntry() {
        if (!this.currentMood) {
            alert('Пожалуйста, выберите настроение');
            return;
        }

        const note = document.getElementById('moodNote').value.trim();

        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: this.currentMood,
            tags: [...this.selectedTags],
            note: note
        };

        this.moodEntries.unshift(entry);
        localStorage.setItem('mood_entries', JSON.stringify(this.moodEntries));

        // Reset form
        document.querySelectorAll('.mood-emoji').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('moodNote').value = '';
        this.currentMood = null;
        this.selectedTags = [];

        // Show success
        this.showToast('✅ Запись сохранена!');
        
        // Update display
        this.displayMoodHistory();
        
        // Update analytics if available
        if (window.analyticsManager) {
            window.analyticsManager.updateAnalytics();
        }
    }

    displayMoodHistory() {
        const list = document.getElementById('moodHistoryList');
        
        if (this.moodEntries.length === 0) {
            list.innerHTML = '<div class="ios-list-item"><div class="list-item-text" style="color: #8e8e93;">Пока нет записей</div></div>';
            return;
        }

        list.innerHTML = '';
        
        // Show last 10 entries
        this.moodEntries.slice(0, 10).forEach(entry => {
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('ru-RU', { 
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });

            const item = document.createElement('div');
            item.className = 'mood-history-item';
            
            let tagsHtml = '';
            if (entry.tags && entry.tags.length > 0) {
                tagsHtml = '<div class="mood-history-tags">' +
                    entry.tags.map(tag => `<span class="mood-tag">${tag}</span>`).join('') +
                    '</div>';
            }

            let noteHtml = '';
            if (entry.note) {
                noteHtml = `<div class="mood-history-note">${entry.note}</div>`;
            }

            item.innerHTML = `
                <div class="mood-history-emoji">${entry.mood.emoji}</div>
                <div class="mood-history-content">
                    <div class="mood-history-date">${dateStr}</div>
                    ${tagsHtml}
                    ${noteHtml}
                </div>
            `;
            
            list.appendChild(item);
        });
    }

    getMoodEntries() {
        return this.moodEntries;
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
window.moodDiary = new MoodDiary();