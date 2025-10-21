// Events page functionality

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initEventCards();
    initScrollArrows();
});

// Navigation functionality
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Here you can add routing logic or content switching
            console.log('Navigation clicked:', item.querySelector('span')?.textContent);
        });
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterEvents(searchTerm);
    });
}

// Filter events based on search
function filterEvents(searchTerm) {
    const eventCards = document.querySelectorAll('.event-card');

    eventCards.forEach(card => {
        const title = card.querySelector('.event-title')?.textContent.toLowerCase() || '';
        const location = card.querySelector('.event-location')?.textContent.toLowerCase() || '';

        if (title.includes(searchTerm) || location.includes(searchTerm)) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Event card interactions
function initEventCards() {
    const eventCards = document.querySelectorAll('.event-card');

    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.event-title').textContent;
            const price = card.querySelector('.event-price').textContent;
            const location = card.querySelector('.event-location').textContent;

            // Show event details (you can customize this)
            showEventModal(title, location, price);
        });
    });
}

// Show event details modal
function showEventModal(title, location, price) {
    // Simple alert for now - you can create a proper modal
    const message = `${title}\n${location}\n${price}`;

    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        padding: 32px 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        z-index: 1000;
        max-width: 400px;
        width: 90%;
        color: white;
        border: 1px solid rgba(160, 255, 0, 0.2);
    `;

    notification.innerHTML = `
        <h3 style="font-size: 24px; margin-bottom: 16px; color: #A0FF00;">${title}</h3>
        <p style="font-size: 16px; color: #888; margin-bottom: 12px;">${location}</p>
        <p style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">${price}</p>
        <button onclick="this.parentElement.remove(); document.querySelector('.modal-overlay').remove();"
                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #A0FF00 0%, #00D084 100%);
                       border: none; border-radius: 12px; color: #000; font-size: 16px; font-weight: 700;
                       cursor: pointer; transition: transform 0.2s;">
            Купить билет
        </button>
        <button onclick="this.parentElement.remove(); document.querySelector('.modal-overlay').remove();"
                style="width: 100%; margin-top: 12px; padding: 14px; background: transparent;
                       border: 1px solid #333; border-radius: 12px; color: #888; font-size: 14px;
                       cursor: pointer;">
            Закрыть
        </button>
    `;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 999;
    `;

    overlay.addEventListener('click', () => {
        notification.remove();
        overlay.remove();
    });

    document.body.appendChild(overlay);
    document.body.appendChild(notification);

    // Animation
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';

    requestAnimationFrame(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

// Scroll arrows functionality
function initScrollArrows() {
    const sections = document.querySelectorAll('.events-section');

    sections.forEach(section => {
        const prevBtn = section.querySelector('.nav-arrow.prev');
        const nextBtn = section.querySelector('.nav-arrow.next');
        const grid = section.querySelector('.events-grid');

        if (!prevBtn || !nextBtn || !grid) return;

        prevBtn.addEventListener('click', () => {
            grid.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            grid.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });

        // Enable horizontal scroll on grid
        grid.style.overflowX = 'auto';
        grid.style.scrollSnapType = 'x mandatory';
        grid.style.webkitOverflowScrolling = 'touch';

        // Hide scrollbar but keep functionality
        const style = document.createElement('style');
        style.textContent = `
            .events-grid::-webkit-scrollbar {
                display: none;
            }
            .events-grid {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    });
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const activeCard = document.activeElement;

    if (activeCard.classList.contains('event-card')) {
        const cards = Array.from(document.querySelectorAll('.event-card'));
        const currentIndex = cards.indexOf(activeCard);

        if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
            cards[currentIndex + 1].focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            cards[currentIndex - 1].focus();
        } else if (e.key === 'Enter') {
            activeCard.click();
        }
    }
});

// Make cards focusable
document.querySelectorAll('.event-card').forEach(card => {
    card.setAttribute('tabindex', '0');
});

// Add hover effect enhancement
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Add smooth reveal animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.event-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

console.log('Events page initialized successfully!');
