import { useState } from 'react';

/**
 * TextCard component for displaying text items on the user profile page
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the text item
 * @param {string} props.content - Content of the text item
 * @param {string} props.buttonStyle - Style of the button/card
 * @param {Object} props.theme - Theme colors
 * @param {number} props.fontSize - Font size for the title
 * @param {string} props.fontFamily - Font family for the title
 * @param {number} props.cardHeight - Height of the card padding
 * @returns {JSX.Element} - Rendered component
 */
const TextCard = props => {
  const [expanded, setExpanded] = useState(false);

  const isTransparent = props.buttonStyle.includes('bg-transparent');
  const hasShadowProp = props.buttonStyle.includes('shadow');
  const isHorizontalOnly = props.buttonStyle.includes('horizontal-only');
  const isBottomOnly = props.buttonStyle.includes('bottom-only');

  const style = {
    background: isTransparent ? 'transparent' : props.theme.secondary,
    display: props.archived ? 'none' : 'flex',
    boxShadow: hasShadowProp ? `5px 5px 0 0 ${props.theme.neutral}` : '',
    minHeight: `${props.cardHeight || 40}px`,
  };

  // Apply border styles conditionally and explicitly
  if (isHorizontalOnly) {
    style.borderTop = `1.5px solid ${props.theme.neutral}`;
    style.borderBottom = `1.5px solid ${props.theme.neutral}`;
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else if (isBottomOnly) {
    style.borderBottom = `1.5px solid ${props.theme.neutral}`;
    style.borderTop = 'none';
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else {
    // Default case: apply border to all sides
    style.border = `1.5px solid ${props.theme.neutral}`;
  }

  return (
    <div
      className={`w-full flex flex-col transition-all duration-200 ${props.buttonStyle || 'rounded-md'} p-4`}
      style={style}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <p
          style={{
            color: props.theme.accent,
            fontSize: `${props.fontSize || 14}px`,
            fontFamily: props.fontFamily || 'Inter',
          }}
          className="font-semibold mb-1"
        >
          {props.title}
        </p>

        {/* Show a preview of content or full content based on expanded state */}
        <div
          style={{
            color: props.theme.accent,
            fontFamily: props.fontFamily || 'Inter',
            maxHeight: expanded ? '500px' : '80px',
            overflow: expanded ? 'visible' : 'hidden',
            transition: 'max-height 0.3s ease-in-out',
          }}
          className="text-sm whitespace-pre-wrap"
        >
          {props.content}
        </div>

        {/* Only show "Read more" if content is long enough */}
        {props.content && props.content.length > 180 && (
          <div style={{ color: props.theme.neutral }} className="text-xs font-semibold mt-2">
            {expanded ? 'Show less' : 'Read more'}
          </div>
        )}
      </button>
    </div>
  );
};

export default TextCard;
