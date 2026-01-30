/**
 * Order Again Visualization
 * Displays "Would you order again?" responses
 */

import anime from 'animejs';

/**
 * Create order again visualization
 * @param {HTMLElement} container - Container element
 * @param {Object} orderData - Order again data { yes, meh, total }
 */
export function createOrderAgainChart(container, orderData) {
  const { yes, meh, total } = orderData;

  container.innerHTML = `
    <div class="order-again-section">
      <h2 class="section-title">Would You Order Again? 🍕</h2>
      <div class="order-again-grid">
        <div class="order-card yes" data-count="${yes.count}">
          <div class="order-icon">😍</div>
          <div class="order-label">YES!</div>
          <div class="order-count" id="yes-count">0</div>
          <div class="order-percentage">${yes.percentage}%</div>
        </div>
        <div class="order-card meh" data-count="${meh.count}">
          <div class="order-icon">🤷‍♀️</div>
          <div class="order-label">Meh...</div>
          <div class="order-count" id="meh-count">0</div>
          <div class="order-percentage">${meh.percentage}%</div>
        </div>
      </div>
      <p style="text-align: center; margin-top: var(--space-lg); color: var(--text-secondary);">
        ${total} responses
      </p>
    </div>
  `;

  // Add percentage styles
  if (!document.getElementById('order-percentage-styles')) {
    const style = document.createElement('style');
    style.id = 'order-percentage-styles';
    style.textContent = `
      .order-percentage {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-top: var(--space-xs);
      }
    `;
    document.head.appendChild(style);
  }

  // Animate on scroll
  animateOrderCards(container, yes.count, meh.count);
}

/**
 * Animate order cards
 */
function animateOrderCards(container, yesCount, mehCount) {
  const cards = container.querySelectorAll('.order-card');
  const yesCountEl = document.getElementById('yes-count');
  const mehCountEl = document.getElementById('meh-count');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate cards
        anime({
          targets: cards,
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .8)',
          delay: anime.stagger(200)
        });

        // Animate yes count
        const yesObj = { value: 0 };
        anime({
          targets: yesObj,
          value: yesCount,
          duration: 1500,
          easing: 'easeOutExpo',
          delay: 300,
          update: () => {
            if (yesCountEl) yesCountEl.textContent = Math.round(yesObj.value);
          }
        });

        // Animate meh count
        const mehObj = { value: 0 };
        anime({
          targets: mehObj,
          value: mehCount,
          duration: 1500,
          easing: 'easeOutExpo',
          delay: 500,
          update: () => {
            if (mehCountEl) mehCountEl.textContent = Math.round(mehObj.value);
          }
        });

        // Animate icons
        anime({
          targets: '.order-icon',
          scale: [0, 1.2, 1],
          duration: 800,
          easing: 'easeOutElastic(1, .5)',
          delay: anime.stagger(200, { start: 400 })
        });

        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  observer.observe(container.querySelector('.order-again-grid'));
}

/**
 * Create pizza box stack visualization (alternative)
 * @param {HTMLElement} container - Container element
 * @param {Object} orderData - Order again data
 */
export function createPizzaBoxStack(container, orderData) {
  const { yes, meh } = orderData;
  const maxBoxes = 10;

  const yesBoxes = Math.round((yes.percentage / 100) * maxBoxes);
  const mehBoxes = Math.round((meh.percentage / 100) * maxBoxes);

  const yesBoxesHTML = Array(yesBoxes).fill(0).map((_, i) => `
    <div class="pizza-box yes-box" style="--delay: ${i * 100}ms">🍕</div>
  `).join('');

  const mehBoxesHTML = Array(mehBoxes).fill(0).map((_, i) => `
    <div class="pizza-box meh-box" style="--delay: ${i * 100}ms">🍕</div>
  `).join('');

  container.innerHTML = `
    <div class="box-stack-section">
      <h2 class="section-title">Would You Order Again? 🍕</h2>
      <div class="card">
        <div class="box-stacks">
          <div class="box-stack">
            <div class="stack-label">YES!</div>
            <div class="boxes yes-stack">${yesBoxesHTML}</div>
            <div class="stack-count">${yes.count} (${yes.percentage}%)</div>
          </div>
          <div class="box-stack">
            <div class="stack-label">Meh</div>
            <div class="boxes meh-stack">${mehBoxesHTML}</div>
            <div class="stack-count">${meh.count} (${meh.percentage}%)</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('box-stack-styles')) {
    const style = document.createElement('style');
    style.id = 'box-stack-styles';
    style.textContent = `
      .box-stacks {
        display: flex;
        justify-content: center;
        gap: var(--space-3xl);
        padding: var(--space-xl);
      }
      .box-stack {
        text-align: center;
      }
      .stack-label {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        margin-bottom: var(--space-md);
      }
      .boxes {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        min-height: 200px;
      }
      .pizza-box {
        font-size: var(--text-2xl);
        margin: -5px 0;
        opacity: 0;
        animation: stackBox 0.3s ease-out forwards;
        animation-delay: var(--delay);
      }
      @keyframes stackBox {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .yes-box { filter: hue-rotate(90deg); }
      .stack-count {
        margin-top: var(--space-md);
        font-weight: var(--font-bold);
        color: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  }
}
