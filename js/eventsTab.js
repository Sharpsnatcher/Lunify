// Events Tab Functionality

class EventsManager {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        console.log('🎭 Events Manager initialized');
        this.attachEventListeners();
        this.initialized = true;
    }

    attachEventListeners() {
        // Get all event cards
        const eventCards = document.querySelectorAll('.event-card');

        eventCards.forEach(card => {
            // Click handler
            card.addEventListener('click', (e) => {
                this.handleEventClick(card);
            });

            // Add ripple effect on click
            card.addEventListener('mousedown', (e) => {
                this.createRipple(e, card);
            });
        });
    }

    handleEventClick(card) {
        const title = card.querySelector('.event-title')?.textContent;
        const location = card.querySelector('.event-location')?.textContent;
        const time = card.querySelector('.event-time')?.textContent;
        const price = card.querySelector('.event-price')?.textContent;
        const spots = card.querySelector('.event-spots')?.textContent;
        const category = card.querySelector('.event-category')?.textContent;

        this.showEventModal({
            title,
            location,
            time,
            price,
            spots,
            category
        });
    }

    showEventModal(event) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'event-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.style.cssText = `
            background: var(--card-bg);
            border-radius: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        modal.innerHTML = `
            <div style="padding: 32px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
                    <div>
                        <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                            ${event.category}
                        </span>
                        <h2 style="font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; margin: 0;">
                            ${event.title}
                        </h2>
                    </div>
                    <button class="modal-close-btn" style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-color); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-secondary); transition: all 0.3s ease;">
                        ✕
                    </button>
                </div>

                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; background: var(--bg-color); border-radius: 12px;">
                        <span style="font-size: 24px;">📍</span>
                        <span style="font-size: 15px; color: var(--text-primary);">${event.location?.replace('📍 ', '')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; background: var(--bg-color); border-radius: 12px;">
                        <span style="font-size: 24px;">⏰</span>
                        <span style="font-size: 15px; color: var(--text-primary);">${event.time?.replace('⏰ ', '')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-color); border-radius: 12px;">
                        <span style="font-size: 24px;">👥</span>
                        <span style="font-size: 15px; color: var(--text-primary);">${event.spots}</span>
                    </div>
                </div>

                <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 16px; border: 2px solid rgba(102, 126, 234, 0.2);">
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Стоимость участия</div>
                    <div style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${event.price}
                    </div>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button class="book-event-btn" style="flex: 1; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease;">
                        Записаться на мероприятие
                    </button>
                    <button class="share-event-btn" style="width: 52px; height: 52px; background: var(--bg-color); border: none; border-radius: 12px; font-size: 20px; cursor: pointer; transition: all 0.3s ease;">
                        🔗
                    </button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add styles for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .modal-close-btn:hover {
                background: #e74c3c !important;
                color: white !important;
                transform: rotate(90deg);
            }
            .book-event-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
            .share-event-btn:hover {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);

        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close-btn');
        const bookBtn = modal.querySelector('.book-event-btn');
        const shareBtn = modal.querySelector('.share-event-btn');

        closeBtn.addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                overlay.remove();
                style.remove();
            }, 300);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeBtn.click();
            }
        });

        bookBtn.addEventListener('click', () => {
            this.bookEvent(event);
            closeBtn.click();
        });

        shareBtn.addEventListener('click', () => {
            this.shareEvent(event);
        });

        // Add exit animation styles
        style.textContent += `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideDown {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(50px) scale(0.95);
                }
            }
        `;
    }

    bookEvent(event) {
        // Show success notification
        this.showNotification(`Вы записаны на "${event.title}"! Подробности отправлены на email.`, 'success');

        // Here you would typically make an API call to book the event
        console.log('Booking event:', event);
    }

    shareEvent(event) {
        // Copy event link to clipboard
        const eventLink = `https://lunify.app/events/${encodeURIComponent(event.title)}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(eventLink).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена!', 'info');
            });
        } else {
            this.showNotification('Ссылка: ' + eventLink, 'info');
        }
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

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => style.remove(), 3500);
    }

    createRipple(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: rippleEffect 0.6s ease-out;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleEffect {
                from {
                    transform: scale(0);
                    opacity: 1;
                }
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            ripple.remove();
            style.remove();
        }, 600);
    }
}

// Initialize events manager
window.eventsManager = new EventsManager();

// Auto-initialize when events tab is shown
document.addEventListener('DOMContentLoaded', () => {
    const eventsTab = document.getElementById('events-tab');
    if (eventsTab) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    window.eventsManager.init();
                }
            });
        });

        observer.observe(eventsTab, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initialize if already active
        if (eventsTab.classList.contains('active')) {
            window.eventsManager.init();
        }
    }
});

console.log('✅ Events Tab Module loaded');
