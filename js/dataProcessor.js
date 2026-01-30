/**
 * Data Processor Module
 * Transforms raw survey data into visualization-ready formats
 */

/**
 * Column name mappings for flexibility
 * Maps common variations to standardized names
 */
const COLUMN_MAPPINGS = {
  rating: ['Rate the overall taste of the pizza:', 'Rate this pizza (1-10)', 'Rating', 'Score', 'rate', 'rating'],
  pizzaType: ['What pizza did you try?', 'Which pizza did you try?', 'Pizza Type', 'Pizza', 'pizza type', 'Which pizza'],
  feeling: ['How do you feel after eating this pizza', 'How do you feel after eating?', 'Feeling', 'How do you feel', 'feeling'],
  orderAgain: ['Would you want this pizza again', 'Would you order again?', 'Order Again', 'Would order again', 'order again'],
  tier: ['Where does this land', 'Pizza tier ranking', 'Tier', 'Ranking', 'tier ranking'],
  oneWord: ['Describe this pizza in ONE word', 'One word to describe', 'One Word', 'Describe', 'one word'],
  coldPizza: ['eat this pizza cold', 'Cold pizza preference', 'Cold Pizza', 'cold pizza'],
  comments: ['Elaborate', 'Additional comments', 'Comments', 'Feedback', 'comments'],
  timestamp: ['Timestamp', 'Date', 'Submitted', 'timestamp']
};

/**
 * Find the matching column name in the data
 * @param {Object} row - A data row
 * @param {string} field - The field to find
 * @returns {string|null} - The matching column name or null
 */
function findColumn(row, field) {
  const mappings = COLUMN_MAPPINGS[field] || [];
  const keys = Object.keys(row);

  for (const mapping of mappings) {
    const found = keys.find(k =>
      k.toLowerCase().includes(mapping.toLowerCase()) ||
      mapping.toLowerCase().includes(k.toLowerCase())
    );
    if (found) return found;
  }

  return null;
}

/**
 * Get value from row using flexible column matching
 * @param {Object} row - A data row
 * @param {string} field - The field to get
 * @returns {*} - The value or empty string
 */
function getValue(row, field) {
  const column = findColumn(row, field);
  return column ? row[column] : '';
}

/**
 * Process raw survey data into visualization-ready format
 * @param {Object[]} rawData - Raw CSV data
 * @returns {Object} - Processed data for all visualizations
 */
export function processData(rawData) {
  if (!rawData || rawData.length === 0) {
    throw new Error('No data to process');
  }

  return {
    summary: processSummary(rawData),
    rating: processRating(rawData),
    pizzaPopularity: processPizzaPopularity(rawData),
    feelings: processFeelings(rawData),
    orderAgain: processOrderAgain(rawData),
    tiers: processTiers(rawData),
    wordCloud: processWordCloud(rawData),
    coldPizza: processColdPizza(rawData),
    comments: processComments(rawData)
  };
}

/**
 * Process summary statistics
 */
