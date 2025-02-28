import React from 'react';

/**
 * FontCard component for displaying a font option in the grid
 *
 * @param {Object} props - Component props
 * @param {string} props.font - Font family name
 * @param {boolean} props.isSelected - Whether this font is currently selected
 * @param {Function} props.onSelect - Function to call when this font is selected
 * @returns {JSX.Element} - Rendered component
 */
const FontCard = ({ font, isSelected, onSelect }) => {
  // Map of fonts to their metadata (designer/source)
  const fontMetadata = {
    Inter: 'Rasmus Andersson',
    Roboto: 'Christian Robertson, Google',
    Playfair: 'Claus Eggers Sørensen',
    Lato: 'Łukasz Dziedzic',
    'Playfair Black': 'Claus Eggers Sørensen',
    Bebas: 'Ryoichi Tsunekawa, Dharma Type',
    'Open Sans': 'Steve Matteson, Google',
    Cinzel: 'Natanael Gama',
    'Space Mono': 'Colophon Foundry',
    Comfortaa: 'Johan Aakerlund',
    'Playfair Pack': 'Claus Eggers Sørensen',
    'Cinzel Pack': 'Natanael Gama',
    'Bebas Pack': 'Ryoichi Tsunekawa, Dharma Type',
    Slab: 'Various',
    Alegreya: 'Juan Pablo del Peral, Huerta Tipográfica',
    Oswald: 'Vernon Adams',
    Barlow: 'Jeremy Tribby',
    Escar: 'Various',
    Lora: 'Olga Karpushina, Cyreal',
    Montserrat: 'Julieta Ulanovsky',
    Poppins: 'Indian Type Foundry',
    Raleway: 'Matt McInerney, Pablo Impallari, Rodrigo Fuenzalida',
    'Source Sans Pro': 'Paul D. Hunt, Adobe',
    Ubuntu: 'Dalton Maag',
    Merriweather: 'Sorkin Type',
    Nunito: 'Vernon Adams',
    Quicksand: 'Andrew Paglinawan',
    'Josefin Sans': 'Santiago Orozco',
  };

  // Get metadata for this font, or use a default
  const metadata = fontMetadata[font] || 'Unknown';

  return (
    <div
      className={`font-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(font)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(font);
          e.preventDefault();
        }
      }}
    >
      {/* Font name displayed in its own typeface */}
      <div className="font-preview" style={{ fontFamily: font }}>
        {font}
      </div>

      {/* Font metadata */}
      <div className="font-meta">{metadata}</div>
    </div>
  );
};

export default FontCard;
