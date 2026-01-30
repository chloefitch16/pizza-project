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
import pako from 'pako';

// DOM Elements
let uploadSection;
let infographicSection;
let currentProcessedData = null;
let currentPizzaInfo = null;
let pendingRawData = null;

/**
 * Initialize the application
 */
function init() {
  // Get DOM elements
  uploadSection = document.getElementById('upload-section');
  infographicSection = document.getElementById('infographic');

  // Check for shared data in URL first
  const sharedData = getSharedDataFromURL();
  if (sharedData) {
    console.log('📨 Loading shared data from URL');
    currentProcessedData = sharedData;
    currentPizzaInfo = sharedData.pizzaInfo || null;
    hideUploadSection();
    showInfographic(sharedData);
    return;
  }

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

  // Setup pizza info modal submit
  const pizzaInfoSubmit = document.getElementById('pizza-info-submit');
  if (pizzaInfoSubmit) {
    pizzaInfoSubmit.addEventListener('click', handlePizzaInfoSubmit);
  }

  // Log ready state
  console.log('🍕 Pizza Survey Infographic ready!');
}

/**
 * Minify data for sharing - uses short keys and strips unnecessary data
 */
function minifyDataForSharing(data) {
  return {
    p: data.pizzaInfo?.place || '',
    d: data.pizzaInfo?.date || '',
    r: { a: data.rating?.average || 0, c: data.rating?.count || 0 },
    pp: (data.pizzaPopularity?.items || []).slice(0, 6).map(i => [i.name, i.count]),
    oa: [data.orderAgain?.yes?.count || 0, data.orderAgain?.meh?.count || 0],
    f: (data.feelings?.items || []).slice(0, 4).map(i => [i.feeling, i.count]),
    t: (data.tiers?.items || []).map(i => [i.name, i.count]),
    w: (data.wordCloud || []).slice(0, 15).map(i => [i.text, i.count]),
    cp: (data.coldPizza?.items || []).map(i => [i.label, i.count]),
    cm: (data.comments || []).slice(0, 3)
  };
}

/**
 * Expand minified data back to full format
 */
function expandMinifiedData(mini) {
  const EMOJI_MAP = {
    'No regrets, only joy': { emoji: '🥰', color: '#2ECC71' },
    'Slight shame': { emoji: '😅', color: '#9B59B6' },
    'Why did I do this': { emoji: '🥴', color: '#E74C3C' }
  };
  const COLD_PREFS = {
    'Leftovers Please!': { emoji: '🤤', class: 'hot', color: '#27AE60' },
    'If Desperate': { emoji: '🤷', class: 'warm', color: '#F39C12' },
    'Never!': { emoji: '🙅', class: 'cold', color: '#C0392B' }
  };
  const TIER_INFO = {
    'Top Tier': { icon: '🏆', color: '#FFD700' },
    'Solid Choice': { icon: '🥈', color: '#C0C0C0' },
    'Mid': { icon: '🥉', color: '#CD7F32' }
  };

  const ppTotal = mini.pp.reduce((s, i) => s + i[1], 0);
  const fTotal = mini.f.reduce((s, i) => s + i[1], 0);
  const tTotal = mini.t.reduce((s, i) => s + i[1], 0);
  const cpTotal = mini.cp.reduce((s, i) => s + i[1], 0);
  const oaTotal = mini.oa[0] + mini.oa[1];

  return {
    pizzaInfo: { place: mini.p, date: mini.d },
    summary: { totalResponses: mini.r.c, dateRange: 'Survey Results' },
    rating: { average: mini.r.a, count: mini.r.c },
    pizzaPopularity: {
      items: mini.pp.map(([name, count]) => ({ name, count })),
      total: ppTotal
    },
    orderAgain: {
      yes: { count: mini.oa[0], percentage: oaTotal ? Math.round(mini.oa[0] / oaTotal * 100) : 0 },
      meh: { count: mini.oa[1], percentage: oaTotal ? Math.round(mini.oa[1] / oaTotal * 100) : 0 },
      total: oaTotal
    },
    feelings: {
      items: mini.f.map(([feeling, count]) => ({
        feeling,
        count,
        percentage: fTotal ? Math.round(count / fTotal * 100) : 0,
        emoji: EMOJI_MAP[feeling]?.emoji || '😋',
        color: EMOJI_MAP[feeling]?.color || '#F4D03F'
      })),
      total: fTotal
    },
    tiers: {
      items: mini.t.map(([name, count]) => ({
        name,
        count,
        percentage: tTotal ? Math.round(count / tTotal * 100) : 0,
        icon: TIER_INFO[name]?.icon || '🏅',
        color: TIER_INFO[name]?.color || '#999'
      })),
      total: tTotal
    },
    wordCloud: mini.w.map(([text, count]) => ({ text, count })),
    coldPizza: {
      items: mini.cp.map(([label, count]) => ({
        label,
        count,
        percentage: cpTotal ? Math.round(count / cpTotal * 100) : 0,
        color: COLD_PREFS[label]?.color || '#999'
      })),
      total: cpTotal
    },
    comments: mini.cm
  };
}

/**
 * Encode processed data to a shareable URL (with minification + compression)
 */
