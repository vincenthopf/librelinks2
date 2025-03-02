# Bio Description Display

## Changes Made (2024)

- Standardized bio width to match link cards (max-w-3xl = 768px)
- Added expandable functionality for long bios
- Implemented consistent width and padding across all views
- Synchronized preview and main profile dimensions

## Key Considerations

### Text Display

- Bio text uses line-clamp-3 for initial display
- "Show more" button appears for bios longer than 3 lines
- Text wrapping works naturally on all screen sizes
- Padding matches link card container (px-8)

### Responsive Design

- Full width (w-full) on all screen sizes
- Max width matches link cards (max-w-3xl = 768px)
- Font size remains configurable through bioFontSize setting
- Consistent padding across all breakpoints

### Component Consistency

- Bio container matches link card container structure
- Preview exactly mirrors main profile display
- Expand/collapse behavior synchronized between views
- Theme-based styling for interactive elements

## Implementation Details

### Container Structure

```jsx
<div className="w-full max-w-3xl px-8">
  <p className="text-center mt-1 mb-4 break-words whitespace-normal line-clamp-3">{bio}</p>
  {/* Show more button when needed */}
</div>
```

### Expandable Text

- Uses line-clamp-3 for initial state
- Smooth transition for expand/collapse
- Button inherits theme accent color
- Mobile-friendly touch targets

## Future Considerations

1. Monitor user feedback on 3-line threshold
2. Consider adding animation for expand/collapse
3. Watch for very long bios impact on layout
4. Keep preview component in sync with any future changes

## Best Practices

1. Always maintain width consistency with link cards
2. Use theme colors for interactive elements
3. Ensure mobile-first responsive design
4. Keep preview and main profile synchronized
