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
- Distance between profile name and bio
- Spacing between link cards
- Height/padding of link cards

## Implementation Details

### Database Schema

```prisma
model User {
  // ... other fields ...
  headToPicturePadding Int @default(40)
  pictureToNamePadding Int @default(16)
  nameToBioPadding Int @default(10)
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
  nameToBioPadding: number,
  betweenCardsPadding: number,
  linkCardHeight: number
}
```

### Components

- `PaddingSelector`: Main component for adjusting padding values
- Preview updates in real-time through React Query and iframe signaling
- Values range from -100px to 200px, with negative values creating overlap effects
- Supports both dropdown/slider selection and visual indicators for negative spacing

### Usage Example

```jsx
<PaddingSelector />
```

### Interactive Padding Feature

The PaddingSelector component now includes an interactive mode that allows users to directly drag and adjust padding elements in a visual interface:

1. **Mode Toggle**: Users can switch between traditional controls and interactive mode using a toggle switch
2. **Drag Interface**: Interactive elements have `cursor-move` styling and visual feedback
3. **Real-Time Updates**: Visual preview updates as the user drags elements
4. **Synchronization**: Updates are synchronized with the iframe preview through the signalIframe mechanism
5. **Precision**: Values are rounded to nearest 5px to maintain consistency with the dropdown options

### Implementation Details

- Uses React refs to track dragging state and initial positions
- Mouse event listeners are attached/detached dynamically during drag operations
- Updates are debounced and only committed when values actually change
- Visual elements provide clear affordances for which areas are draggable
- Value labels show current measurements during interaction

### Best Practices

1. Always use the default values as fallbacks
2. Ensure padding changes are reflected immediately in previews
3. Use consistent units (px) throughout the application
4. Maintain mobile responsiveness with padding changes
5. Provide clear visual feedback for interactive elements

### Notes

- Padding values are saved per-user in the database
- Changes are immediately reflected in both mobile and desktop previews
- The feature maintains compatibility with all themes
- All padding values use pixels for consistency
- The interactive interface is more intuitive for visual designers

## Name to Bio Padding Addition

The `nameToBioPadding` field has been added to control the spacing between the profile name and bio text:

- Added to User and Template database models with a default value of 10px
- Integrated into the PaddingSelector component with slider and dropdown controls
- Supports values from -100px to 200px, with negative values creating overlap effects
- Applied as marginTop to the bio container in the profile page

This new field enhances profile customization options, allowing for more creative layouts.

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
     <p className="text-center mt-1 mb-4 break-words whitespace-normal line-clamp-3">{bio}</p>
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
  const optimizedStyles = getOptimizedStyles(isAnimated || false);
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

# Z-Index Management for Overlapping Profile Elements

## Implementation Details

When implementing negative padding values in the profile layout, proper z-index management is essential to control element stacking order. This is particularly important when profile text needs to overlap with profile images.

### Key Principles

1. **Hierarchical Z-Index System**
   - Profile text elements (name, bio): z-index 15 (highest)
   - Profile avatar container: z-index 5 (middle)
   - Background elements: z-index 0-1 (lowest)
2. **Container Structure**
   - Wrap elements in relative-positioned containers
   - Apply z-index to container elements, not just the content
   - Use consistent z-index values across components
3. **Negative Padding Handling**
   - When pictureToNamePadding is negative, ensure text appears above image
   - Text containers need higher z-index than image containers
   - Ensure frame elements don't block text visibility

### Implementation Example

```jsx
{
  /* Profile container with proper stacking */
}
<div className="relative flex flex-col items-center">
  {/* Avatar wrapper with middle z-index */}
  <div className="relative" style={{ zIndex: 5 }}>
    <UserAvatarSetting isPreview={true} handle={handle} />
  </div>

  {/* Text content with highest z-index */}
  <div className="relative" style={{ zIndex: 15 }}>
    <p>{userName}</p>
    <div>{userBio}</div>
  </div>
</div>;
```

### Best Practices

1. **Consistent Z-Index Scale**
   - Use a clear scale with gaps between values (0, 5, 10, 15)
   - Document z-index hierarchy in component comments
   - Keep related elements within the same stacking context
2. **Containment for Stacking Contexts**
   - Create new stacking contexts for related elements
   - Use relative positioning to establish stacking contexts
   - Avoid unnecessary z-index values to prevent conflicts
