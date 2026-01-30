/**
 * Pizza Popularity Chart
 * Displays pizza type popularity using Chart.js doughnut chart
 */

import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPizzaColor } from '../dataProcessor.js';

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

let popularityChart = null;

/**
 * Create the pizza popularity chart
 * @param {HTMLElement} container - Container element
 * @param {Object} popularityData - Pizza popularity data { items, total }
 */
export function createPizzaPopularityChart(container, popularityData) {
  const { items, total } = popularityData;

  // Create HTML structure
  container.innerHTML = `
    <div class="popularity-section">
      <h2 class="section-title">Most Popular Pizzas 🍕</h2>
      <div class="card">
        <div class="chart-container">
          <canvas id="popularity-chart" aria-label="Pizza popularity chart"></canvas>
        </div>
        <div class="popularity-legend" id="popularity-legend"></div>
        <p style="text-align: center; margin-top: var(--space-md); color: var(--text-secondary); font-size: var(--text-sm);">
          ${total} total selections (some people chose multiple!)
        </p>
      </div>
    </div>
  `;

  const ctx = document.getElementById('popularity-chart');
  if (!ctx) return;

  // Prepare data
  const labels = items.map(item => item.name);
  const data = items.map(item => item.count);
  const colors = items.map(item => getPizzaColor(item.name));

  // Destroy existing chart if any
  if (popularityChart) {
    popularityChart.destroy();
  }

  // Create chart
  popularityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '60%',
      plugins: {
        legend: {
          display: false // We'll create custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(44, 62, 80, 0.9)',
          titleFont: {
            family: "'Nunito', sans-serif",
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: "'Nunito', sans-serif",
            size: 13
          },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const percentage = Math.round((value / total) * 100);
              return ` ${value} votes (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });

  // Create custom legend
  createCustomLegend(items, total);
}

/**
 * Create custom legend for the chart
 * @param {Array} items - Pizza items
 * @param {number} total - Total votes
 */
function createCustomLegend(items, total) {
  const legendContainer = document.getElementById('popularity-legend');
  if (!legendContainer) return;

  const legendHTML = items.map(item => {
    const percentage = Math.round((item.count / total) * 100);
    const color = getPizzaColor(item.name);

    return `
      <div class="legend-item" data-pizza="${item.name}">
        <span class="legend-color" style="background-color: ${color}"></span>
        <span class="legend-text">${item.name}</span>
        <span class="legend-value">${percentage}%</span>
      </div>
    `;
  }).join('');

  legendContainer.innerHTML = legendHTML;

  // Add hover interactions
  const legendItems = legendContainer.querySelectorAll('.legend-item');
  legendItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      if (popularityChart) {
        popularityChart.setActiveElements([{ datasetIndex: 0, index }]);
        popularityChart.update();
      }
    });

    item.addEventListener('mouseleave', () => {
      if (popularityChart) {
        popularityChart.setActiveElements([]);
        popularityChart.update();
      }
    });
  });

  // Add legend styles
  if (!document.getElementById('legend-styles')) {
    const style = document.createElement('style');
    style.id = 'legend-styles';
    style.textContent = `
      .popularity-legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-md);
        margin-top: var(--space-lg);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        background: var(--bg-warm);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .legend-item:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-sm);
      }
      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }
      .legend-text {
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }
      .legend-value {
        font-weight: var(--font-bold);
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Create horizontal bar chart alternative
 * @param {HTMLElement} container - Container element
 * @param {Object} popularityData - Pizza popularity data
 */
export function createHorizontalBarChart(container, popularityData) {
  const { items, total } = popularityData;
  const maxCount = Math.max(...items.map(i => i.count));

  const barsHTML = items.map((item, index) => {
    const percentage = (item.count / maxCount) * 100;
    const votePercentage = Math.round((item.count / total) * 100);
    const color = getPizzaColor(item.name);

    return `
      <div class="h-bar-item" style="--delay: ${index * 100}ms">
        <div class="h-bar-label">${item.name}</div>
        <div class="h-bar-track">
          <div class="h-bar-fill" style="--width: ${percentage}%; background-color: ${color}">
            <span class="h-bar-value">${item.count} (${votePercentage}%)</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="h-bar-chart">
      <h2 class="section-title">Most Popular Pizzas 🍕</h2>
      <div class="card">
        ${barsHTML}
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('h-bar-styles')) {
    const style = document.createElement('style');
    style.id = 'h-bar-styles';
    style.textContent = `
      .h-bar-item {
        margin-bottom: var(--space-md);
        animation: fadeInLeft 0.5s ease-out forwards;
        animation-delay: var(--delay);
        opacity: 0;
      }
      .h-bar-label {
        font-weight: var(--font-semibold);
        margin-bottom: var(--space-xs);
        color: var(--text-primary);
      }
      .h-bar-track {
        height: 36px;
        background: var(--bg-warm);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .h-bar-fill {
        height: 100%;
        width: var(--width);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: var(--space-md);
        transition: width 1s ease-out;
      }
      .h-bar-value {
        color: var(--text-inverse);
        font-weight: var(--font-bold);
        font-size: var(--text-sm);
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }
}
