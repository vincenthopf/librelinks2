# Theme Customization

## Overview

The theme customization feature allows users to modify the colors of any preset theme to create their perfect color scheme. Users can customize four key colors in each theme:

- Background Color
- Secondary Color
- Text Color
- Accent Color

## Usage

### Selecting a Theme

1. Navigate to the Themes section
2. Browse through available preset themes
3. Click on a theme to select it
4. Use the "Show More" button to view additional themes

### Customizing Colors

Once a theme is selected, you can customize its colors:

1. The color customization panel will appear below the theme selection
2. Each color has its own color picker with:

   - A color spectrum selector
   - A hue slider
   - A hex color input field
   - A color preview

3. Modify colors by:
   - Clicking and dragging in the color spectrum
   - Using the hue slider
   - Entering a hex color code directly

### Real-time Preview

Changes are applied in real-time, allowing you to see how your customizations look immediately.

### Resetting Colors

To revert your customizations:

1. Click the "Reset to Original" button in the customization panel
2. The theme will return to its preset colors

## Technical Details

### API Endpoints

The theme customization feature uses the `/api/customize` endpoint:

```typescript
POST /api/customize
{
  themePalette: {
    name: string,
    palette: [string, string, string, string] // [background, secondary, text, accent]
  }
}
```

### State Management

- Theme selections are persisted in localStorage
- Custom colors are stored in the user's profile
- Changes are applied in real-time using React Query for state management

### Performance Considerations

- Color changes are debounced to prevent excessive API calls
- Smooth transitions are implemented for color changes
- The color picker uses efficient rendering techniques

## Best Practices

1. Consider color contrast for accessibility
2. Test color combinations in different contexts
3. Use the real-time preview to ensure readability
4. Save your favorite customizations for future reference

## Troubleshooting

If you encounter issues:

1. Try refreshing the page
2. Check your network connection
3. Use the "Reset to Original" button if colors appear incorrect
4. Contact support if problems persist
