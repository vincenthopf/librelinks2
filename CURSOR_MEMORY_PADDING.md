# Padding Customization Feature

## Overview

The padding customization feature allows users to fine-tune the spacing between various elements in their profile page. This includes:

- Distance from page head to profile picture
- Distance between profile picture and name
- Distance between profile name and bio
- Distance between bio and first link card
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
  bioToFirstCardPadding Int @default(24)
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
  bioToFirstCardPadding: number,
  betweenCardsPadding: number,
  linkCardHeight: number
}
```

### Components

- `PaddingSelector`: Main component for adjusting padding values
- Preview updates in real-time through React Query and iframe signaling
- Values range from -500px to 500px, with negative values creating overlap effects
- Supports both dropdown/slider selection and visual indicators for negative spacing

### Usage Example

```jsx
<PaddingSelector />
```

### Interactive Padding Feature

The PaddingSelector component includes an interactive mode that allows users to directly drag and adjust padding elements in a visual interface:

1. **Mode Toggle**: Users can switch between traditional controls and interactive mode using a toggle switch
2. **Drag Interface**: Interactive elements have `cursor-move` styling and visual feedback
3. **Real-Time Updates**: Visual preview updates as the user drags elements
4. **Synchronization**: Updates are synchronized with the iframe preview through the signalIframe mechanism
5. **Precision**: Values are rounded to nearest 5px to maintain consistency with the dropdown options

### Padding Controls Synchronization

To ensure consistent user experience, all padding controls are synchronized:

1. **Consistent Range**: All padding controls (except card height) have a range from -500px to 500px
2. **Dropdown-Slider Sync**: Dropdown options and slider ranges are synchronized to show the same values
3. **Step Size**: All controls use a step size of 5px for precise adjustments
4. **Visual Indicators**: Range labels accurately reflect the min/max values of each control
5. **Separate Card Height Options**: Card height has a separate range from 40px to 200px

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
