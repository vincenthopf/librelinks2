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

### Lessons Learned

- When adding new UI settings:
  1. Update the Prisma schema first
  2. Add the setting to the UI components that control it
  3. Update the component that uses the setting to correctly apply it
  4. Test with different values to ensure it works as expected
- For Tailwind classes that need dynamic values, use template literals in className strings
