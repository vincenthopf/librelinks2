# Padding Additions

## Name to Bio Padding Addition

The `nameToBioPadding` field has been added to control the spacing between the profile name and bio text:

- Added to User and Template database models with a default value of 10px
- Integrated into the PaddingSelector component with slider and dropdown controls
- Supports values from -500px to 500px, with negative values creating overlap effects
- Applied as marginTop to the bio container in the profile page

This new field enhances profile customization options, allowing for more creative layouts.

## Bio to First Card Padding Addition

The `bioToFirstCardPadding` field has been added to control the spacing between the user's bio and the first link card:

- Added to User database model with a default value of 24px
- Applied as marginTop to the link cards container in the profile page
- Provides visual separation between the bio text and the first interactive element
- Helps create a more balanced and visually appealing layout

### Implementation Details

1. Database Schema Update

   - Added `bioToFirstCardPadding` field to the User model with a default of 24px
   - Updated Prisma schema and generated the client

2. API Integration

   - Updated the `/api/customize.js` endpoint to handle the new field
   - Added the field to both the request body destructuring and the update data object

3. UI Implementation
   - Applied the padding as marginTop to the link cards container:
   ```jsx
   <div
     className="w-full flex flex-col"
     style={{
       gap: `${fetchedUser?.betweenCardsPadding || 16}px`,
       marginTop: `${fetchedUser?.bioToFirstCardPadding || 24}px`
     }}
   >
   ```

### Best Practices

1. Always use the default value (24px) as a fallback
2. Consider the relationship between this padding and other spacing elements
3. Test the padding with various bio lengths to ensure visual harmony
4. Maintain mobile responsiveness with padding changes

### MongoDB and Prisma Integration

When working with MongoDB and Prisma:

1. Use `npx prisma db push` instead of `npx prisma migrate dev` for schema changes

   - MongoDB provider doesn't support the standard migration commands
   - The db push command updates the schema without creating migration files

2. Always regenerate the Prisma client after schema changes:

   - Run `npx prisma generate` to update the client with new fields
   - This ensures the application code can access the new fields

3. Update API endpoints to handle new fields:
   - Add new fields to request body destructuring
   - Include new fields in the update data object
   - Provide proper validation if needed
