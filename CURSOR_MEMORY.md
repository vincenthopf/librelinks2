# Cursor Memory for Librelinks

## Styling and Layout Principles

- **Consistent Units**: When working with user customization settings:

  - Always use `px` units for styling rather than `rem` or other relative units to ensure consistency
  - This applies especially to padding, margins, font sizes and other customizable dimensions

- **Dynamic Spacing**:

  - Avoid hardcoded spacing values (like `padding: '1rem'` or `min-height: [450px]`)
  - Instead use dynamic values from user preferences with fallbacks: `${currentUser?.someValue ?? defaultValue}px`
  - **Crucially, ensure the `defaultValue` used in the code EXACTLY matches the `@default()` value set in `prisma/schema.prisma` for that specific field.**
  - All user spacing preferences are stored in pixel units in the database

- **StackedView Consistency**:

  - The StackedView mode (card stack view) and normal view should follow the same spacing rules
  - Both modes should fully respect user customization settings from the database
  - Navigation buttons and content spacing should adapt to user's `betweenCardsPadding` setting

- **Profile Preview Components**:

  - There are two distinct preview components (`preview.jsx` and `preview-mobile.jsx`) that should be kept in sync
  - Both should display identical spacing and follow the same dynamic styling principles
  - Avoid additional class modifiers in preview components that aren't present in the public profile (e.g., avoid classes like `mb-1` or `text-sm` that could cause inconsistencies)

- **Preview vs. Public Profile Consistency**:
  - The profile preview components should match the public profile page ([handle].jsx) styling
  - Class names in preview components should match those in public profile to ensure visual consistency
  - When making spacing changes, check both preview components and the public profile page
  - Use `betweenCardsPadding` consistently for spacing below the profile header section and below the social icons in all view modes.

## File Structure

- **Core UI Components**:
  - User profile components are in `components/core/user-profile/`
  - The stacked cards view is defined in `components/core/user-profile/stacked-cards-view.jsx`
- **Preview Components**:

  - Desktop preview is in `components/shared/profile-preview/preview.jsx`
  - Mobile preview is in `components/shared/profile-preview/preview-mobile.jsx`

- **Public Profile**:

  - The public profile page is defined in `pages/[handle].jsx`
  - This page represents what visitors see when they visit a user's profile

- **Schema**:
  - User preferences and settings are defined in `prisma/schema.prisma`
  - All spacing/dimension values are stored in pixel units (as integers)

## Bento View Implementation

- **Component Structure**:

  - Bento view is implemented in `components/core/bento-view/bento-cards-view.jsx`
  - Individual media items are rendered using `components/core/bento-view/media-item.jsx`
  - Bento grid layout configuration is handled in `components/settings/bento-layout-selector.jsx`

- **Data Mapping**:

  - Content mapping utilities for Bento view are in `utils/bento-helpers.js`
  - The `mapContentToBentoItems` function transforms user content into Bento grid-compatible format
  - When modifying Bento item data structure, ensure the changes are reflected in both the view component and mapping utility

- **Favicons**:
  - Favicons for links are generated using Google's favicon service: `https://www.google.com/s2/favicons?domain=`
  - The apex domain is extracted from the link URL using `getApexDomain` from `utils/helpers.js`
  - When implementing link cards in any view (Normal, Stacked, Bento), always ensure favicons are displayed consistently
  - The `GOOGLE_FAVICON_URL` constant is defined in `utils/constants.js` and should be used instead of hardcoding the URL
