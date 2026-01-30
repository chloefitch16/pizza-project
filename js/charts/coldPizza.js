/**
 * Cold Pizza Preference Visualization
 * Displays willingness to eat cold pizza with animated bars
 */

import anime from 'animejs';

/**
 * Create cold pizza preference visualization
 * @param {HTMLElement} container - Container element
 * @param {Object} coldPizzaData - Cold pizza data { items, total }
 */
export function createColdPizzaChart(container, coldPizzaData) {
  const { items, total } = coldPizzaData;

  const barsHTML = items.map((item, index) => {
    // Use actual percentage so bars are proportional to real data
    const width = item.percentage;
    const emoji = getEmoji(item.label);

    return `
      <div class="cold-bar-item" data-index="${index}">
        <div class="cold-bar-info">
          <span class="cold-emoji">${emoji}</span>
          <span class="cold-bar-label">${item.label}</span>
        </div>
        <div class="cold-bar">
          <div class="cold-bar-fill ${getColorClass(item.label)}"
               style="--width: ${width}%"
               data-width="${width}">
            <span class="cold-bar-value">${item.count}</span>
          </div>
        </div>
        <div class="cold-percentage">${item.percentage}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cold-pizza-section">
      <h2 class="section-title">Cold Pizza? 🥶🍕</h2>
      <div class="card">
        <div class="cold-pizza-visualization">
          <div class="cold-pizza-bars">
            ${barsHTML}
          </div>
        </div>
        <p style="text-align: center; margin-top: var(--space-lg); color: var(--text-secondary);">
          ${total} responses on the great cold pizza debate
        </p>
      </div>
    </div>
  `;

  // Add extra styles
  addColdPizzaStyles();

  // Animate bars on scroll
  animateColdPizzaBars(container);
}

/**
 * Get emoji for cold pizza preference
 */
function getEmoji(label) {
  const emojiMap = {
    'Leftovers Please!': '🤤',
    'If Desperate': '🤷',
    'Never!': '🙅'
  };
  return emojiMap[label] || '🍕';
}

/**
 * Get color class for preference
 */
function getColorClass(label) {
  if (label.includes('Leftover') || label.includes('Please')) return 'hot';
  if (label.includes('Desperate') || label.includes('Maybe')) return 'warm';
  return 'cold';
}

/**
 * Add cold pizza specific styles
 */
function addColdPizzaStyles() {
  if (document.getElementById('cold-pizza-styles')) return;

  const style = document.createElement('style');
  style.id = 'cold-pizza-styles';
  style.textContent = `
    .cold-pizza-visualization {
      max-width: 600px;
      margin: 0 auto;
    }
    .cold-pizza-bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .cold-bar-item {
      display: grid;
      grid-template-columns: 180px 1fr 60px;
      align-items: center;
      gap: var(--space-md);
      opacity: 0;
      transform: translateX(-20px);
    }
    .cold-bar-info {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .cold-emoji {
      font-size: var(--text-2xl);
    }
    .cold-bar-label {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }
    .cold-bar {
      height: 40px;
      background: var(--bg-warm);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .cold-bar-fill {
      height: 100%;
      width: 0;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: var(--space-md);
      transition: width 1s ease-out;
    }
    .cold-bar-fill.hot {
      background: linear-gradient(90deg, var(--pesto-green), var(--pesto-green-light));
    }
    .cold-bar-fill.warm {
      background: linear-gradient(90deg, var(--cheese-yellow-dark), var(--cheese-yellow));
    }
    .cold-bar-fill.cold {
      background: linear-gradient(90deg, var(--pizza-red-dark), var(--pizza-red));
    }
    .cold-bar-value {
      color: var(--text-inverse);
      font-weight: var(--font-bold);
      font-size: var(--text-sm);
    }
    .cold-percentage {
      font-weight: var(--font-bold);
      color: var(--text-secondary);
      text-align: right;
    }

    @media (max-width: 600px) {
      .cold-bar-item {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }
      .cold-bar-info {
        justify-content: center;
      }
      .cold-percentage {
        text-align: center;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Animate cold pizza bars on scroll
 */
function animateColdPizzaBars(container) {
  const barItems = container.querySelectorAll('.cold-bar-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBars(barItems);
        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  observer.observe(container.querySelector('.cold-pizza-bars'));
}

/**
 * Animate all bar items
 */
function animateBars(barItems) {
  barItems.forEach((item, index) => {
    // Animate item entrance
    anime({
      targets: item,
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 600,
      easing: 'easeOutExpo',
      delay: index * 150
    });

    // Animate bar fill
    const bar = item.querySelector('.cold-bar-fill');
    const width = bar.dataset.width;

    anime({
      targets: bar,
      width: ['0%', `${width}%`],
      duration: 1000,
      easing: 'easeOutExpo',
      delay: index * 150 + 300
    });

    // Animate emoji
    const emoji = item.querySelector('.cold-emoji');
    anime({
      targets: emoji,
      scale: [0, 1.2, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .5)',
      delay: index * 150 + 100
    });
  });
}

/**
 * Create thermometer-style visualization (alternative)
 * @param {HTMLElement} container - Container element
 * @param {Object} coldPizzaData - Cold pizza data
 */
export function createThermometerChart(container, coldPizzaData) {
  const { items } = coldPizzaData;

  // Calculate "warmth" score - higher if more people love cold pizza
  const leftoversItem = items.find(i => i.label.includes('Leftover'));
  const warmthScore = leftoversItem ? leftoversItem.percentage : 50;

  container.innerHTML = `
    <div class="cold-pizza-section">
      <h2 class="section-title">Cold Pizza Approval ❄️🍕</h2>
      <div class="card">
        <div class="thermometer-display">
          <div class="thermometer-visual">
            <div class="thermometer-tube">
              <div class="thermometer-fill" style="--height: ${warmthScore}%"></div>
              <div class="thermometer-marks">
                <span class="mark" style="bottom: 75%">🔥</span>
                <span class="mark" style="bottom: 50%">😐</span>
                <span class="mark" style="bottom: 25%">🥶</span>
              </div>
            </div>
            <div class="thermometer-bulb"></div>
          </div>
          <div class="thermometer-result">
            <div class="result-percentage">${warmthScore}%</div>
            <div class="result-label">
              ${warmthScore >= 60 ? 'Cold pizza lovers!' : warmthScore >= 40 ? 'Divided opinions' : 'Prefer it hot!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add thermometer styles
  if (!document.getElementById('thermometer-styles')) {
    const style = document.createElement('style');
    style.id = 'thermometer-styles';
    style.textContent = `
      .thermometer-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2xl);
        padding: var(--space-xl);
      }
      .thermometer-visual {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .thermometer-tube {
        width: 40px;
        height: 200px;
        background: var(--bg-warm);
        border-radius: 20px 20px 0 0;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
      }
      .thermometer-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 0;
        background: linear-gradient(to top,
          var(--temp-cold) 0%,
          var(--temp-warm) 50%,
          var(--temp-hot) 100%
        );
        transition: height 2s ease-out;
      }
      .thermometer-marks {
        position: absolute;
        right: -30px;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: var(--space-sm) 0;
      }
      .mark {
        font-size: var(--text-lg);
      }
      .thermometer-bulb {
        width: 60px;
        height: 60px;
        background: var(--temp-cold);
        border-radius: 50%;
        margin-top: -10px;
        box-shadow: var(--shadow-md);
      }
      .thermometer-result {
        text-align: center;
      }
      .result-percentage {
        font-family: var(--font-display);
        font-size: var(--text-5xl);
        color: var(--pizza-red);
      }
      .result-label {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin-top: var(--space-sm);
      }
    `;
    document.head.appendChild(style);
  }

  // Animate thermometer fill
  setTimeout(() => {
    const fill = container.querySelector('.thermometer-fill');
    if (fill) {
      anime({
        targets: fill,
        height: ['0%', `${warmthScore}%`],
        duration: 2000,
        easing: 'easeOutExpo'
      });
    }
  }, 500);
}