function processSummary(data) {
  const timestamps = data
    .map(row => getValue(row, 'timestamp'))
    .filter(t => t)
    .map(t => new Date(t))
    .filter(d => !isNaN(d));

  let dateRange = 'Unknown';
  if (timestamps.length > 0) {
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));
    dateRange = `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  }

  return {
    totalResponses: data.length,
    dateRange
  };
}

/**
 * Process average rating
 */
function processRating(data) {
  const ratings = data
    .map(row => {
      const val = getValue(row, 'rating');
      return parseFloat(val);
    })
    .filter(r => !isNaN(r) && r >= 1 && r <= 10);

  if (ratings.length === 0) {
    return { average: 0, count: 0, distribution: {} };
  }

  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  // Create distribution
  const distribution = {};
  for (let i = 1; i <= 10; i++) {
    distribution[i] = 0;
  }
  ratings.forEach(r => {
    const rounded = Math.round(r);
    distribution[rounded] = (distribution[rounded] || 0) + 1;
  });

  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length,
    distribution
  };
}

/**
 * Process pizza popularity (handles multi-select)
 */
function processPizzaPopularity(data) {
  const counts = {};

  data.forEach(row => {
    const value = getValue(row, 'pizzaType');
    if (!value) return;

    // Handle multi-select (comma or semicolon separated)
    const pizzas = value.split(/[,;]/).map(p => p.trim()).filter(p => p);

    pizzas.forEach(pizza => {
      // Normalize pizza names
      const normalized = normalizePizzaName(pizza);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
  });

  // Sort by count descending
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const total = sorted.reduce((sum, item) => sum + item.count, 0);

  return {
    items: sorted,
    total
  };
}

/**
 * Normalize pizza names for consistency
 */
function normalizePizzaName(name) {
  const lowered = name.toLowerCase().trim();

  const mappings = {
    'cheese': 'Cheese',
    'plain cheese': 'Cheese',
    'pepperoni': 'Pepperoni',
    'pep': 'Pepperoni',
    'chicken pesto': 'Chicken Pesto',
    'pesto chicken': 'Chicken Pesto',
    'veggie': 'Veggie Supreme',
    'vegetable': 'Veggie Supreme',
    'veggie supreme': 'Veggie Supreme',
    'meat lovers': 'Meat Lovers',
    'meat lover': 'Meat Lovers',
    'meatlover': 'Meat Lovers',
    'hawaiian': 'Hawaiian',
    'hawaii': 'Hawaiian'
  };

  return mappings[lowered] || name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Process feelings distribution
 */
function processFeelings(data) {
  const feelings = {};

  // Color mapping based on sentiment
  const colorMap = {
    'joy': '#F1C40F',
    'regret': '#E67E22',
    'shame': '#9B59B6',
    'happy': '#F1C40F',
    'satisfied': '#2ECC71'
  };

  data.forEach(row => {
    const value = getValue(row, 'feeling');
    if (!value) return;

    const normalized = value.toLowerCase().trim();
    if (!feelings[normalized]) {
      // Extract emoji from the original text using regex
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojis = value.match(emojiRegex);
      const extractedEmoji = emojis ? emojis[0] : '🍕';

      // Determine color based on keywords
      let color = '#F4D03F';
      for (const [keyword, c] of Object.entries(colorMap)) {
        if (normalized.includes(keyword)) {
          color = c;
          break;
        }
      }

      feelings[normalized] = {
        original: value.trim(),
        emoji: extractedEmoji,
        color: color,
        count: 0
      };
    }
    feelings[normalized].count++;
  });

  const total = Object.values(feelings).reduce((sum, f) => sum + f.count, 0);

  const items = Object.values(feelings)
    .map(f => ({
      feeling: f.original.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim(),
      count: f.count,
      percentage: Math.round((f.count / total) * 100),
      emoji: f.emoji,
      color: f.color
    }))
    .sort((a, b) => b.count - a.count);

  return { items, total };
}

/**
 * Process order again responses
 */
function processOrderAgain(data) {
  let yes = 0;
  let meh = 0;

  data.forEach(row => {
    const value = getValue(row, 'orderAgain');
    if (!value) return;

    const lowered = value.toLowerCase();
    if (lowered.includes('yes') || lowered.includes('absolutely') || lowered.includes('definitely')) {
      yes++;
    } else if (lowered.includes('meh') || lowered.includes('maybe') || lowered.includes('no')) {
      meh++;
    }
  });

  const total = yes + meh;
  return {
    yes: { count: yes, percentage: total > 0 ? Math.round((yes / total) * 100) : 0 },
    meh: { count: meh, percentage: total > 0 ? Math.round((meh / total) * 100) : 0 },
    total
  };
}

/**
 * Process tier rankings
 */
function processTiers(data) {
  const tiers = {
    'Top Tier': { count: 0, icon: '🏆', color: '#FFD700' },
    'Solid Choice': { count: 0, icon: '🥈', color: '#C0C0C0' },
    'Mid': { count: 0, icon: '🥉', color: '#CD7F32' }
  };

  data.forEach(row => {
    const value = getValue(row, 'tier');
    if (!value) return;

    const lowered = value.toLowerCase();
    if (lowered.includes('top') || lowered.includes('best') || lowered.includes('excellent')) {
      tiers['Top Tier'].count++;
    } else if (lowered.includes('solid') || lowered.includes('good') || lowered.includes('great')) {
      tiers['Solid Choice'].count++;
    } else if (lowered.includes('mid') || lowered.includes('average') || lowered.includes('okay')) {
      tiers['Mid'].count++;
    }
  });

  const total = Object.values(tiers).reduce((sum, t) => sum + t.count, 0);

  return {
    items: Object.entries(tiers).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      icon: data.icon,
      color: data.color
    })),
    total
  };
}

/**
 * Process one-word descriptions for word cloud
 */
function processWordCloud(data) {
  const words = {};

  data.forEach(row => {
    const value = getValue(row, 'oneWord');
    if (!value) return;

    // Split by common delimiters and clean up
    const wordList = value
      .split(/[,;/\s]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1 && !isStopWord(w));

    wordList.forEach(word => {
      // Preserve case variations for display
      const displayWord = value.split(/[,;/\s]+/)
        .find(w => w.trim().toLowerCase() === word) || word;

      if (!words[word]) {
        words[word] = { text: displayWord.trim(), count: 0 };
      }
      words[word].count++;
    });
  });

  return Object.values(words)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 words
}

/**
 * Check if word is a stop word
 */
function isStopWord(word) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'it', 'its'];
  return stopWords.includes(word.toLowerCase());
}

/**
 * Process cold pizza preferences
 */
function processColdPizza(data) {
  const preferences = {
    'Leftovers Please!': { count: 0, color: '#27AE60' },
    'If Desperate': { count: 0, color: '#F39C12' },
    'Never!': { count: 0, color: '#C0392B' }
  };

  data.forEach(row => {
    const value = getValue(row, 'coldPizza');
    if (!value) return;

    const lowered = value.toLowerCase();
    if (lowered.includes('leftover') || lowered.includes('please') || lowered.includes('love') || lowered.includes('yes')) {
      preferences['Leftovers Please!'].count++;
    } else if (lowered.includes('desperate') || lowered.includes('maybe') || lowered.includes('sometimes')) {
      preferences['If Desperate'].count++;
    } else if (lowered.includes('never') || lowered.includes('no') || lowered.includes('chance')) {
      preferences['Never!'].count++;
    }
  });

  const total = Object.values(preferences).reduce((sum, p) => sum + p.count, 0);

  return {
    items: Object.entries(preferences).map(([label, data]) => ({
      label,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      color: data.color
    })),
    total
  };
}

/**
 * Process comments for carousel
 */
function processComments(data) {
  const comments = data
    .map(row => getValue(row, 'comments'))
    .filter(c => c && c.trim().length > 10) // Filter out short/empty comments
    .map(c => c.trim());

  // Return unique comments, shuffled
  const unique = [...new Set(comments)];
  return shuffleArray(unique).slice(0, 10); // Top 10 comments
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get pizza color based on type
 */
export function getPizzaColor(pizzaType) {
  const colors = {
    'Cheese': '#F4D03F',
    'Pepperoni': '#C0392B',
    'Chicken Pesto': '#27AE60',
    'Veggie Supreme': '#8E44AD',
    'Meat Lovers': '#A04000',
    'Hawaiian': '#F39C12'
  };

  return colors[pizzaType] || '#' + Math.floor(Math.random()*16777215).toString(16);
}
