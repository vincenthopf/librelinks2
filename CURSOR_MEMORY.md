# Cursor Memory for Idly.pro

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

## Button Styling

- The application has independent button styling for link cards (`buttonStyle`) and text cards (`textCardButtonStyle`)
- Each button style can be customized separately in the Customize tab
- TextCard component uses textCardButtonStyle if available, with buttonStyle as a fallback
- Button styles include options for Fill, Transparent, Hard shadow, Horizontal lines, and Bottom line only

## Database Schema

- User and Template models include fields for various customization options
- Button styling fields:
  - `buttonStyle`: Style for link cards
  - `textCardButtonStyle`: Style for text cards

## Layout Consistency

### Container Width and Padding Standards

- The application uses a consistent container width of `max-w-[640px]` for admin panel content
- All main content areas (LinksEditor, Settings, etc.) should use this same max-width constraint
- Key layout standards to maintain:
  1. All main content containers should use `max-w-[640px] mx-auto my-10`
  2. Card elements should use `rounded-2xl border bg-white p-6 w-full h-auto`
  3. Child elements within cards should use consistent padding and margins
- When adding new pages or components:
  - Check existing container widths in similar components (like LinksEditor)
  - Maintain consistent spacing between major UI elements (set by `my-10` in containers)
  - Use the same rounding and padding for card elements across the application

### Page Structure Pattern

- The standard page structure is:
  ```jsx
  <Layout>
    <div className="w-full lg:basis-3/5 pl-4 pr-4 border-r overflow-auto">
      <div className="max-w-[640px] mx-auto my-10">{/* Page-specific content */}</div>
    </div>
  </Layout>
  ```
- This structure ensures the content has consistent width and positioning across all admin pages

### Common Issues and Solutions

- Inconsistent padding can create visual misalignment between different pages
- Avoid nested padding containers (like multiple divs with padding) that compound spacing
- Keep card padding consistent (p-6) rather than using different values for different cards
- Use mb-6 for spacing between cards rather than adjusting padding

## Responsive Design Best Practices

### Profile Page Whitespace Issues

- Profile pages (`pages/[handle].jsx`) can experience unwanted whitespace at the bottom on small screens or when zoomed
- Issues commonly fixed include:
  1. Removed the fixed margin div (`<div className="my-10 lg:my-24" />`) at the bottom of the profile page
  2. Changed min-height from fixed `min-h-screen` to responsive `min-h-fit md:min-h-screen` to better adapt to content
  3. Used responsive padding that scales properly on different screen sizes

### Container Height Guidelines

- Use `min-h-fit` or `h-auto` instead of fixed heights when content size may vary
- Add responsive height classes that adjust based on screen size: `min-h-fit md:min-h-screen`
- Consider adding media query breakpoints for critical height adjustments
- Use percentage-based heights where appropriate, rather than fixed pixel values
- When using `min-h-screen`, ensure padding and margins don't force content overflow

### Padding and Margins for Mobile

- Test dynamic padding settings on various screen sizes to ensure they scale appropriately
- Use smaller padding/margin values on mobile:
  - `className="p-2 md:p-4 lg:p-6"`
  - `style={{ padding: isMobile ? '12px' : '24px' }}`
- Avoid fixed vertical margins at the bottom of pages, especially with `min-h-screen`
- Use flexible spacing units (rem/em) that scale with screen size and text

### Dynamic Embed Content Expansion

- Link cards with embeddable content (social media, videos, etc.) should use dynamic height rather than reserving space
- Key implementation details:
  1. Replace fixed `max-height` with dynamic `height: auto` for expanded state
  2. Use `height: 0` and `visibility: hidden` for collapsed state
  3. Only render the `RichMediaPreview` component when content is expanded (`{showPreview && <Component />}`)
  4. Add proper transition timing and overflow handling for smooth animations
- Benefits of dynamic expansion:
  - No empty whitespace is reserved when previews are collapsed
  - Page length adapts to actual visible content
  - Better user experience on mobile devices
  - More efficient rendering as hidden components aren't processed until needed
- When implementing expandable sections:
  - Always use conditional rendering for expensive components
  - Use `overflow: hidden` to prevent content leaking during transitions
  - Include proper ARIA attributes for accessibility

### Transparent Embed Backgrounds

- Embeds (iframely, social media cards, etc.) should have transparent backgrounds to blend with the theme
- Implementation requires several changes:
  1. Remove `bg-white` from the main container in `links-card.jsx`
  2. Add explicit `background: transparent` to ensure consistency
  3. Remove `bg-gray-50` from `DEFAULT_CONTAINER_CLASS` in `types/embed.ts`
  4. Remove background color from loading and error states in `embed-container.tsx`
- Benefits of transparent backgrounds:
  - Embeds blend seamlessly with the user's chosen theme
  - More cohesive and professional UI
  - Consistent appearance across different types of embedded content
- If a specific embed requires a background color, add it only to that specific embed container

## Cloudinary Image Handling

### Consistent Image Loading

- All images in the application (avatars, backgrounds, template thumbnails) should use the CloudinaryImage component
- Standardized upload parameters are defined in `lib/cloudinary.js`:
  - `getUploadParams` - for user profile images
  - `getTemplateUploadParams` - for template thumbnails
- Always use these helper functions rather than inline configuration to ensure consistency

### URL Parsing and Public IDs

