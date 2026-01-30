# Pizza Survey Infographic Tool

Transform your Google Forms pizza survey data into a stunning, shareable visualization!

## Features

- **Drag & Drop CSV Upload** - Simply drop your Google Forms CSV export
- **9 Interactive Visualizations**:
  - Hero rating gauge with animated counter
  - Pizza popularity doughnut chart
  - Emoji feeling cards with animated progress bars
  - "Would Order Again" comparison cards
  - Tier ranking podium display
  - D3-powered word cloud
  - Cold pizza preference bars
  - Comments carousel with auto-rotation
  - Survey statistics footer

- **Smooth Animations** - Powered by anime.js
- **Responsive Design** - Works on desktop and mobile
- **Accessible** - ARIA labels, keyboard navigation, reduced motion support

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Production Build

```bash
npm run build
npm run preview
```

## CSV Format

The tool expects a CSV with these columns (column names are flexible):

| Column | Example Values |
|--------|---------------|
| Timestamp | 2025-01-15T10:30:00 |
| Rate this pizza (1-10) | 8 |
| Which pizza did you try? | Pepperoni, Cheese |
| How do you feel after eating? | Joy, Satisfied, Shame, Regret |
| Would you order again? | Yes, absolutely! / Meh, maybe |
| Pizza tier ranking | Top Tier, Solid Choice, Mid |
| One word to describe | pillowy, THICK, cheesy |
| Cold pizza preference | Leftovers Please!, If Desperate, Never! |
| Additional comments | Best pizza ever! |

### Google Forms Export

1. Open your Google Form responses
2. Click the spreadsheet icon to open in Sheets
3. File > Download > Comma Separated Values (.csv)
4. Drop the file onto the upload zone

## Tech Stack

- **Vite** - Development server and bundler
- **Chart.js** - Doughnut and bar charts
- **D3.js + d3-cloud** - Word cloud visualization
- **anime.js** - Smooth animations
- **Papa Parse** - CSV parsing

## Project Structure

```
pizza-survey-infographic/
├── index.html           # Main entry point
├── css/
│   ├── main.css         # Main styles
│   ├── variables.css    # CSS custom properties
│   └── animations.css   # Keyframe animations
├── js/
│   ├── main.js          # App orchestration
│   ├── dataLoader.js    # CSV parsing & drag-drop
│   ├── dataProcessor.js # Data transformation
│   └── charts/
│       ├── ratingGauge.js
│       ├── pizzaPopularity.js
│       ├── emojiCards.js
│       ├── orderAgain.js
│       ├── tierRanking.js
│       ├── wordCloud.js
│       ├── coldPizza.js
│       └── commentsCarousel.js
├── data/
│   └── sample.csv       # Sample survey data
├── package.json
└── vite.config.js
```

## Customization

### Colors

Edit `css/variables.css` to change the color palette:

```css
:root {
  --pizza-red: #C0392B;
  --cheese-yellow: #F4D03F;
  --pesto-green: #27AE60;
  /* ... */
}
```

### Pizza Types

Add new pizza types in `js/dataProcessor.js`:

```javascript
const colors = {
  'Cheese': '#F4D03F',
  'Pepperoni': '#C0392B',
  // Add more...
};
```

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Load sample data
- `←` / `→` - Navigate comments carousel

## License

MIT
