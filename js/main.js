/**
 * Pizza Survey Infographic - Main Application
 * Orchestrates data loading and visualization rendering
 */

import { setupDragAndDrop, generateSampleData } from './dataLoader.js';
import { processData } from './dataProcessor.js';
import { createRatingGauge, createRatingDistribution } from './charts/ratingGauge.js';
import { createPizzaPopularityChart } from './charts/pizzaPopularity.js';
import { createEmojiCards } from './charts/emojiCards.js';
import { createOrderAgainChart } from './charts/orderAgain.js';
import { createTierRanking } from './charts/tierRanking.js';
import { createWordCloud } from './charts/wordCloud.js';
import { createColdPizzaChart } from './charts/coldPizza.js';
import { createCommentsCarousel, destroyCarousel } from './charts/commentsCarousel.js';
import anime from 'animejs';

// DOM Elements
let uploadSection;
let infographicSection;

/**
 * Initialize the application
 */
function init() {
  // Get DOM elements
  uploadSection = document.getElementById('upload-section');
  infographicSection = document.getElementById('infographic');

  // Setup file upload
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const sampleBtn = document.getElementById('sample-data-btn');

  if (dropZone && fileInput) {
    setupDragAndDrop(dropZone, fileInput, handleDataLoaded);
  }

  // Setup sample data button
  if (sampleBtn) {
    sampleBtn.addEventListener('click', loadSampleData);
  }

  // Add keyboard shortcut for sample data (Ctrl/Cmd + Enter)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      loadSampleData();
    }
  });

  // Log ready state
  console.log('🍕 Pizza Survey Infographic ready!');
}

/**
 * Load sample data for demo
 */
function loadSampleData() {
  const sampleData = generateSampleData();
  handleDataLoaded(sampleData, 'sample-data.csv');
}

/**
 * Handle data loaded from file or sample
 * @param {Array} rawData - Raw survey data
 * @param {string} filename - Source filename
 */
function handleDataLoaded(rawData, filename) {
  console.log(`📊 Loaded ${rawData.length} responses from ${filename}`);

  try {
    // Process the data
    const processedData = processData(rawData);
    console.log('✅ Data processed successfully:', processedData);

    // Hide upload section
    hideUploadSection();

    // Show and populate infographic
    showInfographic(processedData);

  } catch (error) {
    console.error('❌ Error processing data:', error);
    showError(`Error processing data: ${error.message}`);
  }
}

/**
 * Hide upload section with animation
 */
function hideUploadSection() {
  if (!uploadSection) return;

  anime({
    targets: uploadSection,
    opacity: [1, 0],
    translateY: [0, -30],
    duration: 500,
    easing: 'easeInExpo',
    complete: () => {
      uploadSection.style.display = 'none';
    }
  });
}

/**
 * Show infographic section with all visualizations
 * @param {Object} data - Processed data
 */
function showInfographic(data) {
  if (!infographicSection) return;

  // Build the infographic HTML structure
  infographicSection.innerHTML = `
    <div class="container">
      <!-- Hero Rating -->
      <section id="hero-section" aria-label="Average Pizza Rating"></section>

      <!-- Pizza Popularity -->
      <section id="popularity-section" aria-label="Pizza Popularity Chart"></section>

      <!-- Order Again -->
      <section id="order-section" aria-label="Would Order Again"></section>

      <!-- Emoji Feelings -->
      <section id="emoji-section" aria-label="Post-Pizza Feelings"></section>

      <!-- Tier Rankings -->
      <section id="tier-section" aria-label="Pizza Tier Rankings"></section>

      <!-- Word Cloud -->
      <section id="wordcloud-section" aria-label="One Word Descriptions"></section>

      <!-- Cold Pizza -->
      <section id="cold-pizza-section" aria-label="Cold Pizza Preferences"></section>

      <!-- Comments -->
      <section id="comments-section" aria-label="Survey Comments"></section>

      <!-- Footer -->
      <footer id="stats-footer" class="stats-footer">
        <p class="footer-note">
          🍕 Made with love for pizza lovers everywhere
        </p>
      </footer>
    </div>
  `;

  // Show the section
  infographicSection.classList.add('visible');

  // Animate entrance
  anime({
    targets: infographicSection,
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutExpo'
  });

  // Render all visualizations with staggered timing
  renderVisualizations(data);
}

/**
 * Render all visualizations
 * @param {Object} data - Processed data
 */
function renderVisualizations(data) {
  // Hero Rating
  setTimeout(() => {
    createRatingGauge(
      document.getElementById('hero-section'),
      data.rating
    );
  }, 100);

  // Pizza Popularity
  setTimeout(() => {
    createPizzaPopularityChart(
      document.getElementById('popularity-section'),
      data.pizzaPopularity
    );
  }, 300);

  // Order Again
  setTimeout(() => {
    createOrderAgainChart(
      document.getElementById('order-section'),
      data.orderAgain
    );
  }, 400);

  // Emoji Cards
  setTimeout(() => {
    createEmojiCards(
      document.getElementById('emoji-section'),
      data.feelings
    );
  }, 500);

  // Tier Rankings
  setTimeout(() => {
    createTierRanking(
      document.getElementById('tier-section'),
      data.tiers
    );
  }, 600);

  // Word Cloud
  setTimeout(() => {
    createWordCloud(
      document.getElementById('wordcloud-section'),
      data.wordCloud
    );
  }, 700);

  // Cold Pizza
  setTimeout(() => {
    createColdPizzaChart(
      document.getElementById('cold-pizza-section'),
      data.coldPizza
    );
  }, 800);

  // Comments Carousel
  setTimeout(() => {
    createCommentsCarousel(
      document.getElementById('comments-section'),
      data.comments
    );
  }, 900);

}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <strong>Oops!</strong> ${message}
    <button onclick="this.parentElement.remove()" style="margin-left: 10px; cursor: pointer;">×</button>
  `;

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(errorDiv, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

/**
 * Reset to upload view
 */
function resetToUpload() {
  // Cleanup carousel
  destroyCarousel();

  // Hide infographic
  if (infographicSection) {
    infographicSection.classList.remove('visible');
    infographicSection.innerHTML = '';
  }

  // Show upload section
  if (uploadSection) {
    uploadSection.style.display = 'flex';
    anime({
      targets: uploadSection,
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 500,
      easing: 'easeOutExpo'
    });
  }
}

// Expose reset function globally
window.resetToUpload = resetToUpload;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