function encodeDataToURL(data) {
  try {
    // Minify data first to reduce size dramatically
    const minified = minifyDataForSharing(data);
    const jsonStr = JSON.stringify(minified);
    // Compress the JSON string using pako (deflate)
    const compressed = pako.deflate(jsonStr);
    // Convert to base64 URL-safe string
    const base64 = btoa(String.fromCharCode.apply(null, compressed))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('d', base64);
    return url.toString();
  } catch (error) {
    console.error('Error encoding data:', error);
    return null;
  }
}

/**
 * Decode shared data from URL (supports minified compressed format)
 */
function getSharedDataFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);

    // Try compressed minified format (parameter 'd')
    let base64Data = params.get('d');
    if (base64Data) {
      // Restore base64 padding and URL-safe chars
      base64Data = base64Data.replace(/-/g, '+').replace(/_/g, '/');
      while (base64Data.length % 4) base64Data += '=';

      // Decode base64 to binary
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Decompress using pako (inflate)
      const decompressed = pako.inflate(bytes, { to: 'string' });
      const minified = JSON.parse(decompressed);

      // Expand minified data back to full format
      return expandMinifiedData(minified);
    }

    return null;
  } catch (error) {
    console.error('Error decoding shared data:', error);
    return null;
  }
}

/**
 * Copy share link to clipboard
 */
async function copyShareLink() {
  if (!currentProcessedData) return;

  const url = encodeDataToURL(currentProcessedData);
  if (!url) {
    showError('Failed to generate share link');
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showShareSuccess();
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showShareSuccess();
  }
}

/**
 * Show success message for share link copy
 */
function showShareSuccess() {
  const btn = document.getElementById('share-btn-fixed') || document.getElementById('share-btn');
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Copied!';
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  }
}

/**
 * Format date for display
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Expose share function globally
window.copyShareLink = copyShareLink;

/**
 * Load sample data for demo
 */
function loadSampleData() {
  const sampleData = generateSampleData();
  // For sample data, use demo values
  currentPizzaInfo = {
    place: "Tony's Famous Pizzeria",
    date: new Date().toISOString().split('T')[0]
  };

  try {
    const processedData = processData(sampleData);
    currentProcessedData = {
      ...processedData,
      pizzaInfo: currentPizzaInfo
    };
    hideUploadSection();
    showInfographic(currentProcessedData);
  } catch (error) {
    console.error('❌ Error processing data:', error);
    showError(`Error processing data: ${error.message}`);
  }
}

/**
 * Handle data loaded from file or sample
 * @param {Array} rawData - Raw survey data
 * @param {string} filename - Source filename
 */
function handleDataLoaded(rawData, filename) {
  console.log(`📊 Loaded ${rawData.length} responses from ${filename}`);

  // Store the raw data and show the pizza info modal
  pendingRawData = rawData;
  showPizzaInfoModal();
}

/**
 * Show the pizza info modal
 */
function showPizzaInfoModal() {
  const modal = document.getElementById('pizza-info-modal');
  const dateInput = document.getElementById('pizza-date-input');

  // Set default date to today
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Handle pizza info form submission
 */
function handlePizzaInfoSubmit() {
  const placeInput = document.getElementById('pizza-place-input');
  const dateInput = document.getElementById('pizza-date-input');
  const modal = document.getElementById('pizza-info-modal');

  const pizzaPlace = placeInput?.value.trim() || 'Mystery Pizza';
  const pizzaDate = dateInput?.value || new Date().toISOString().split('T')[0];

  // Store pizza info
  currentPizzaInfo = {
    place: pizzaPlace,
    date: pizzaDate
  };

  // Hide modal
  if (modal) {
    modal.style.display = 'none';
  }

  // Now process the data
  try {
    const processedData = processData(pendingRawData);
    console.log('✅ Data processed successfully:', processedData);

    // Store for sharing (include pizza info)
    currentProcessedData = {
      ...processedData,
      pizzaInfo: currentPizzaInfo
    };

    // Hide upload section
    hideUploadSection();

    // Show and populate infographic
    showInfographic(currentProcessedData);

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
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #C84B31, #E76F51); color: white; padding: 32px 40px; border-radius: 24px; margin-bottom: 40px; text-align: center; box-shadow: 0 8px 32px rgba(200, 75, 49, 0.2);">
        <h1 style="margin: 0 0 8px 0; font-size: 2.25em; font-family: 'Fredoka One', sans-serif;">🍕 ${data.pizzaInfo?.place || 'Pizza Survey'}</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 1.15em; font-weight: 500;">${formatDisplayDate(data.pizzaInfo?.date)}</p>
        <button onclick="copyShareLink()" style="background: #FFFBF5; color: #C84B31; border: none; padding: 12px 28px; border-radius: 9999px; font-weight: 600; cursor: pointer; font-size: 1em; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s ease;">
          🔗 Copy Share Link
        </button>
      </div>

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

      <!-- Share Button -->
      <div class="share-section">
        <button id="share-btn" class="share-btn" onclick="copyShareLink()">
          📤 Copy Share Link
        </button>
      </div>

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

  // Update button visibility
  if (window.updateButtonVisibility) {
    window.updateButtonVisibility();
  }

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
