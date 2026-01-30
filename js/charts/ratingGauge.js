/**
 * Rating Gauge Chart
 * Displays average pizza rating with animated counter and SVG gauge
 */

import anime from 'animejs';

/**
 * Create the rating gauge visualization
 * @param {HTMLElement} container - Container element
 * @param {Object} ratingData - Rating data { average, count, distribution }
 */
export function createRatingGauge(container, ratingData) {
  const { average, count } = ratingData;

  // Create HTML structure
  container.innerHTML = `
    <div class="hero-section">
      <h2 class="hero-title">The Verdict Is In...</h2>
      <div class="rating-display">
        <div class="rating-number">
          <span class="rating-value" id="rating-counter">0</span>
          <span class="rating-max">/10</span>
        </div>
        <div class="pizza-gauge">
          <svg viewBox="0 0 200 200" aria-label="Pizza rating gauge showing ${average} out of 10">
            <circle class="pizza-gauge-bg" cx="100" cy="100" r="90"></circle>
            <circle class="pizza-gauge-fill" id="gauge-fill" cx="100" cy="100" r="90"></circle>
          </svg>
          <div class="pizza-gauge-center">🍕</div>
        </div>
      </div>
      <p style="margin-top: var(--space-lg); color: var(--text-secondary);">
        Based on <strong>${count}</strong> delicious reviews
      </p>
    </div>
  `;

  // Animate counter
  animateCounter(average);

  // Animate gauge
  animateGauge(average);
}

/**
 * Animate the rating counter
 * @param {number} targetValue - Target rating value
 */
function animateCounter(targetValue) {
  const counter = document.getElementById('rating-counter');
  if (!counter) return;

  const obj = { value: 0 };

  anime({
    targets: obj,
    value: targetValue,
    duration: 2000,
    easing: 'easeOutExpo',
    update: () => {
      counter.textContent = obj.value.toFixed(1);
    }
  });
}

/**
 * Animate the circular gauge
 * @param {number} rating - Rating value (1-10)
 */
function animateGauge(rating) {
  const gauge = document.getElementById('gauge-fill');
  if (!gauge) return;

  const circumference = 2 * Math.PI * 90; // r=90
  const percentage = rating / 10;
  const offset = circumference * (1 - percentage);

  gauge.style.strokeDasharray = circumference;
  gauge.style.strokeDashoffset = circumference;

  anime({
    targets: gauge,
    strokeDashoffset: offset,
    duration: 2000,
    easing: 'easeOutExpo',
    delay: 300
  });

  // Add color transition based on rating
  const colors = getGaugeColor(rating);
  anime({
    targets: gauge,
    stroke: [colors.start, colors.end],
    duration: 2000,
    easing: 'linear'
  });
}

/**
 * Get gauge color based on rating
 * @param {number} rating - Rating value
 * @returns {Object} - Start and end colors
 */
function getGaugeColor(rating) {
  if (rating >= 8) {
    return { start: '#F4D03F', end: '#27AE60' }; // Gold to green
  } else if (rating >= 6) {
    return { start: '#F4D03F', end: '#F39C12' }; // Gold to orange
  } else {
    return { start: '#F4D03F', end: '#C0392B' }; // Gold to red
  }
}

/**
 * Create a mini rating distribution chart
 * @param {HTMLElement} container - Container element
 * @param {Object} distribution - Rating distribution { 1: count, 2: count, ... }
 */
export function createRatingDistribution(container, distribution) {
  const maxCount = Math.max(...Object.values(distribution));

  const bars = Object.entries(distribution)
    .map(([rating, count]) => {
      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
      return `
        <div class="dist-bar-wrapper">
          <div class="dist-bar" style="--height: ${height}%">
            <span class="dist-count">${count}</span>
          </div>
          <span class="dist-label">${rating}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="rating-distribution">
      <h4>Rating Distribution</h4>
      <div class="dist-bars">${bars}</div>
    </div>
  `;

  // Add styles if not already present
  if (!document.getElementById('rating-dist-styles')) {
    const style = document.createElement('style');
    style.id = 'rating-dist-styles';
    style.textContent = `
      .rating-distribution {
        margin-top: var(--space-xl);
        padding: var(--space-lg);
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }
      .rating-distribution h4 {
        text-align: center;
        margin-bottom: var(--space-md);
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }
      .dist-bars {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: var(--space-xs);
        height: 100px;
      }
      .dist-bar-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
      }
      .dist-bar {
        width: 24px;
        height: var(--height);
        background: linear-gradient(to top, var(--pizza-red), var(--cheese-yellow));
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        min-height: 4px;
        transition: height 0.5s ease-out;
      }
      .dist-count {
        font-size: var(--text-xs);
        color: var(--text-inverse);
        font-weight: var(--font-bold);
        transform: translateY(-16px);
      }
      .dist-label {
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  }

  // Animate bars
  setTimeout(() => {
    const bars = container.querySelectorAll('.dist-bar');
    bars.forEach((bar, index) => {
      anime({
        targets: bar,
        height: [0, bar.style.getPropertyValue('--height')],
        duration: 800,
        delay: index * 50,
        easing: 'easeOutElastic(1, .8)'
      });
    });
  }, 100);
}
