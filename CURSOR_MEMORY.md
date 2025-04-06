# Cursor Memory for Librelinks

## UI Parameters and Settings

### Padding and Spacing

- The application uses both percentage-based and pixel-based spacing throughout the UI
- When transitioning from percentage to pixel-based spacing, make sure to update both the schema and the UI component
- The padding selector component in `components/core/custom-padding/padding-selector.jsx` handles all spacing preferences

### Horizontal Margin Implementation

- Added a new setting for horizontal margin (px-0 to px-16) to replace percentage-based margins
- The `pageHorizontalMargin` field in the User model stores the pixel value (0-16)
- In the [handle].jsx page, we use template literals to dynamically set Tailwind classes like `px-${value}`
- Different spacing parameters may have different step sizes and ranges:
  - Regular spacing uses steps of 5px with range -500px to 500px
  - Horizontal margin uses steps of 1px with range 0px to 16px
- Horizontal margin setting is only managed in the padding selector component (removed from the Sizes component to avoid duplication)

### Button Styles

- The application supports multiple button style options in `components/core/custom-buttons/buttons-selector.jsx`
- Button styles are organized into categories (Fill, Transparent, Hard shadow, Horizontal lines, Bottom line only)
- Each category has three variants: no rounding, medium rounding, and full rounding
- Both `text-card.jsx` and `links-card.jsx` components check for specific style flags to apply the correct styling:
  - `isTransparent` - For transparent background buttons
  - `hasShadowProp` - For buttons with hard shadow effect
  - `isHorizontalOnly` - For buttons with only top and bottom borders (no side borders)
  - `isBottomOnly` - For buttons with only a bottom border (no top or side borders)
- When adding new button styles:
  1. Add the new style category to the `buttonOptions` array in buttons-selector.jsx
  2. Update the TextCard and LinkCard components to handle the new style correctly
  3. Include a class name in the css property that can be checked (e.g., 'horizontal-only', 'bottom-only')

### Lessons Learned

- When adding new UI settings:
  1. Update the Prisma schema first
  2. Add the setting to the UI components that control it
  3. Update the component that uses the setting to correctly apply it
  4. Test with different values to ensure it works as expected
- For Tailwind classes that need dynamic values, use template literals in className strings
- Avoid duplicating settings across multiple components to prevent confusion and inconsistency

## Iframe Refresh Mechanism

### How Previews Work

- The application uses iframes for real-time previews of the user's profile
- Two main preview components exist:
  - `components/shared/profile-preview/preview.jsx` - Desktop preview
  - `components/shared/profile-preview/preview-mobile.jsx` - Mobile preview
- Iframe refreshing is triggered in three main ways:
  1. When dependencies change (via refreshDependencies array)
  2. When message events are received (via signalIframe utility)
  3. When the refreshKey state is incremented

### Important Tips for Iframe Updates

- **For Position Changes:** When implementing drag-and-drop or any feature that changes item ordering:

  1. Use `signalIframe('refresh')` rather than more specific signals like 'update_links' or 'update_user'
  2. Make sure the preview components have a dependency that changes when order changes
  3. Include order/position data in the iframe's key attribute to force re-render

- **For Card Position Tracking:**

  - The `refreshDependencies` array must include a value that changes when link order changes
  - We use `linksOrderString` and `textsOrderString` to create a string that changes when item positions change
  - These strings are constructed by sorting items by order, mapping them to a format that includes order, and joining with a separator

- **When Debugging Iframe Refresh Issues:**
  1. Check what signal is being sent (`signalIframe` function call)
  2. Verify both preview components are set up to handle that signal
  3. Ensure the relevant data is included in both the refreshDependencies array and the iframe key
  4. Use more general 'refresh' signals instead of specific ones when in doubt

## Link Expansion Toggle

### How the "Always Expand" Toggle Works

- Each link card includes an "Always Expand" toggle to control whether rich media previews are shown by default
- The toggle state is stored in the database as `alwaysExpandEmbed` field on the Link model
- For user profiles, the expansion states are passed via `linkExpansionStates` in the user object

### Implementation Details:

- **Database Structure**:

  - Each `Link` record has an `alwaysExpandEmbed` boolean field
  - User model does not directly store expansion states (they're derived from links at runtime)

- **API Structure**:

  - `GET /api/users/[handle]` endpoint creates a map of link IDs to expansion states
  - Returns `linkExpansionStates` as an object: `{ [linkId]: boolean }`

- **Frontend Usage**:
  - In admin panel: Direct toggle that updates the link record
  - In user profile: Reads from `fetchedUser.linkExpansionStates[item.id]`

### Troubleshooting Expansion Toggle Issues:

1. Check that API is processing and returning `linkExpansionStates` correctly
2. Ensure toggle state changes trigger both invalidation of queries AND iframe refresh
3. Use multiple refresh signals with timeouts to ensure iframe properly updates
4. Add explicit debug logging if toggle state changes are not properly reflected

### Recent Fixes:

- Enhanced preview refresh by adding delayed secondary refresh after state updates
- Improved the API to properly collect and process expansion states from all links
- Added proper dependency tracking in the links-card component
- Invalidated both link queries and user queries when toggle state changes
