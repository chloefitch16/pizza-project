/**
 * Emoji Feeling Cards
 * Displays post-pizza feelings with animated emoji cards
 */

import anime from 'animejs';

/**
 * Create emoji feeling cards visualization
 * @param {HTMLElement} container - Container element
 * @param {Object} feelingsData - Feelings data { items, total }
 */
export function createEmojiCards(container, feelingsData) {
  const { items, total } = feelingsData;

  const cardsHTML = items.map((item, index) => `
    <div class="emoji-card animate-on-scroll" style="--delay: ${index * 150}ms">
      <span class="emoji-icon" role="img" aria-label="${item.feeling}">${item.emoji}</span>
      <div class="emoji-label">${item.feeling}</div>
      <div class="emoji-bar">
        <div class="emoji-bar-fill"
             style="background-color: ${item.color}; --fill-width: ${item.percentage}%"
             data-percentage="${item.percentage}">
        </div>
      </div>
      <div class="emoji-percentage" style="color: ${item.color}">${item.percentage}%</div>
      <div class="emoji-count">${item.count} responses</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="emoji-section">
      <h2 class="section-title">How Did You Feel After? 😋</h2>
      <div class="emoji-grid">
        ${cardsHTML}
      </div>
    </div>
  `;

  // Add count styles
  if (!document.getElementById('emoji-count-styles')) {
    const style = document.createElement('style');
    style.id = 'emoji-count-styles';
    style.textContent = `
      .emoji-count {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-top: var(--space-xs);
      }
    `;
    document.head.appendChild(style);
  }

  // Animate cards when they become visible
  animateCardsOnScroll(container);
}

/**
 * Animate cards when they scroll into view
 * @param {HTMLElement} container - Container element
 */
function animateCardsOnScroll(container) {
  const cards = container.querySelectorAll('.emoji-card');
  const bars = container.querySelectorAll('.emoji-bar-fill');

  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.classList.add('visible');

        // Animate card entrance
        anime({
          targets: card,
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutExpo',
          delay: parseInt(card.style.getPropertyValue('--delay')) || 0
        });

        // Animate emoji bounce
        const emoji = card.querySelector('.emoji-icon');
        if (emoji) {
          anime({
            targets: emoji,
            scale: [0, 1.2, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .5)',
            delay: (parseInt(card.style.getPropertyValue('--delay')) || 0) + 200
          });
        }

        // Animate bar fill
        const bar = card.querySelector('.emoji-bar-fill');
        if (bar) {
          const percentage = bar.dataset.percentage;
          anime({
            targets: bar,
            width: ['0%', `${percentage}%`],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: (parseInt(card.style.getPropertyValue('--delay')) || 0) + 400
          });
        }

        // Animate percentage counter
        const percentageEl = card.querySelector('.emoji-percentage');
        if (percentageEl) {
          const targetValue = parseInt(card.querySelector('.emoji-bar-fill').dataset.percentage);
          const obj = { value: 0 };
          anime({
            targets: obj,
            value: targetValue,
            duration: 1000,
            easing: 'easeOutExpo',
            delay: (parseInt(card.style.getPropertyValue('--delay')) || 0) + 400,
            update: () => {
              percentageEl.textContent = `${Math.round(obj.value)}%`;
            }
          });
        }

        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => observer.observe(card));
}

/**
 * Create a more detailed feelings breakdown
 * @param {HTMLElement} container - Container element
 * @param {Object} feelingsData - Feelings data
 */
export function createFeelingsPieChart(container, feelingsData) {
  const { items, total } = feelingsData;

  // Calculate cumulative percentages for pie chart
  let cumulativePercent = 0;
  const segments = items.map(item => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.percentage;
    return {
      ...item,
      startPercent,
      endPercent: cumulativePercent
    };
  });

  // Create SVG pie chart
  const pieSegments = segments.map(segment => {
    const startAngle = (segment.startPercent / 100) * 360 - 90;
    const endAngle = (segment.endPercent / 100) * 360 - 90;
    const largeArcFlag = (segment.endPercent - segment.startPercent) > 50 ? 1 : 0;

    const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
    const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
    const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
    const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

    return `
      <path d="M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z"
            fill="${segment.color}"
            class="pie-segment"
            data-feeling="${segment.feeling}">
        <title>${segment.feeling}: ${segment.percentage}%</title>
      </path>
    `;
  }).join('');

  container.innerHTML = `
    <div class="feelings-pie">
      <svg viewBox="0 0 200 200" class="feelings-pie-svg">
        ${pieSegments}
        <circle cx="100" cy="100" r="40" fill="var(--bg-card)"></circle>
        <text x="100" y="95" text-anchor="middle" class="pie-center-emoji">🍕</text>
        <text x="100" y="115" text-anchor="middle" class="pie-center-text">${total}</text>
      </svg>
    </div>
  `;

  // Add styles
  if (!document.getElementById('pie-styles')) {
    const style = document.createElement('style');
    style.id = 'pie-styles';
    style.textContent = `
      .feelings-pie {
        max-width: 300px;
        margin: 0 auto;
      }
      .feelings-pie-svg {
        width: 100%;
        height: auto;
      }
      .pie-segment {
        cursor: pointer;
        transition: transform var(--transition-fast), filter var(--transition-fast);
        transform-origin: center;
      }
      .pie-segment:hover {
        filter: brightness(1.1);
        transform: scale(1.02);
      }
      .pie-center-emoji {
        font-size: 24px;
      }
      .pie-center-text {
        font-family: var(--font-display);
        font-size: 14px;
        fill: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  }
}
