/**
 * Word Cloud Visualization
 * Creates an interactive word cloud using D3.js and d3-cloud
 */

import * as d3 from 'd3';
import cloud from 'd3-cloud';

let wordCloudSvg = null;
let tooltip = null;

/**
 * Create word cloud visualization
 * @param {HTMLElement} container - Container element
 * @param {Array} wordData - Word data [{ text, count }, ...]
 */
export function createWordCloud(container, wordData) {
  if (!wordData || wordData.length === 0) {
    container.innerHTML = `
      <div class="wordcloud-section">
        <h2 class="section-title">Describe It In One Word 💬</h2>
        <div class="wordcloud-container">
          <p style="color: var(--text-secondary);">No word data available</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="wordcloud-section">
      <h2 class="section-title">Describe It In One Word 💬</h2>
      <div class="wordcloud-container">
        <div id="wordcloud"></div>
      </div>
    </div>
    <div class="wordcloud-tooltip" id="wordcloud-tooltip"></div>
  `;

  const cloudContainer = document.getElementById('wordcloud');
  tooltip = document.getElementById('wordcloud-tooltip');

  if (!cloudContainer) return;

  // Get container dimensions
  const width = cloudContainer.clientWidth || 600;
  const height = 400;

  // Calculate font sizes based on frequency
  const maxCount = Math.max(...wordData.map(w => w.count));
  const minCount = Math.min(...wordData.map(w => w.count));

  const fontScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range([16, 72]);

  // Prepare words for d3-cloud
  const words = wordData.map(w => ({
    text: w.text,
    size: fontScale(w.count),
    count: w.count
  }));

  // Pizza-themed color palette
  const colors = [
    '#C0392B', // Pizza red
    '#F4D03F', // Cheese yellow
    '#27AE60', // Pesto green
    '#E74C3C', // Light red
    '#F39C12', // Orange
    '#8E44AD', // Purple
    '#2ECC71', // Light green
    '#D35400'  // Dark orange
  ];

  const colorScale = d3.scaleOrdinal(colors);

  // Create the word cloud layout
  const layout = cloud()
    .size([width, height])
    .words(words)
    .padding(5)
    .rotate(() => (Math.random() > 0.7 ? 90 : 0))
    .font("'Nunito', sans-serif")
    .fontSize(d => d.size)
    .spiral('archimedean')
    .on('end', draw);

  layout.start();

  /**
   * Draw the word cloud
   * @param {Array} words - Positioned words from d3-cloud
   */
  function draw(words) {
    // Clear any existing SVG
    d3.select('#wordcloud').selectAll('*').remove();

    wordCloudSvg = d3.select('#wordcloud')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const wordElements = wordCloudSvg.selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', '0px')
      .style('font-family', "'Nunito', sans-serif")
      .style('font-weight', d => d.size > 40 ? '800' : '600')
      .style('fill', (d, i) => colorScale(i))
      .style('cursor', 'pointer')
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .text(d => d.text)
      .on('mouseover', handleMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut)
      .on('click', handleClick);

    // Animate words appearing
    wordElements
      .transition()
      .duration(800)
      .delay((d, i) => i * 30)
      .style('font-size', d => `${d.size}px`)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5));
  }

  /**
   * Handle mouse over event
   */
  function handleMouseOver(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 0.8)
      .style('transform', function() {
        const currentTransform = d3.select(this).attr('transform');
        return currentTransform + ' scale(1.1)';
      });

    if (tooltip) {
      tooltip.innerHTML = `<strong>${d.text}</strong><br>${d.count} mention${d.count > 1 ? 's' : ''}`;
      tooltip.classList.add('visible');
    }
  }

  /**
   * Handle mouse move event
   */
  function handleMouseMove(event) {
    if (tooltip) {
      tooltip.style.left = `${event.pageX + 15}px`;
      tooltip.style.top = `${event.pageY - 10}px`;
    }
  }

  /**
   * Handle mouse out event
   */
  function handleMouseOut(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 1)
      .attr('transform', `translate(${d.x}, ${d.y}) rotate(${d.rotate})`);

    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  /**
   * Handle click event
   */
  function handleClick(event, d) {
    // Pulse animation on click
    d3.select(this)
      .transition()
      .duration(150)
      .style('font-size', `${d.size * 1.3}px`)
      .transition()
      .duration(150)
      .style('font-size', `${d.size}px`);
  }
}

/**
 * Create a simple word list alternative (for accessibility or fallback)
 * @param {HTMLElement} container - Container element
 * @param {Array} wordData - Word data
 */
export function createWordList(container, wordData) {
  if (!wordData || wordData.length === 0) {
    container.innerHTML = '<p>No word data available</p>';
    return;
  }

  const maxCount = Math.max(...wordData.map(w => w.count));

  const wordsHTML = wordData.slice(0, 20).map((word, index) => {
    const size = 14 + (word.count / maxCount) * 24;
    const opacity = 0.5 + (word.count / maxCount) * 0.5;

    return `
      <span class="word-item"
            style="font-size: ${size}px; opacity: ${opacity}"
            title="${word.count} mentions">
        ${word.text}
      </span>
    `;
  }).join(' ');

  container.innerHTML = `
    <div class="word-list-section">
      <h2 class="section-title">Describe It In One Word 💬</h2>
      <div class="card">
        <div class="word-list">
          ${wordsHTML}
        </div>
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('word-list-styles')) {
    const style = document.createElement('style');
    style.id = 'word-list-styles';
    style.textContent = `
      .word-list {
        text-align: center;
        line-height: 2.5;
      }
      .word-item {
        display: inline-block;
        margin: var(--space-xs) var(--space-sm);
        font-weight: var(--font-semibold);
        color: var(--pizza-red);
        cursor: default;
        transition: all var(--transition-fast);
      }
      .word-item:hover {
        color: var(--cheese-yellow);
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Resize word cloud on window resize
 */
export function handleWordCloudResize() {
  // Debounced resize handler could be added here if needed
}
