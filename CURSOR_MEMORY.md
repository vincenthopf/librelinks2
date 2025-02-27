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

# Project Dependencies

## Essential Packages

### date-fns

- Used for formatting relative dates in the background image list component
- Required import format: `import { formatDistanceToNow } from 'date-fns';`
- Provides human-readable time formatting (e.g., "2 days ago")
- Must be installed with: `npm install date-fns`
- Used in components:
  - BackgroundImageList.jsx - For displaying when images were added

### Lessons Learned

1. Always verify that all required dependencies are installed before deploying new features
2. Use package.json to track all dependencies and their versions
3. When encountering "Module not found" errors, first check if the package is properly installed
4. Pay attention to the correct import paths for packages

## UI Component System

### Overview

The application uses a custom UI component system based on React and Tailwind CSS. These components are found in the `components/ui/` directory and follow a consistent pattern.

### Key Components

- `Button`: Versatile button component with various styles and sizes
- `Input`: Text input field with consistent styling
- `Textarea`: Multi-line text input field
- `Switch`: Toggle switch component with on/off state and keyboard accessibility
- `Label`: Text label component for form elements with support for required fields

### Implementation Pattern

All UI components:

1. Use the React.forwardRef pattern for ref forwarding
2. Use the cn() utility from lib/utils.js for class name merging
3. Have consistent focus and disabled states
4. Export a named component for clear imports
5. Include accessibility attributes
6. Support keyboard navigation where appropriate

### Switch Component

The Switch component specifically:

- Uses role="switch" and aria-checked for accessibility
- Implements a sliding animation for state changes
- Handles the checked state and change callback
- Supports keyboard interaction (Enter and Space keys)
- Includes screen reader text (sr-only) for on/off states
- Has proper focus ring styling with offset
- Properly handles disabled states

### Label Component

The Label component:

- Associates with form controls via htmlFor attribute
- Supports required field indication with red asterisk
- Handles disabled state with reduced opacity
- Maintains consistent text styling and spacing
- Can be customized with additional classes

### Accessibility Considerations

1. Keyboard Navigation

   - All interactive components are keyboard accessible
   - Focus states are clearly visible
   - Tab order follows logical document flow

2. Screen Readers

   - Appropriate ARIA attributes on all components
   - Hidden descriptive text for visual-only elements
   - Proper labeling of form controls

3. Visual Accessibility
   - Sufficient color contrast for text elements
   - Focus indicators visible in all states
   - Disabled states clearly indicated

### Lessons Learned

1. When encountering "Module not found" errors for UI components, check if the component exists in the components/ui directory
2. Follow consistent patterns when creating new UI components to maintain design coherence
3. All components should handle accessibility attributes appropriate to their function
4. Remember to implement proper keyboard focus states on interactive elements
5. Always include screen reader support for state changes in toggle components
6. Handle disabled states consistently across all components

## Background Image Persistence During Theme Changes

### Issue Description

When changing themes in the Customize tab, background images would temporarily disappear. The theme's background color would override the background image during the iframe refresh, and the background image would only reappear after a manual page refresh.

### Root Cause

1. **CSS Precedence Problem**: The theme's background color had higher precedence than the background image in the style application order.
2. **State Update Sequence**: When changing themes, the background image state wasn't being explicitly preserved.
3. **Iframe Refresh Timing**: The iframe was being refreshed before all state updates were complete.

### Solution Implemented

1. **Improved Background Image Styles**:

   - Modified the backgroundImageStyles object to include the theme color as a fallback
   - Used the CSS background shorthand property to properly layer the image over the theme color
   - Added smooth transitions for theme and background image changes

   ```jsx
   const backgroundImageStyles = fetchedUser?.backgroundImage
     ? {
         background: `${theme.primary} url(${fetchedUser.backgroundImage})`,
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat',
         transition: 'background 0.3s ease-in-out',
       }
     : {};
   ```

2. **Updated CSS Application Order**:

   - Changed the style object to prioritize background image over theme color
   - Used conditional rendering to apply the appropriate styles based on whether a background image exists

   ```jsx
   <section
     style={{
       ...(fetchedUser?.backgroundImage
         ? backgroundImageStyles
         : { background: theme.primary, transition: 'background 0.3s ease-in-out' })
     }}
     className="h-[100vh] w-[100vw] overflow-auto"
   >
   ```

3. **Enhanced Theme Selection Handler**:

   - Modified the theme selection handler to explicitly preserve the background image
   - Updated the API call to include the current background image when changing themes

   ```jsx
   const mutateTheme = useMutation(
     async (theme) => {
       const backgroundImage = currentUser?.backgroundImage;

       await axios.patch('/api/customize', {
         themePalette: theme,
         backgroundImage: backgroundImage,
       });
     }
     // ...
   );
   ```

4. **Improved Iframe Signaling**:

   - Added a small delay to the signalIframe function to ensure all state updates are complete
   - Used a more specific message type for better debugging

   ```jsx
   export const signalIframe = () => {
     setTimeout(() => {
       const iframe = document.getElementById('preview');
       if (iframe) {
         iframe.contentWindow.postMessage('refresh', '*');
       }
     }, 50);
   };
   ```

