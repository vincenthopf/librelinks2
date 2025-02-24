# Cursor Memory - Project Insights

## Theme System Implementation

### Color Synchronization (Link Cards)

- The theme system uses a palette with four key colors:

  - `theme.primary` - Background color
  - `theme.secondary` - Secondary background color
  - `theme.accent` - Text color (used for profile name and interactive elements)
  - `theme.neutral` - Border/neutral color

- When implementing theme-based styling:
  - Use `theme.accent` for text and interactive elements that should match the profile name
  - Maintain consistency across components by referencing the same theme properties
  - Consider accessibility when choosing theme colors

### Lessons Learned

1. Theme Consistency: When adding new UI elements, always check if they should follow the theme's color scheme
2. Style Inheritance: When modifying styles, preserve existing style properties by using object spread or combining them in the style object
3. Component Cohesion: Related elements (like title and chevron) should use the same theme colors for visual consistency

### Future Considerations

- When adding new interactive elements, consider if they should follow the theme's accent color
- Test new theme-related changes across all available themes to ensure consistency
- Consider adding theme color validation to ensure sufficient contrast for accessibility

# Padding Customization Feature

## Overview

The padding customization feature allows users to fine-tune the spacing between various elements in their profile page. This includes:

- Distance from page head to profile picture
- Distance between profile picture and name
- Spacing between link cards
- Height/padding of link cards

## Implementation Details

### Database Schema

```prisma
model User {
  // ... other fields ...
  headToPicturePadding Int @default(40)
  pictureToNamePadding Int @default(16)
  betweenCardsPadding Int @default(16)
  linkCardHeight Int @default(16)
}
```

### API Endpoint

The `/api/customize` endpoint handles padding updates through a PATCH request:

```javascript
{
  headToPicturePadding: number,
  pictureToNamePadding: number,
  betweenCardsPadding: number,
  linkCardHeight: number
}
```

### Components

- `PaddingSelector`: Main component for adjusting padding values
- Preview updates in real-time through React Query and iframe signaling
- Values range from 0px to 200px in 5px increments

### Usage Example

```jsx
<PaddingSelector />
```

### Best Practices

1. Always use the default values as fallbacks
2. Ensure padding changes are reflected immediately in previews
3. Use consistent units (px) throughout the application
4. Maintain mobile responsiveness with padding changes

### Notes

- Padding values are saved per-user in the database
- Changes are immediately reflected in both mobile and desktop previews
- The feature maintains compatibility with all themes
- All padding values use pixels for consistency

# Project Learnings and Documentation

## Bio Description Display

### Changes Made (2024)

- Standardized bio width to match link cards (max-w-3xl = 768px)
- Added expandable functionality for long bios
- Implemented consistent width and padding across all views
- Synchronized preview and main profile dimensions

### Key Considerations

1. Text Display

   - Bio text uses line-clamp-3 for initial display
   - "Show more" button appears for bios longer than 3 lines
   - Text wrapping works naturally on all screen sizes
   - Padding matches link card container (px-8)

2. Responsive Design

   - Full width (w-full) on all screen sizes
   - Max width matches link cards (max-w-3xl = 768px)
   - Font size remains configurable through bioFontSize setting
   - Consistent padding across all breakpoints

3. Component Consistency
   - Bio container matches link card container structure
   - Preview exactly mirrors main profile display
   - Expand/collapse behavior synchronized between views
   - Theme-based styling for interactive elements

### Implementation Details

1. Container Structure

   ```jsx
   <div className="w-full max-w-3xl px-8">
     <p className="text-center mt-1 mb-4 break-words whitespace-normal line-clamp-3">
       {bio}
     </p>
     {/* Show more button when needed */}
   </div>
   ```

2. Expandable Text
   - Uses line-clamp-3 for initial state
   - Smooth transition for expand/collapse
   - Button inherits theme accent color
   - Mobile-friendly touch targets

### Future Considerations

1. Monitor user feedback on 3-line threshold
2. Consider adding animation for expand/collapse
3. Watch for very long bios impact on layout
4. Keep preview component in sync with any future changes

### Best Practices