3. **Testing Edge Cases**
   - Test with extreme negative padding values
   - Verify proper stacking across different themes and customizations
   - Ensure proper behavior across all supported devices and browsers

# Iframe Preview Refresh System

## Overview

The iframe preview system uses PostMessage communication to update previews when changes are made to the profile. Understanding this system is crucial for implementing features that need real-time preview updates.

### Message Types

The system uses three main message types:

1. **`refresh`**: Triggers a complete iframe refresh - use for significant changes that affect multiple aspects of the profile
2. **`update_user`**: Updates user-related data - use for changes to user properties like theme, fonts, and padding
3. **`update_links`**: Updates link-related data - use for changes to links, their order, or visibility

### Key Components

1. **`signalIframe` Function**

   - Located in `utils/helpers.js`
   - Sends messages to both desktop and mobile preview iframes
   - Takes a message type parameter with a default of 'refresh'
   - Uses requestAnimationFrame for better performance

2. **Preview Components**

   - Both `preview.jsx` and `preview-mobile.jsx` listen for messages
   - Use state keys to force re-renders when messages are received
   - Should handle all message types for consistent behavior

3. **Profile Page**
   - In `pages/[handle].jsx`, processes messages differently based on type
   - Uses refetchQueries for efficient data updates
   - Implements batch processing for 'refresh' messages

### Implementation Best Practices

1. **Message Sending**
   - Call `signalIframe()` after state updates to ensure preview reflects changes
   - Use the most specific message type for the change (improves performance)
   - For critical updates, call in both onMutate and onSuccess callbacks

```jsx
// Example in a mutation
const mutation = useMutation(
  async data => {
    await axios.patch('/api/endpoint', data);
  },
  {
    onMutate: () => {
      // Optimistic update
      signalIframe('update_user');
    },
    onSuccess: () => {
      // Confirm update
      queryClient.invalidateQueries(['users']);
      signalIframe('refresh');
    },
  }
);
```

2. **Message Reception**
   - Preview components should handle all message types
   - Use a consistent approach to refreshing content
   - Include type checks to prevent errors with invalid messages

```jsx
// Example in preview component
useEffect(() => {
  const handleMessage = event => {
    if (
      event.data &&
      typeof event.data === 'string' &&
      ['refresh', 'update_user', 'update_links'].includes(event.data)
    ) {
      setRefreshKey(prev => prev + 1);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

3. **Performance Considerations**
   - Use 'update_links' or 'update_user' instead of 'refresh' when possible
   - Avoid excessive signaling during drag operations
   - Consider debouncing signals for operations that trigger rapid updates
   - Use optimistic updates with immediate signals for better UX

### Common Pitfalls

1. **Mismatch Between Sending and Receiving**

   - Sending 'update_user' but only listening for 'refresh'
   - This causes updates to appear delayed or missing

2. **Missing Signal Calls**

   - Not calling signalIframe after state updates
   - Not including signals in both onMutate and onSuccess

3. **Race Conditions**

   - Signaling before state updates are committed
   - Solution: Use callbacks or useEffect dependencies properly

4. **Excessive Refreshing**
   - Using 'refresh' for minor updates
   - Not debouncing frequent update signals

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
     async theme => {
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

# Font Customization Feature

## Overview

The font customization feature allows users to personalize the typography of their profile page by selecting different font families for various text elements. This includes:

- Profile name font family
- Bio text font family
- Link title font family

## Implementation Details

### Database Schema

```prisma
model User {
  // ... other fields ...
  profileNameFontFamily String @default("Inter")
  bioFontFamily String @default("Inter")
  linkTitleFontFamily String @default("Inter")
}

