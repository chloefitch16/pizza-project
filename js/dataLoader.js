/**
 * Data Loader Module
 * Handles CSV file loading and parsing with Papa Parse
 */

import Papa from 'papaparse';

/**
 * Parse CSV data from a file
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Object[]>} - Parsed data rows
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Parse CSV data from a string
 * @param {string} csvString - The CSV content as a string
 * @returns {Object[]} - Parsed data rows
 */
export function parseCSVString(csvString) {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }

  return results.data;
}

/**
 * Load CSV from a URL
 * @param {string} url - The URL to load CSV from
 * @returns {Promise<Object[]>} - Parsed data rows
 */
export function loadCSVFromURL(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to load CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Setup drag and drop file upload
 * @param {HTMLElement} dropZone - The drop zone element
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {Function} onFileLoaded - Callback when file is loaded
 */
export function setupDragAndDrop(dropZone, fileInput, onFileLoaded) {
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop zone when dragging over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-over');
    }, false);
  });

  // Handle dropped files
  dropZone.addEventListener('drop', async (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          const data = await parseCSVFile(file);
          onFileLoaded(data, file.name);
        } catch (error) {
          console.error('Error loading file:', error);
          alert('Error loading CSV file. Please check the format and try again.');
        }
      } else {
        alert('Please upload a CSV file.');
      }
    }
  }, false);

  // Handle click to upload
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle file input change
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await parseCSVFile(file);
        onFileLoaded(data, file.name);
      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading CSV file. Please check the format and try again.');
      }
    }
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Generate sample survey data for demo purposes
 * @returns {Object[]} - Sample survey data
 */
export function generateSampleData() {
  const pizzaTypes = ['Cheese', 'Pepperoni', 'Chicken Pesto', 'Veggie Supreme', 'Meat Lovers'];
  const feelings = ['Joy', 'Satisfied', 'Shame', 'Regret'];
  const orderAgain = ['Yes, absolutely!', 'Meh, maybe'];
  const tiers = ['Top Tier', 'Solid Choice', 'Mid'];
  const coldPizza = ['Leftovers Please!', 'If Desperate', 'Never!'];
  const oneWords = ['pillowy', 'THICK', 'thicc', 'doughy', 'Luxe', 'cheesy', 'perfect', 'heavenly', 'greasy', 'delicious', 'amazing', 'crispy', 'saucy', 'gooey', 'divine'];
  const comments = [
    'Best pizza I\'ve ever had in my life!',
    'The crust was perfectly crispy on the outside, soft inside.',
    'I dream about this pizza at night.',
    'Would definitely recommend to anyone who loves good food.',
    'The cheese pull was absolutely insane.',
    'Perfect balance of sauce and toppings.',
    'This pizza changed my life, not kidding.',
    'I\'ve been searching for pizza like this for years.',
    'The flavors just dance on your tongue.',
    'My new comfort food, hands down.'
  ];

  const data = [];
  const numResponses = 47;

  for (let i = 0; i < numResponses; i++) {
    // Generate 1-3 pizza selections
    const numPizzas = Math.floor(Math.random() * 2) + 1;
    const selectedPizzas = [];
    for (let j = 0; j < numPizzas; j++) {
      const pizza = pizzaTypes[Math.floor(Math.random() * pizzaTypes.length)];
      if (!selectedPizzas.includes(pizza)) {
        selectedPizzas.push(pizza);
      }
    }

    data.push({
      'Timestamp': new Date(2025, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
      'Rate this pizza (1-10)': Math.floor(Math.random() * 4) + 6, // 6-10 range for realistic data
      'Which pizza did you try?': selectedPizzas.join(', '),
      'How do you feel after eating?': feelings[Math.floor(Math.random() * feelings.length)],
      'Would you order again?': orderAgain[Math.random() > 0.3 ? 0 : 1], // 70% yes
      'Pizza tier ranking': tiers[Math.floor(Math.random() * tiers.length)],
      'One word to describe': oneWords[Math.floor(Math.random() * oneWords.length)],
      'Cold pizza preference': coldPizza[Math.floor(Math.random() * coldPizza.length)],
      'Additional comments': Math.random() > 0.6 ? comments[Math.floor(Math.random() * comments.length)] : ''
    });
  }

  return data;
}
