/**
 * Comments Carousel
 * Rotating display of survey comments/quotes
 */

import anime from 'animejs';

let currentSlide = 0;
let autoplayInterval = null;

/**
 * Create comments carousel
 * @param {HTMLElement} container - Container element
 * @param {Array} comments - Array of comment strings
 */
// Creative pizza-related pseudonyms
const PIZZA_NAMES = [
  'The Crust Whisperer',
  'Pepperoni Prophet',
  'Cheese Champion',
  'Slice Sommelier',
  'Dough Devotee',
  'Saucy Sage',
  'Mozzarella Maven',
  'Crispy Crust Critic',
  'The Pizza Philosopher',
  'Toppings Enthusiast',
  'Deep Dish Dreamer',
  'Margherita Maestro',
  'Cheesy Connoisseur',
  'The Slice Scientist',
  'Oven Oracle'
];

export function createCommentsCarousel(container, comments) {
  if (!comments || comments.length === 0) {
    container.innerHTML = `
      <div class="comments-section">
        <h2 class="section-title">What People Are Saying 💬</h2>
        <div class="card" style="text-align: center; padding: var(--space-2xl);">
          <p style="color: var(--text-secondary);">No comments available</p>
        </div>
      </div>
    `;
    return;
  }

  const slidesHTML = comments.map((comment, index) => `
    <div class="comment-card ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="comment-quote">${escapeHtml(comment)}</div>
      <div class="comment-author">— ${PIZZA_NAMES[index % PIZZA_NAMES.length]}</div>
    </div>
  `).join('');

  const dotsHTML = comments.map((_, index) => `
    <button class="carousel-dot ${index === 0 ? 'active' : ''}"
            data-index="${index}"
            aria-label="Go to slide ${index + 1}">
    </button>
  `).join('');

  container.innerHTML = `
    <div class="comments-section">
      <h2 class="section-title">What People Are Saying 💬</h2>
      <div class="card carousel-card">
        <div class="carousel-container">
          <div class="carousel-track" id="carousel-track">
            ${slidesHTML}
          </div>
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn prev" aria-label="Previous comment">
            ‹
          </button>
          <button class="carousel-btn next" aria-label="Next comment">
            ›
          </button>
        </div>
        <div class="carousel-dots" id="carousel-dots">
          ${dotsHTML}
        </div>
      </div>
    </div>
  `;

  // Add carousel styles
  addCarouselStyles();

  // Initialize carousel functionality
  initCarousel(container, comments.length);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Add carousel-specific styles
 */
function addCarouselStyles() {
  if (document.getElementById('carousel-styles')) return;

  const style = document.createElement('style');
  style.id = 'carousel-styles';
  style.textContent = `
    .carousel-card {
      overflow: hidden;
    }
    .carousel-container {
      position: relative;
      overflow: hidden;
      min-height: 200px;
    }
    .carousel-track {
      display: flex;
      transition: transform 0.5s ease;
    }
    .comment-card {
      flex: 0 0 100%;
      padding: var(--space-xl);
      text-align: center;
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .comment-card.active {
      opacity: 1;
      transform: scale(1);
    }
    .comment-quote {
      font-size: var(--text-xl);
      font-style: italic;
      color: var(--text-primary);
      line-height: var(--leading-relaxed);
      max-width: 600px;
      margin: 0 auto var(--space-lg);
    }
    .comment-quote::before,
    .comment-quote::after {
      color: var(--cheese-yellow);
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      line-height: 0;
      vertical-align: middle;
    }
    .comment-quote::before {
      content: '"';
      margin-right: var(--space-xs);
    }
    .comment-quote::after {
      content: '"';
      margin-left: var(--space-xs);
    }
    .comment-author {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
    .carousel-controls {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .carousel-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: var(--pizza-red);
      color: var(--text-inverse);
      border-radius: var(--radius-round);
      cursor: pointer;
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      transition: all var(--transition-normal);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .carousel-btn:hover {
      background: var(--pizza-red-dark);
      transform: scale(1.1);
    }
    .carousel-btn:active {
      transform: scale(0.95);
    }
    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .carousel-dot {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-round);
      background: var(--bg-warm);
      border: 2px solid var(--bg-warm);
      cursor: pointer;
      transition: all var(--transition-normal);
      padding: 0;
    }
    .carousel-dot:hover {
      background: var(--cheese-yellow);
      border-color: var(--cheese-yellow);
    }
    .carousel-dot.active {
      background: var(--pizza-red);
      border-color: var(--pizza-red);
      transform: scale(1.2);
    }

    @media (max-width: 600px) {
      .comment-quote {
        font-size: var(--text-lg);
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize carousel functionality
 */
function initCarousel(container, totalSlides) {
  currentSlide = 0;

  const track = container.querySelector('#carousel-track');
  const prevBtn = container.querySelector('.carousel-btn.prev');
  const nextBtn = container.querySelector('.carousel-btn.next');
  const dots = container.querySelectorAll('.carousel-dot');
  const cards = container.querySelectorAll('.comment-card');

  // Previous button
  prevBtn?.addEventListener('click', () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides, cards, dots, track);
    resetAutoplay(cards, dots, track, totalSlides);
  });

  // Next button
  nextBtn?.addEventListener('click', () => {
    goToSlide((currentSlide + 1) % totalSlides, cards, dots, track);
    resetAutoplay(cards, dots, track, totalSlides);
  });

  // Dot buttons
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      goToSlide(index, cards, dots, track);
      resetAutoplay(cards, dots, track, totalSlides);
    });
  });

  // Keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide((currentSlide - 1 + totalSlides) % totalSlides, cards, dots, track);
      resetAutoplay(cards, dots, track, totalSlides);
    } else if (e.key === 'ArrowRight') {
      goToSlide((currentSlide + 1) % totalSlides, cards, dots, track);
      resetAutoplay(cards, dots, track, totalSlides);
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(touchStartX, touchEndX, cards, dots, track, totalSlides);
  }, { passive: true });

  // Start autoplay
  startAutoplay(cards, dots, track, totalSlides);

  // Pause on hover
  container.addEventListener('mouseenter', () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  });

  container.addEventListener('mouseleave', () => {
    startAutoplay(cards, dots, track, totalSlides);
  });
}

/**
 * Go to specific slide
 */
function goToSlide(index, cards, dots, track) {
  // Update current slide
  currentSlide = index;

  // Update track position
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // Update cards
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // Animate current card
  const activeCard = cards[index];
  if (activeCard) {
    anime({
      targets: activeCard,
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutExpo'
    });
  }
}

/**
 * Handle swipe gesture
 */
function handleSwipe(startX, endX, cards, dots, track, totalSlides) {
  const threshold = 50;
  const diff = startX - endX;

  if (diff > threshold) {
    // Swipe left - next slide
    goToSlide((currentSlide + 1) % totalSlides, cards, dots, track);
  } else if (diff < -threshold) {
    // Swipe right - previous slide
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides, cards, dots, track);
  }

  resetAutoplay(cards, dots, track, totalSlides);
}

/**
 * Start autoplay
 */
function startAutoplay(cards, dots, track, totalSlides) {
  if (autoplayInterval) return;

  autoplayInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides, cards, dots, track);
  }, 5000);
}

/**
 * Reset autoplay timer
 */
function resetAutoplay(cards, dots, track, totalSlides) {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
  startAutoplay(cards, dots, track, totalSlides);
}

/**
 * Cleanup carousel (call when removing)
 */
export function destroyCarousel() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
  currentSlide = 0;
}