model Template {
  // ... other fields ...
  profileNameFontFamily String @default("Inter")
  bioFontFamily String @default("Inter")
  linkTitleFontFamily String @default("Inter")
}
```

### API Endpoint

The `/api/customize` endpoint handles font family updates through a PATCH request:

```javascript
{
  profileNameFontFamily: string,
  bioFontFamily: string,
  linkTitleFontFamily: string
}
```

### Components

- `FontSelector`: Main component for selecting font families
- `FontCard`: Component for displaying each font option in the grid
- Grid layout for easy visual selection
- Preview updates in real-time through React Query and iframe signaling
- Reset to default button for returning to the default font

### Font Loading Strategy

- All fonts are preloaded in the global CSS using Google Fonts
- CSS classes are defined for each font family for consistent styling
- Inline style application for dynamic font changes

### Best Practices

1. Always use the default font ('Inter') as fallback
2. Ensure font changes are reflected immediately in previews
3. Maintain consistent font options across all selectable elements
4. Consider font weight and style for optimal readability
5. Include font family in template settings for complete theme application

### Lessons Learned

1. **Font Loading Optimization**: Preloading all fonts in the global CSS ensures they're available when needed, but consider implementing a more efficient loading strategy for production (like loading only the fonts in use).

2. **Style Application**: Using inline styles for font application provides immediate visual feedback but consider using CSS classes for better performance in production.

3. **Template Integration**: When adding new customizable elements, always update the template system to include these new properties for a complete user experience.

4. **Preview Synchronization**: Real-time preview updates are essential for font selection, as users need immediate feedback to make informed choices.

5. **Default Values**: Always provide sensible defaults and fallbacks to ensure the UI remains consistent even if specific fonts fail to load.

6. **Component Structure**: Organizing font selection in a grid layout provides a clear visual representation of available options and simplifies the user experience.

7. **Unified Font Application**: Applying the same font to all text elements creates a more cohesive design and simplifies the user experience.

8. **Font Metadata**: Including designer/source information adds context and credibility to the font selection process.

### Future Considerations

1. Consider adding font weight options for more typography control
2. Implement font loading optimization to reduce initial page load time
3. Add font pairing recommendations for cohesive design
4. Consider adding custom font upload capability
5. Implement font filtering by style categories (serif, sans-serif, display, etc.)
6. Add font search functionality for larger font collections
7. Consider adding font categories or tags for easier navigation
8. Implement font favoriting for quick access to frequently used fonts

# Background Image Loading Optimization

## Issue Overview

The background image selection component had an issue where images would disappear and enter a loading state when hovered over, even though they were already loaded. This created a poor user experience with unnecessary flickering.

## Implementation Decisions

### Loading State Management

- Removed the `onMouseEnter` event handler that was triggering loading state on hover
- Implemented proper initialization of loading states when component mounts
- Used `useEffect` to set initial loading states for all images
- Maintained loading state only during actual image loading

### Image Loading Optimization

- Added `loading="eager"` attribute to prioritize visible images
- Added `decoding="async"` attribute to optimize browser image decoding
- Kept proper error handling for failed image loads
- Maintained loading indicators only during actual loading

## Lessons Learned

1. **Event Handler Caution**: Be careful with event handlers like `onMouseEnter` that might trigger state changes leading to unnecessary re-renders or visual flickering.

2. **Loading State Management**: Initialize loading states properly at component mount rather than on user interactions for resources that should load once.

3. **Image Optimization Attributes**: Use modern HTML attributes like `loading="eager"` and `decoding="async"` to optimize image loading performance.

4. **Component Lifecycle Awareness**: Be mindful of when components should load resources - typically on mount rather than on user interaction for static resources.

5. **User Experience Priority**: Prioritize smooth user experience by avoiding unnecessary loading states or flickering, especially for already-loaded content.

## Best Practices

1. Use `useEffect` with appropriate dependencies to initialize component state
2. Leverage modern HTML attributes for optimized resource loading
3. Avoid triggering loading states for already-loaded resources
4. Implement proper error handling for failed resource loads
5. Test interactions like hovering to ensure they don't cause visual disruptions

## Future Considerations

1. Consider implementing image preloading for critical resources
2. Monitor loading performance across different network conditions
3. Implement progressive loading for large image collections
4. Consider adding loading skeleton placeholders for better UX
5. Implement proper caching strategies for frequently accessed images

# Font Family Template Integration

## Overview

When implementing features that involve saving user settings as templates, it's important to ensure that all relevant fields are included in both:

1. The data preparation function (e.g., `prepareTemplateData`)
2. The database model for the template
3. The template creation process
4. The template application process
5. The server authentication and user selection process

## Implementation Details

For the font family template integration, we needed to:

1. Add `profileNameFontFamily`, `bioFontFamily`, and `linkTitleFontFamily` fields to the `select` object in `serverAuth.js`
2. Ensure the `prepareTemplateData` function includes these font family fields
3. Update the debug logging in `save-current.js` to include the font family fields
4. Update the template application process in `apply.js` to include the font family fields

## Key Lessons

1. **Complete User Data Selection**: Always ensure that the `serverAuth.js` file includes all necessary fields in the `select` object. This is a critical step that's easy to overlook.
2. **Field Synchronization**: When adding new customizable fields to the User model, make sure to update all related code paths:
   - Add the fields to the `serverAuth.js` file's `select` object
   - Add the fields to the Template model in the Prisma schema
   - Update the `prepareTemplateData` function to include the fields
   - Update the template application process to apply the fields
3. **Default Values**: Always provide sensible default values for fields that might be missing in older templates.
4. **Debug Logging**: Include comprehensive debug logging that shows all relevant fields to help identify missing data.

# Background Image Template Fix

## Issue Description

The "Apply Template" functionality was not loading the saved background image when a template was applied to a user's profile.

## Root Cause

The `backgroundImage` field was missing from the `prepareTemplateData` function in `lib/template-utils.js`. This meant that even though the background image URL was included in the user data and properly logged in the debug output, it wasn't being included in the template data that was saved to the database.

## Solution Implemented

1. **Updated Template Data Preparation**:
   - Added the `backgroundImage` field to the return object in the `prepareTemplateData` function
   - Included a fallback to `null` if the field is not present in the user data

```javascript
return {
  // ... other fields ...

  // Background image
  backgroundImage: currentUser.backgroundImage || null,
};
```

## Key Lessons

1. **Complete Template Data**: When preparing template data, ensure ALL customizable fields are included in the returned object.
2. **Field Consistency**: Maintain consistency between:
   - The fields selected in `serverAuth.js`
   - The fields included in the template data preparation
   - The fields in the Template model
   - The fields applied when a template is used
3. **Comprehensive Testing**: Test the complete flow from saving a template to applying it, verifying that all fields are correctly transferred.
4. **Systematic Approach**: When adding new customizable fields to the application, follow a systematic approach to update all related components:
   - Database schema
   - API endpoints
   - Data preparation functions
   - Application logic
   - UI components

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
- **Link**: For URL links with optional rich media previews
- **Text**: For text-only content
- **PhotoBookImage**: For images in photo albums

## Implementation Lessons

1. **API Routes Structure**: API routes are organized by resource in the `pages/api/` directory, following REST conventions.

2. **Data Flow**:

   - Admin panel components fetch and modify data using hooks (`useLinks`, `useTexts`, etc.)
   - Preview components load the actual user profile through an iframe
   - The user profile page (`[handle].jsx`) needs to be updated when new component types are added

3. **Rendering Logic in [handle].jsx**:

   - The profile page renders different content types based on their properties
   - For combined rendering (links, texts, photos), identify components by their unique properties (e.g., links have 'url', texts have 'content')
   - Content should be sorted by the 'order' field to maintain the user's preferred arrangement

4. **Theme System**:
   - Components should respect the user's theme preferences
   - Theme colors are passed to components via props
   - Consistent styling should be maintained across component types

# Photo Book Implementation

## Current State and Implementation

The Photo Book feature allows users to add and display photos in their profile. The current implementation supports a single photo book per user, with plans to extend to multiple photo books in the future.

### Key Components:

1. **PhotoBookItem Component**:

   - Displays a draggable photo book item in the links editor
   - Shows photo count and provides options to expand/collapse and delete
   - When expanded, shows the PhotoBookTab component

2. **PhotoBookTab Component**:

   - Manages photo layouts (Grid, Masonry, Portfolio, Carousel)
   - Contains the photo upload interface
   - Handles layout switching and display options

3. **PhotoUpload Component**:

   - Provides drag-and-drop file upload functionality
   - Handles validation and Cloudinary uploading
   - Allows adding title and description to photos

4. **AddPhotoBookModal Component**:
   - Allows creating a new photo book
   - For existing photos: Shows direct upload interface
   - For new users: Collects title/description and then shows upload interface

### Data Flow:

1. **usePhotoBook Hook**:

   - Provides data and mutations for photo management
   - Handles CRUD operations for photos
   - Manages layout preferences

2. **API Endpoints**:

   - `/api/photobook/photos`: Fetches all photos for the current user
   - `/api/photobook/upload`: Uploads photos to Cloudinary and stores metadata
   - `/api/photobook/photos/[id]`: Updates/deletes individual photos

3. **Database Structure**:
   - `PhotoBookImage` model in Prisma for storing photo metadata
   - Currently linked directly to `User` model (will be updated for multiple books)
   - User has `photoBookOrder` and `photoBookLayout` fields for display preferences

## Add Photo Button Fix

The "Add Photo" button was previously not working because it was missing its modal implementation. The fix involved:

1. Creating a new `AddPhotoBookModal` component that:

   - Handles both new photo book creation and adding to existing photo books
   - Uses a two-step process for new users (collect info, then upload)
   - Integrates with the existing photo upload component

2. Updating the `LinksEditor` component to:

   - Connect the "Add Photo" button to the new modal
   - Show the photo book item in the sortable list even when no photos exist yet
   - Properly handle the photo book order in the list

3. Enhancing the `PhotoBookItem` component to:
   - Show the count of photos in the book
   - Provide better visual feedback about the photo book contents

### Implementation Details:

For the initial implementation (before multiple photo books are supported):

- We use the `photoBookOrder` field to indicate that a photo book should be displayed
- When creating a new photo book, we set `photoBookOrder` to 0 to make it appear at the top
- The actual PhotoBookImage records are created when photos are uploaded
- The LinksEditor shows the photo book item even if there are no photos yet, as long as photoBookOrder is set

## Future Enhancements:

The multiple photo books implementation plan outlines a more robust approach that will:

1. Create a dedicated PhotoBook model in the database
2. Allow multiple photo books per user with different metadata
3. Enhance the UI for managing multiple books
4. Provide more options for organizing and displaying photos

# Cursor Memory - Photo Book Layout Enhancements

## Photo Layout Aspect Ratio Improvements

### Problem

Previously, the photo layouts (Grid, Masonry, Portfolio) were using fixed-size containers with forced aspect ratios. This resulted in:

- Images being cropped to fit the containers
- Loss of visual content due to cropping
- Distortion of the original image aspect ratios
- Reduced visual quality in the photo displays

### Solution

Updated the image handling to respect native aspect ratios:

1. Enhanced the `CloudinaryImage` component with:

   - Added a `preserveAspectRatio` prop to control aspect ratio behavior
   - Removed forced cropping when preserving aspect ratio
   - Implemented proper padding-based container sizing based on natural image dimensions
   - Added proper loading states that maintain layout stability

2. Updated the Grid, Masonry, and Portfolio layouts:

   - Removed all fixed height classes
   - Enabled preserveAspectRatio on all image components
   - Simplified container structures to allow images to define their own dimensions
   - Provided fallback minimum heights for error states

3. For Masonry layout specifically:
   - Simplified the column distribution to round-robin assignment
   - This works better with natural aspect ratios as heights are now determined by image content

### Benefits

- Images display with their natural proportions
- No content is cropped or distorted
- Layouts adapt to the actual image dimensions
- Visual quality is improved across all layouts
- Better user experience with photos displayed as intended

### Implementation

- All image containers now adapt to the natural aspect ratio of the uploaded photos
- Layout structure is maintained while allowing images to dictate their own dimensions
- Each layout still maintains its unique presentation style while respecting image proportions

## Photo Container Style Improvements

### Problem

The photo containers had rounded corners and excessive spacing between images, which:

- Created inconsistency with other UI elements that may have square corners
- Reduced the amount of visible photo content due to larger gaps
- Resulted in a more spaced-out, less cohesive visual appearance
- Made the photo book layouts appear less like a traditional photo album or gallery

### Solution

Updated the photo containers to have square corners and minimal spacing:

1. Removed rounded corners:

   - Removed all `rounded-md` classes from image containers in all layouts
   - Created clean, 90-degree corner containers for a more modern look
   - Ensured consistency across all three layout options (Grid, Masonry, Portfolio)

2. Reduced spacing between images:
   - Changed Grid layout from `gap-3` to `gap-1`
   - Reduced Masonry layout padding from `p-2` to `p-1` and column spacing accordingly
   - Reduced Portfolio layout padding from `p-1` to `p-0.5` for even tighter spacing
   - Reduced margin between groups from `mb-4` to `mb-1` in Portfolio layout

### Benefits

- More content-focused display with less wasted space
- Cleaner, more professional appearance with square corners
- More photos visible in the same viewport area
- Better use of available screen real estate
- More cohesive, grid-like appearance across all layouts

### Implementation

- All image containers now have 90-degree corners instead of rounded ones
- Spacing between images is minimal but still present to prevent images from bleeding together
- Consistency maintained across all three layout options

# Reorderable Photo Book Feature

## Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

## Implementation Details

### Database Schema

Added a new field to the User model to track the position of the Photo Book:

```prisma
model User {
  // ... other fields ...
  photoBookLayout      String      @default("grid") // Layout style for photo book
  photoBookOrder       Int?        @default(9999) // Position of the photo book in relation to links
}
```

- The `photoBookOrder` field determines where the Photo Book appears relative to links.
- By default, it's set to 9999 to position it at the end of all links.

### Components

#### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

#### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

## Usage

1. In the admin panel, users can drag the Photo Book item up or down to reposition it relative to their links.
2. The Photo Book position persists and appears in the correct position on the public profile.
3. The Photo Book and links can be freely reordered without limitations.

## Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Future Enhancements

1. Consider adding visual cues (like a divider) to make it clearer where the Photo Book will be positioned.
2. Allow toggling Photo Book visibility without removing all photos.
3. Consider extending this pattern to other content sections that may be added in the future.

# Collapsible Photo Book Implementation

## Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

## Implementation Details

### Component Structure

1. **PhotoBookItem Component**

   - Added collapsible functionality using `useState` hook
   - Implemented toggle button with chevron indicators
   - Used Framer Motion for smooth animation effects
   - Maintained drag-and-drop functionality for reordering

2. **PhotoBookTab Adaptation**
   - Added `embedded` prop to modify styling when used in the collapsible panel
   - Conditionally renders heading based on context
   - Adjusted spacing for better integration in the collapsible panel
   - Maintained all functionality (layout selection, photo upload, etc.)

### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

## Code Implementation

```jsx
// Collapsible toggle in PhotoBookItem
const [isExpanded, setIsExpanded] = useState(false);

