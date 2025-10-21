// Аналитика и графики
class AnalyticsManager {
    constructor() {
        this.chart = null;
        this.currentPeriod = 'week';
    }

    init() {
        console.log('📊 Инициализация аналитики');

        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateAnalytics();
            });
        });

        this.updateAnalytics();
    }

    updateAnalytics() {
        const moodEntries = window.moodDiary ? window.moodDiary.getMoodEntries() : [];
        
        this.updateChart(moodEntries);
        this.updateStats(moodEntries);
        this.updateTriggers(moodEntries);
    }

    updateChart(entries) {
        const ctx = document.getElementById('moodChart');
        if (!ctx) return;

        // Prepare data
        const days = this.currentPeriod === 'week' ? 7 : 30;
        const labels = [];
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            labels.push(dateStr);

            // Find mood for this day
            const dayEntries = entries.filter(e => {
                const entryDate = new Date(e.date);
                return entryDate.toDateString() === date.toDateString();
            });

            if (dayEntries.length > 0) {
                const avgMood = dayEntries.reduce((sum, e) => sum + e.mood.level, 0) / dayEntries.length;
                data.push(avgMood);
            } else {
                data.push(null);
            }
        }

        // Destroy old chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Настроение',
                    data: data,
                    borderColor: '#007aff',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const moods = ['', '😢', '😔', '😐', '🙂', '😄'];
                                return moods[value] || '';
                            }
                        }
                    }
                }
            }
        });
    }

    updateStats(entries) {
        // Average mood
        if (entries.length > 0) {
            const avgMood = entries.reduce((sum, e) => sum + e.mood.level, 0) / entries.length;
            document.getElementById('avgMood').textContent = avgMood.toFixed(1);
        } else {
            document.getElementById('avgMood').textContent = '-';
        }

        // Total entries
        document.getElementById('totalEntries').textContent = entries.length;

        // Best day
        if (entries.length > 0) {
            const bestEntry = entries.reduce((best, e) => 
                e.mood.level > best.mood.level ? e : best
            );
            const date = new Date(bestEntry.date);
            document.getElementById('bestDay').textContent = date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short' 
            });
        } else {
            document.getElementById('bestDay').textContent = '-';
        }

        // Streak
        const streak = this.calculateStreak(entries);
        document.getElementById('streak').textContent = streak;
    }

    calculateStreak(entries) {
        if (entries.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            
            const hasEntry = entries.some(e => {
                const entryDate = new Date(e.date);
                return entryDate.toDateString() === checkDate.toDateString();
            });
            
            if (hasEntry) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    updateTriggers(entries) {
        const triggersList = document.getElementById('triggersList');
        if (!triggersList) return;

        // Count tags
        const tagCounts = {};
        entries.forEach(entry => {
            if (entry.tags) {
                entry.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // Sort by count
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedTags.length === 0) {
            triggersList.innerHTML = '<div class="ios-list-item"><div class="list-item-text" style="color: #8e8e93;">Нет данных</div></div>';
            return;
        }

        triggersList.innerHTML = '';
        sortedTags.forEach(([tag, count]) => {
            const item = document.createElement('div');
            item.className = 'trigger-item';
            item.innerHTML = `
                <div class="trigger-name">${tag}</div>
                <div class="trigger-count">${count}</div>
            `;
            triggersList.appendChild(item);
        });
    }
}

// Export
window.analyticsManager = new AnalyticsManager();