1. Always maintain width consistency with link cards
2. Use theme colors for interactive elements
3. Ensure mobile-first responsive design
4. Keep preview and main profile synchronized

# Profile Frame Optimizations

## Overview

The profile frame system has been optimized for performance while maintaining visual quality and animation capabilities. Key optimizations include frame caching, style optimization, and efficient SVG rendering.

### Implementation Details

1. Frame Caching System

   - Uses `getFrameCacheKey` to generate unique cache keys based on frame properties
   - Cache key includes frame type, size, color, rotation, name, and animation settings
   - Prevents unnecessary re-renders of identical frames

2. Style Optimization

   - `getOptimizedStyles` function provides performance-optimized styles
   - Conditional application of hardware acceleration
   - Efficient handling of transform properties

3. SVG Rendering
   - Encapsulated rendering logic in `renderFrame` functions
   - Optimized SVG paths and patterns
   - Efficient use of SVG masks and clips
   - Pattern-based text rendering for decorative elements

### Frame Templates

All frame templates follow a consistent optimization pattern:

```tsx
const FrameComponent = (props) => {
  const cacheKey = getFrameCacheKey(/* frame properties */);
  const isAnimated = animation?.enabled && animation.type !== null;
  const optimizedStyles = getOptimizedStyles(isAnimated);
  const renderFrame = () => (/* SVG rendering logic */);
  return useOptimizedFrame(renderFrame, cacheKey);
};
```

### Best Practices

1. Always generate unique cache keys for different frame configurations
2. Use hardware acceleration only when necessary (animations)
3. Encapsulate SVG rendering logic for better maintainability
4. Implement consistent optimization patterns across all frame templates
5. Consider performance impact when adding new frame features

### Future Considerations

1. Monitor frame rendering performance with multiple instances
2. Consider implementing frame preloading for common configurations
3. Add performance metrics tracking
4. Optimize animation transitions further if needed
5. Consider implementing frame template lazy loading

# Profile Picture Frame Improvements

## Implementation Decisions

### Container Structure

- Implemented a two-layer approach with proper z-indexing:
  - Frame layer (z-10): Contains the SVG frame
  - Image layer (z-0): Contains the image with proper scaling
- Used absolute positioning for both layers to ensure perfect alignment
- Added overflow handling to prevent image spillover
- Maintained consistent structure across all avatar components

### Image Sizing

- Implemented dynamic image scaling based on frame type and thickness
- Used 90% of frame inner space for image (imageScale = 0.9)
- Added conditional border radius for circle frames
- Ensured proper centering with flex layout
- Used object-fit: cover for consistent image display

### Frame Templates

- Standardized viewBox calculations across all frame types
- Added proper thickness handling for stroke width
- Implemented dynamic frame size calculations
- Maintained aspect ratio consistency
- Added proper caching based on all relevant properties

## Lessons Learned

1. SVG Optimization

   - Using viewBox for consistent scaling
   - Proper stroke positioning for clean edges
   - Importance of caching for performance

2. Image Handling

   - Need for overflow control
   - Importance of proper aspect ratio maintenance
   - Benefits of object-fit for consistent display

3. Component Structure
   - Value of consistent patterns across components
   - Importance of proper z-index management
   - Benefits of clear layer separation

## Browser-Specific Considerations

1. Safari

   - Needs vendor prefixes for object-fit
   - May require additional overflow handling

2. Mobile Browsers
   - Touch events need larger hit areas
   - Different pixel density considerations

## Future Improvements

1. Performance

   - Consider implementing lazy loading for frames
   - Add more aggressive caching strategies

2. Accessibility

   - Add proper ARIA labels for frames
   - Improve keyboard navigation support

3. Features
   - Consider adding more frame types
   - Add support for custom frame patterns
   - Consider adding frame shadow options

## Best Practices

1. Frame Implementation

   - Always validate thickness before rendering
   - Use proper caching mechanisms
   - Maintain consistent viewBox calculations

2. Image Handling

   - Always handle missing images gracefully
   - Maintain proper aspect ratios
   - Use proper scaling calculations

3. Component Structure
   - Keep consistent patterns across components
   - Use proper z-index management
   - Maintain clear separation of concerns