### Lessons Learned

1. **CSS Layering**: When using multiple background properties, be mindful of the precedence and layering order.
2. **State Preservation**: When updating one aspect of state, explicitly preserve other related state to prevent unintended resets.
3. **Timing Issues**: Use small delays when necessary to ensure state updates are complete before triggering UI refreshes.
4. **Smooth Transitions**: Adding CSS transitions can help mask any brief flickering during state changes.

### Best Practices

1. Use the CSS background shorthand property to properly layer images over colors
2. Explicitly preserve related state when making partial updates
3. Add small delays to ensure state updates are complete before refreshing UI
4. Use CSS transitions for smoother visual updates
5. Include fallbacks for when images are loading or fail to load

# Background Image Positioning Fixes

## Issue Description

When changing themes in the Customize tab, the background image would shift position and not remain centered, causing a jarring visual effect during transitions.

## Root Cause

1. **CSS Property Handling**: Using the shorthand `background` property caused inconsistent positioning during transitions.
2. **Incomplete Background Properties**: Missing default background properties when no image was present caused positioning shifts when adding/removing images.
3. **Transition Timing**: The transition was being applied to all background properties including position, which caused the shifting.

## Solution Implemented

1. **Separated Background Properties**:

   - Split the shorthand `background` property into individual properties
   - Used explicit `backgroundColor` and `backgroundImage` properties
   - Applied more specific `backgroundPosition: 'center center'`
   - Added `backgroundAttachment: 'fixed'` to prevent position shifts during transitions

   ```jsx
   const backgroundImageStyles = fetchedUser?.backgroundImage
     ? {
         backgroundColor: theme.primary,
         backgroundImage: `url(${fetchedUser.backgroundImage})`,
         backgroundSize: 'cover',
         backgroundPosition: 'center center',
         backgroundRepeat: 'no-repeat',
         backgroundAttachment: 'fixed',
         transition: 'background-color 0.3s ease-in-out',
       }
     : {};
   ```

2. **Consistent Default Properties**:

   - Added default background properties even when no image is present
   - Ensured `backgroundPosition` and `backgroundSize` are consistent

   ```jsx
   ...(fetchedUser?.backgroundImage
     ? backgroundImageStyles
     : {
         backgroundColor: theme.primary,
         transition: 'background-color 0.3s ease-in-out',
         backgroundPosition: 'center center',
         backgroundSize: 'cover'
       })
   ```

3. **Improved Iframe Refresh Timing**:
   - Increased the delay in `signalIframe` function to 100ms
   - Ensures all style changes are fully applied before refreshing the preview

## Lessons Learned

1. **CSS Property Specificity**: Use individual CSS properties instead of shorthand when animations/transitions are involved.
2. **Consistent Default Properties**: Always set the same positioning properties for both states to prevent shifts.
3. **Selective Transitions**: Only transition specific properties (like color) rather than all properties.
4. **Fixed Positioning**: For full-screen background images, consider using `backgroundAttachment: 'fixed'` for more stable positioning.
5. **Transition Timing**: Ensure adequate delays for iframe refreshes when transitioning complex styles.

# Background Image Selection Persistence Fix

## Issue Description

When a user selected a background image and refreshed the page, the UI would reset to showing the "None" option as selected (checkmark), even though the actual background image was still applied to the profile.

## Root Cause

The `backgroundImage` field was missing from the `select` object in the `serverAuth.js` file, which meant that when the current user data was fetched, it didn't include the background image information. This caused the UI component to reset to its default state, showing the checkmark on the "None" option.

## Solution Implemented

1. **Updated serverAuth.js File**:

   - Added `backgroundImage: true` to the `select` object in the user query
   - This ensures the background image information is included in the current user data

   ```javascript
   const currentUser = await db.user.findUnique({
     where: {
       email: session.user.email,
     },
     select: {
       // ... other fields
       backgroundImage: true,
       // ... other fields
     },
   });
   ```

2. **Improved State Management in Background Image Selector**:

   - Enhanced the useEffect hook to explicitly handle both image selection and removal cases
   - Updated the image selection and removal handlers to be more robust
   - Added error handling for better debugging

   ```javascript
   useEffect(() => {
     if (currentUser) {
       if (currentUser.backgroundImage) {
         setSelectedImage(currentUser.backgroundImage);
       } else {
         setSelectedImage(null);
       }
     }
   }, [currentUser]);
   ```

## Lessons Learned

1. **Complete Data Queries**: Always ensure that database queries select all fields needed by UI components.
2. **Explicit State Handling**: Handle both the presence and absence of data explicitly in state management.
3. **Robust Error Handling**: Include proper error handling in asynchronous operations.
4. **State Consistency**: Ensure local state (selectedImage) stays consistent with server state (currentUser.backgroundImage).
5. **Query Invalidation**: Use query invalidation to force data refreshes after state changes.