// Toggle function
const toggleExpand = e => {
  e.preventDefault();
  setIsExpanded(!isExpanded);
};

// Animation container
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden border-t"
    >
      <div className="p-4">
        <PhotoBookTab embedded={true} />
      </div>
    </motion.div>
  )}
</AnimatePresence>;
```

## Future Considerations

1. Consider adding a photo count indicator in the collapsed state
2. Explore adding a mini preview of the photos in the collapsed state
3. Monitor performance with large photo collections
4. Consider adding a "quick edit" mode for faster photo management

## Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability

## API Select Clause Completeness

### Field Selection in API Endpoints

- When adding new fields to the database schema, they must be explicitly selected in relevant API endpoints:
  - New fields in the User model need to be added to the select clauses in `lib/serverAuth.js` and `pages/api/users/[handle].js`
  - The select clause determines which fields are returned in the API response
  - Missing fields in select clauses can lead to functionality issues even if the database schema is correct

### Debugging Drag-and-Drop Issues

- When drag-and-drop functionality doesn't work as expected:
  1. Check if the field being updated (e.g., `photoBookOrder`) is included in all relevant API select clauses
  2. Ensure the field is returned by the user data fetch operations
  3. Verify the field is being correctly updated in the database
  4. Check that the client-side state is updated with the new value
- The `photoBookOrder` field issue:
  - The field was correctly defined in the schema and updated in the database
  - It was missing from the select clauses in `serverAuth.js` and `pages/api/users/[handle].js`
  - This prevented the field from being returned to the client, causing the drag-and-drop position updates to not persist

# Project Knowledge Base

## Project Structure

- **Prisma DB Setup**: The database client is set up in `lib/db-init.js` and exported as `db` from `lib/db.js`. To make it accessible as `@/lib/prismadb` (which the API routes use), we created a `lib/prismadb.js` file that re-exports the client.

- **Component Types**: The project supports multiple component types:

  - Links (original functionality)
  - Text components (recently implemented)
  - Photo Books (partially implemented)

- **Preview System**: The profile preview panels use iframes to load the actual profile page (`pages/[handle].jsx`), passing the user's handle as a parameter.

## Component Architecture

- **Admin Panel Components**: Used in the editor interface (e.g., `TextItem` in `components/core/admin-panel/text-item.jsx`)
- **User Profile Components**: Used in the public-facing profile (e.g., `LinkCard` and `TextCard` in `components/core/user-profile/`)
- **Shared Components**: Modals and utilities used throughout the application (in `components/shared/`)

## Database Models

- **User**: Central model with relations to all content types
