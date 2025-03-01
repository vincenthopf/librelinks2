# Multiple Photo Books Implementation Plan

## 1. Database Schema Updates

### Update Prisma Schema

- Create a new `PhotoBook` model:

  ```prisma
  model PhotoBook {
    id          String          @id @default(auto()) @map("_id") @db.ObjectId
    title       String
    description String?
    order       Int             @default(0)
    createdAt   DateTime        @default(now())
    updatedAt   DateTime        @updatedAt
    userId      String          @db.ObjectId
    user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
    images      PhotoBookImage[]

    @@index([userId])
  }
  ```

- Modify the `PhotoBookImage` model to relate to a specific photo book:

  ```prisma
  model PhotoBookImage {
    id          String    @id @default(auto()) @map("_id") @db.ObjectId
    userId      String    @db.ObjectId
    photoBookId String    @db.ObjectId
    publicId    String    @unique // Cloudinary public ID
    url         String
    title       String?
    description String?
    width       Int?
    height      Int?
    format      String?
    bytes       Int?
    order       Int       @default(0)
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    photoBook   PhotoBook @relation(fields: [photoBookId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@index([photoBookId])
  }
  ```

- Update the `User` model to include a relation to multiple photo books:

  ```prisma
  model User {
    // existing fields...
    photoBooks      PhotoBook[]
    photoBookImages PhotoBookImage[]
  }
  ```

- Run `npx prisma generate` to update the Prisma client

### Data Migration Strategy

- Create a migration that:
  1. Creates a default photo book for each user with existing photos
  2. Associates existing photos with the default photo book
  3. Updates references in the application

## 2. API Endpoints

### Photo Book Management Endpoints

#### Create `/api/photobooks` endpoints:

1. **GET `/api/photobooks`**

   - Fetch all photo books for the current user
   - Include count of photos in each book
   - Sort by order field

2. **POST `/api/photobooks`**

   - Create a new photo book
   - Fields: title, description
   - Auto-assign order based on existing photo books

3. **GET `/api/photobooks/[id]`**

   - Fetch a specific photo book with its photos
   - Validate user ownership

4. **PATCH `/api/photobooks/[id]`**

   - Update photo book metadata (title, description)
   - Optional: Update order (would require reordering other books)

5. **DELETE `/api/photobooks/[id]`**

   - Delete a photo book and all its photos
   - Implement cascade delete for related photos
   - Handle Cloudinary image deletion

6. **PUT `/api/photobooks/reorder`**
   - Update the order of multiple photo books
   - Handle batch updates in a transaction

### Update Existing Photo Endpoints

1. **Update `/api/photobook/upload`**

   - Add `photoBookId` parameter to specify which book to add the photo to
   - Validate that the photo book exists and belongs to the user

2. **Update `/api/photobook/photos`**

   - Add filtering by `photoBookId`
   - Update response structure to include photo book information

3. **Update `/api/photobook/photos/[id]`**
   - Add ability to move a photo between photo books
   - Implement validation for ownership of both source and target photo books

## 3. Frontend Components

### Create Add Photo Book Modal

1. **Create `components/shared/modals/add-new-photo-book.jsx`**
   - Form with fields:
     - Title (required)
     - Description (optional)
     - Initial photos upload (optional)
   - Form validation
   - API integration with new photo book endpoint
   - Success/error handling with toast notifications
   - Preview of uploaded photos

### Update PhotoBookItem Component

1. **Modify `components/core/admin-panel/photo-book-item.jsx`**
   - Update to accept `photoBook` object instead of generic `id`
   - Display photo book title instead of generic "Photo Book"
   - Display photo count
   - Update drag-and-drop handlers for reordering multiple photo books
   - Add edit button to modify photo book metadata
   - Update delete functionality to delete a specific photo book

### Create PhotoBookList Component

1. **Create `components/core/admin-panel/photo-book-list.jsx`**
   - Container for rendering multiple PhotoBookItem components
   - "Add Photo Book" button at the bottom
   - Empty state when no photo books exist
   - Drag-and-drop reordering using dnd-kit

### Update PhotoBookTab Component

1. **Modify `components/core/photo-book/photo-book-tab.jsx`**
   - Add photo book selector dropdown at the top
   - Update to display photos from the selected photo book
   - Update upload functionality to add photos to the selected book
   - Add ability to move photos between books

