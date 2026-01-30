/**
 * Tier Ranking Visualization
 * Displays pizza tier rankings with animated podium
 */

import anime from 'animejs';

/**
 * Create tier ranking visualization
 * @param {HTMLElement} container - Container element
 * @param {Object} tierData - Tier ranking data { items, total }
 */
export function createTierRanking(container, tierData) {
  const { items, total } = tierData;

  // Reorder for podium display (Silver, Gold, Bronze)
  const podiumOrder = reorderForPodium(items);

  const podiumHTML = podiumOrder.map((tier, index) => {
    const position = index === 0 ? 'silver' : index === 1 ? 'gold' : 'bronze';
    const height = getBarHeight(tier, podiumOrder);

    return `
      <div class="podium-item ${position}" data-tier="${tier.name}">
        <div class="podium-icon">${tier.icon}</div>
        <div class="podium-label">${tier.name}</div>
        <div class="podium-bar" style="--target-height: ${height}px">
          <span class="podium-count">${tier.count}</span>
        </div>
        <div class="podium-percentage">${tier.percentage}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="tier-section">
      <h2 class="section-title">Pizza Tier Rankings 🏆</h2>
      <div class="card">
        <div class="podium">
          ${podiumHTML}
        </div>
        <p style="text-align: center; margin-top: var(--space-lg); color: var(--text-secondary);">
          Based on ${total} rankings
        </p>
      </div>
    </div>
  `;

  // Add percentage styles
  if (!document.getElementById('podium-extra-styles')) {
    const style = document.createElement('style');
    style.id = 'podium-extra-styles';
    style.textContent = `
      .podium-percentage {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-top: var(--space-xs);
      }
      .podium-bar {
        height: 0;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }

  // Animate podium
  animatePodium(container);
}

/**
 * Reorder items for podium display (2nd, 1st, 3rd)
 * @param {Array} items - Tier items sorted by count
 * @returns {Array} - Reordered items
 */
function reorderForPodium(items) {
  if (items.length < 3) return items;

  // Find items by tier name
  const topTier = items.find(i => i.name === 'Top Tier') || items[0];
  const solid = items.find(i => i.name === 'Solid Choice') || items[1];
  const mid = items.find(i => i.name === 'Mid') || items[2];

  return [solid, topTier, mid]; // Silver, Gold, Bronze positions
}

/**
 * Calculate bar height based on count
 * @param {Object} tier - Tier item
 * @param {Array} allTiers - All tier items
 * @returns {number} - Bar height in pixels
 */
function getBarHeight(tier, allTiers) {
  const maxCount = Math.max(...allTiers.map(t => t.count));
  const minHeight = 60;
  const maxHeight = 150;

  if (maxCount === 0) return minHeight;

  const ratio = tier.count / maxCount;
  return minHeight + (maxHeight - minHeight) * ratio;
}

/**
 * Animate podium bars
 * @param {HTMLElement} container - Container element
 */
function animatePodium(container) {
  const podiumItems = container.querySelectorAll('.podium-item');

  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animatePodiumBars(container);
        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  observer.observe(container.querySelector('.podium'));
}

/**
 * Animate all podium bars
 * @param {HTMLElement} container - Container element
 */
function animatePodiumBars(container) {
  const podiumItems = container.querySelectorAll('.podium-item');

  podiumItems.forEach((item, index) => {
    const bar = item.querySelector('.podium-bar');
    const countEl = item.querySelector('.podium-count');
    const icon = item.querySelector('.podium-icon');
    const targetHeight = bar.style.getPropertyValue('--target-height');
    const targetCount = parseInt(countEl.textContent);

    // Determine animation order (gold first, then others)
    const isGold = item.classList.contains('gold');
    const delay = isGold ? 0 : (index === 0 ? 300 : 600);

    // Animate bar height
    anime({
      targets: bar,
      height: [0, targetHeight],
      duration: 1000,
      easing: 'easeOutElastic(1, .8)',
      delay
    });

    // Animate count
    const countObj = { value: 0 };
    anime({
      targets: countObj,
      value: targetCount,
      duration: 1000,
      easing: 'easeOutExpo',
      delay,
      update: () => {
        countEl.textContent = Math.round(countObj.value);
      }
    });

    // Animate icon
    anime({
      targets: icon,
      scale: [0, 1.3, 1],
      rotate: ['-30deg', '10deg', '0deg'],
      duration: 800,
      easing: 'easeOutElastic(1, .5)',
      delay: delay + 200
    });

    // Add shine effect for gold
    if (isGold) {
      anime({
        targets: bar,
        boxShadow: [
          '0 0 0 rgba(255, 215, 0, 0)',
          '0 0 30px rgba(255, 215, 0, 0.5)',
          '0 0 10px rgba(255, 215, 0, 0.3)'
        ],
        duration: 1500,
        easing: 'easeInOutQuad',
        delay: 1000
      });
    }
  });
}

/**
 * Create alternative horizontal tier display
 * @param {HTMLElement} container - Container element
 * @param {Object} tierData - Tier ranking data
 */
export function createHorizontalTiers(container, tierData) {
  const { items, total } = tierData;
  const maxCount = Math.max(...items.map(i => i.count));

  const tiersHTML = items.map((tier, index) => {
    const width = maxCount > 0 ? (tier.count / maxCount) * 100 : 0;

    return `
      <div class="tier-row" style="--delay: ${index * 200}ms">
        <div class="tier-info">
          <span class="tier-icon">${tier.icon}</span>
          <span class="tier-name">${tier.name}</span>
        </div>
        <div class="tier-bar-track">
          <div class="tier-bar-fill" style="--width: ${width}%; background: ${tier.color}">
            <span class="tier-count">${tier.count}</span>
          </div>
        </div>
        <div class="tier-percentage">${tier.percentage}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="horizontal-tiers">
      <h2 class="section-title">Pizza Tier Rankings 🏆</h2>
      <div class="card">
        ${tiersHTML}
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('h-tier-styles')) {
    const style = document.createElement('style');
    style.id = 'h-tier-styles';
    style.textContent = `
      .tier-row {
        display: grid;
        grid-template-columns: 150px 1fr 60px;
        align-items: center;
        gap: var(--space-md);
        margin-bottom: var(--space-md);
        animation: fadeInLeft 0.5s ease-out forwards;
        animation-delay: var(--delay);
        opacity: 0;
      }
      .tier-info {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .tier-icon {
        font-size: var(--text-2xl);
      }
      .tier-name {
        font-weight: var(--font-semibold);
      }
      .tier-bar-track {
        height: 40px;
        background: var(--bg-warm);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .tier-bar-fill {
        height: 100%;
        width: var(--width);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: var(--space-md);
        transition: width 1s ease-out;
      }
      .tier-count {
        color: var(--text-inverse);
        font-weight: var(--font-bold);
      }
      .tier-percentage {
        font-weight: var(--font-bold);
        color: var(--text-secondary);
        text-align: right;
      }
    `;
    document.head.appendChild(style);
  }
}