- The CloudinaryImage component handles extraction of public IDs from Cloudinary URLs
- For robust URL handling, we use URL parsing with standardized path segment detection
- Key implementation details:
  1. Parse the URL properly using the URL constructor
  2. Split pathname into segments and look for the 'upload' segment
  3. Skip version segments (v1, v2) when extracting the public ID
  4. Remove file extensions from public IDs to ensure consistency
- When troubleshooting image loading:
  - Check browser console for "Original src" and "Extracted publicId" logs
  - Verify that Cloudinary URLs have consistent formats across different image types
  - Use the `preserveAspectRatio` prop for template thumbnails and other non-square images

### Image Component Configuration

- Critical props for reliable image loading:
  - `preserveAspectRatio`: Set to true for non-square images to maintain proportions
  - `sizes`: Configure responsive sizing based on viewport (e.g., "(max-width: 640px) 50vw, 33vw")
  - `priority`: Set to true only for above-the-fold critical images
  - `loading`: Use "lazy" for images that can be deferred
- Common issues:
  - Missing image with "Error loading thumbnail": Check CloudinaryImage component logs
  - Distorted images: Use preserveAspectRatio or adjust crop settings
  - Slow loading: Check image dimensions and quality settings

### Image Upload Size Limits

- Standard file size limit across the application is 10MB per image
- Batch uploads (multiple photos at once) have a 20MB total limit
- Size limits are enforced in multiple places:
  1. API route configurations via `sizeLimit: '10mb'` in the `config` object
  2. Server-side validation using `base64Size > 10 * 1024 * 1024`
  3. Client-side validation in components using `maxSize: 10 * 1024 * 1024` for dropzone
  4. UI messaging that informs users of the 10MB limit
- When implementing new upload features, maintain this 10MB standard for consistency

### Template Thumbnails

- Template thumbnails must maintain a consistent 9/19 aspect ratio across all views
- Implementation guidelines:
  1. Use `aspect-[9/19]` in the container div to ensure proper proportions
  2. Set both `width={360}` and `height={760}` in the CloudinaryImage component
  3. Always use `preserveAspectRatio={true}` for template thumbnails
  4. Set appropriate `sizes` attribute for responsive loading (e.g., "(max-width: 640px) 50vw, 33vw")
- The 9/19 ratio represents a mobile device screen which is appropriate for profile templates
- When uploading thumbnails, ensure that:
  1. The template uploader enforces this aspect ratio during cropping
  2. Template screenshots are captured in this ratio for consistency
  3. The preview dialog displays thumbnails in this aspect ratio
- Use the standardized `getTemplateUploadParams` function for all template uploads

## Repository Security and Code Protection

### Protecting Code While Keeping Vercel Deployment Working

- **Environment Variables Protection**:

  - Never commit real API keys, tokens, or secrets to the repository
  - Use `.env.example` as a template without real values
  - Set up environment variables directly in Vercel dashboard
  - Add all `.env*` files to `.gitignore` (except `.env.example`)

- **Sensitive Code Organization**:

  - Split proprietary algorithms and business logic into specific directories:
    - `/lib/proprietary/` - For unique business logic
    - `/lib/core-algorithms/` - For proprietary algorithms
    - `/config/private/` - For sensitive configuration
  - Add these directories to `.gitignore`
  - Use import aliases to reference these modules in public code

- **Documentation Handling**:

  - Implementation details and plans should be kept private
  - Use pattern matching in `.gitignore` to exclude implementation notes:
    - `*implementation-plan.md`
    - `*implementation-notes.md`
    - `*-fixes.md`
    - `*-implementation.md`

- **Vercel Configuration**:

  - Create a `vercel.json` file with appropriate build configuration
  - Configure git deployment settings in vercel.json
  - Use environment variables for any configuration needed during build

- **Preventing Direct Forking**:

  - While public repos can be forked, making critical parts private helps protect IP
  - Use environment variables for any unique service identifiers
  - Consider obfuscating critical frontend JavaScript if needed
  - Structure the repo so core algorithms can be moved to private packages

- **Code Structure Best Practices**:
  - Use dependency injection patterns to separate public interfaces from private implementations
  - Implement key algorithms as services that can be moved to private packages
  - Document public API interfaces while keeping implementation details private
  - Reference protected modules via imports rather than including critical code inline

## Project Notes & Lessons Learned

- **Database:** Uses MongoDB.
- **ORM:** Uses Prisma.
- **Authentication:** Uses NextAuth.js.
- **Cloud Storage:** Uses Cloudinary for image uploads (profile pictures, background images, etc.). Configured in `lib/cloudinary.js`.
- **UI Components:** Uses Shadcn UI (`components/ui`).
- **State Management/Data Fetching:** Uses `@tanstack/react-query` extensively for server state management.
- **Prisma & MongoDB Migrations:** Prisma's `migrate dev` command is **not** supported for MongoDB. Schema changes in `prisma.prisma` define the shape of data for Prisma Client but do not automatically trigger database-level migrations like in SQL databases. The application logic should handle data consistency if schema changes require data transformation.

## API Routes and TypeScript

When encountering TypeScript issues with App Router API routes (route.ts files), consider using Pages Router API endpoints instead. The pages/api approach has less strict typing requirements and can be easier to work with in some cases.

Example of conversion:

1. Create a standard API handler in `/pages/api/your-endpoint.ts`
2. Use the Pages API format with `export default function handler(req, res)`
3. Remove the App Router version if it exists to avoid conflicts

This approach was successfully used for the background-images API endpoint that had persistent TypeScript errors with the db import.
