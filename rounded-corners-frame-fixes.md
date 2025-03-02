# Rounded Corners Frame Implementation Fixes

## Issue: ReferenceError: props is not defined

### Problem

When implementing the rounded corners frame template, we encountered a runtime error:

```
Unhandled Runtime Error
ReferenceError: props is not defined

Source
components\utils\header-avatar.jsx (57:26) @ props

  55 |   };
  56 | case 'rounded-corners': {
> 57 |   const cornerStyle = props?.cornerStyle || 'squircle';
     |                      ^
  58 |   const borderRadius = props?.allCorners
  59 |     ? `${props.borderRadius || 20}%`
  60 |     : `${props.topLeftRadius || 20}% ${props.topRightRadius || 20}% ${props.bottomRightRadius || 20}% ${props.bottomLeftRadius || 20}%`;
```

The error occurred because we were trying to access `props` in the `getFrameSpecificStyles` function, but `props` was not defined in that scope.

### Solution

1. Updated the `getFrameSpecificStyles` function to accept a `props` parameter with a default empty object:

   ```javascript
   const getFrameSpecificStyles = (template, thickness, pictureRotation, props = {}) => {
     // ...
   };
   ```

2. Created a `frameProps` object with all the rounded corners properties:

   ```javascript
   const frameProps = {
     cornerStyle: fetchedUser?.frameCornerStyle || 'squircle',
     borderRadius: fetchedUser?.frameBorderRadius || 20,
     allCorners: fetchedUser?.frameAllCorners ?? true,
     topLeftRadius: fetchedUser?.frameTopLeftRadius || 20,
     topRightRadius: fetchedUser?.frameTopRightRadius || 20,
     bottomLeftRadius: fetchedUser?.frameBottomLeftRadius || 20,
     bottomRightRadius: fetchedUser?.frameBottomRightRadius || 20,
   };
   ```

3. Passed the `frameProps` to both the style function and the frame component:

   ```javascript
   const frameStyles = getFrameSpecificStyles(
     fetchedUser.frameTemplate,
     thickness,
     pictureRotation,
     frameProps
   );

   // When rendering the frame
   renderFrame(fetchedUser.frameTemplate, {
     // other props...
     ...frameProps,
   });
   ```

This ensures that all the necessary properties are available when rendering the rounded corners frame.

## Issue: Missing UI Components

### Problem

The implementation required UI components that didn't exist in the codebase:

- `@/components/ui/slider`
- `@/components/ui/switch`
- `@/components/ui/label`

### Solution

Created the missing UI components:

1. **Slider Component**:

   - Created a custom slider component with proper styling
   - Added accessibility attributes
   - Implemented value change handling

2. **Switch Component**:

   - Created a toggle switch component
   - Added proper accessibility attributes
   - Implemented checked state handling

3. **Label Component**:
   - Created a simple label component
   - Added proper styling to match the design

## Lessons Learned

1. **Props Passing**: When implementing frame-specific styles, ensure that all required properties are properly passed to the style generation functions.

2. **Component Dependencies**: Before implementing new features, check if all required UI components exist in the codebase.

3. **Accessibility**: When creating UI components, ensure they have proper accessibility attributes.

4. **Default Values**: Always provide default values for optional parameters to prevent runtime errors.

5. **Error Handling**: Runtime errors like "props is not defined" can be difficult to debug. Always check the call stack to identify where the error is occurring.

## Future Considerations

1. **UI Component Library**: Consider implementing a more comprehensive UI component library to avoid having to create basic components like sliders and switches for each new feature.

2. **Type Safety**: Use TypeScript more extensively to catch these kinds of errors at compile time rather than runtime.

3. **Testing**: Implement unit tests for the frame components to ensure they work correctly with different props configurations.