### Update Links Editor

1. **Modify `components/core/admin-panel/links-editor.jsx`**
   - Update to handle multiple photo book items in the sortable list
   - Update drag-and-drop logic to handle reordering of multiple photo books
   - Update the button to open the new photo book modal

## 4. User Interface Updates

### "Add Photo" Button Implementation

1. **Update `components/core/admin-panel/links-editor.jsx`**
   - Connect "Add Photo" button to new photo book modal
   - Update button action to either:
     - Create a new photo book if none exists
     - Open photo selector to add photos to existing book
     - Show a dropdown to select which book to add photos to (if multiple books exist)

### Photo Book Navigation UI

1. **Create UI for navigating between photo books**
   - Tabbed interface or dropdown selector
   - Visual indication of currently selected book
   - Preview thumbnails

### Drag and Drop Enhancements

1. **Update DnD implementation**
   - Allow reordering photo books in the links list
   - Enable moving photos between books
   - Visual feedback during drag operations

### Profile Preview Updates

1. **Update `preview.jsx` and `preview-mobile.jsx`**
   - Add navigation between multiple photo books
   - Update rendering to show selected photo book

## 5. Profile Page Updates

1. **Update `pages/[handle].jsx`**
   - Fetch all photo books for the profile
   - Add UI for navigating between photo books
   - Update rendering logic to display photos from selected book

## 6. State Management

1. **Create `usePhotoBooks` hook**

   - Fetch all photo books
   - CRUD operations for photo books
   - Handle reordering
   - Manage selected photo book state

2. **Update `usePhotoBook` hook**
   - Add photoBookId parameter to operations
   - Update queries to fetch photos for a specific book
   - Add methods for moving photos between books

## 7. Testing Strategy

### Unit Testing

1. **API Endpoints**

   - Test all new endpoints for photo book management
   - Test updated photo endpoints with photoBookId parameter
   - Test validation, error handling, and edge cases

2. **React Components**
   - Test PhotoBookItem component with mocked data
   - Test modal forms with validation scenarios
   - Test state management hooks

### Integration Testing

1. **End-to-End Flows**
   - Create/edit/delete photo book
   - Add/move photos between books
   - Reorder photo books in links list
   - Navigate between photo books in public profile

### User Acceptance Testing

1. **UI/UX Testing**
   - Verify consistent styling
   - Test mobile responsiveness
   - Test keyboard accessibility
   - Test internationalization if applicable

## 8. Implementation Phases

### Phase 1: Database and API Foundation

1. Update Prisma schema
2. Create migration script
3. Implement basic API endpoints for photo books
4. Update existing photo endpoints

### Phase 2: Core UI Components

1. Create Add Photo Book modal
2. Update PhotoBookItem component
3. Create PhotoBookList component
4. Update "Add Photo" button functionality

### Phase 3: Enhanced User Experience

1. Implement photo book navigation UI
2. Update drag and drop functionality
3. Implement photo moving between books
4. Update profile page rendering

### Phase 4: Testing and Refinement

1. Comprehensive testing
2. Performance optimization
3. UI polish and animations
4. Documentation updates

## 9. Potential Challenges and Solutions

### Data Migration

**Challenge**: Moving existing photos to the new photo book structure without data loss.

**Solution**:

- Create a default photo book for each user during migration
- Associate all existing photos with this default book
- Implement rollback strategy in case of migration failure

### Performance Concerns

**Challenge**: Managing potentially large collections of photos across multiple books.

**Solution**:

- Implement pagination for photo loading
- Add lazy loading for photos
- Consider optimizing queries for specific photo books

### User Experience

**Challenge**: Making navigation between multiple photo books intuitive.

**Solution**:

- Conduct usability testing with different navigation designs
- Implement clear visual indicators for current photo book
- Add tooltips and helpful messages for new functionality

## 10. Future Enhancements

1. **Photo Book Themes**

   - Allow different layout/style settings per photo book

2. **Smart Albums**

   - Automatic photo organization based on upload date or metadata

3. **Sharing Controls**

   - Per-album visibility settings

4. **Collaborative Albums**

   - Allow multiple users to contribute to a photo book

5. **Advanced Sorting**
   - Sort photos by date, name, or custom attributes
