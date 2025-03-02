# Photo Book Features

## Reorderable Photo Book Feature

### Overview

The reorderable Photo Book feature allows users to drag and reposition their Photo Book section relative to their links on their profile page. This enhancement provides greater flexibility in content organization, allowing the Photo Book to appear before, between, or after link cards.

### Implementation Details

#### Database Schema

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

#### Components

##### PhotoBookItem

- Created a new draggable component that represents the Photo Book in the admin UI.
- Visually resembles the Link component for a consistent user experience.
- Uses `@dnd-kit/sortable` for drag-and-drop functionality.

##### LinksEditor

- Updated to include the Photo Book as a draggable item alongside links.
- Maintains a combined array of both link items and the Photo Book item.
- Handles repositioning of the Photo Book with respect to links.
- Updates both link order and Photo Book order when items are repositioned.

#### Profile Page Rendering

- Modified the profile page component to render the Photo Book in the correct position based on `photoBookOrder`.
- Splits regular links into two groups: before and after the Photo Book.
- Renders content in the correct order: links before Photo Book, Photo Book, links after Photo Book.
- Gracefully handles edge cases when there are no links or no photos.

#### API Endpoints

- Uses the existing `users/update` endpoint to update the `photoBookOrder` value.
- The links API endpoint continues to handle link order updates.

### Technical Considerations

1. **Special ID handling**: The Photo Book uses a special ID (`photo-book-item`) to distinguish it from regular links.
2. **Order calculation**: When a drag operation ends, the system recalculates the appropriate orders for both links and the Photo Book.
3. **Error handling**: If any API operations fail, the UI reverts to its previous state to maintain consistency.
4. **Preview updates**: Changes are immediately reflected in the preview using the iframe signal mechanism.

## Collapsible Photo Book Implementation

### Overview

The Photo Book section in the admin panel has been enhanced with a collapsible interface that allows users to manage their photos without navigating to a separate page. This implementation provides a more seamless user experience by keeping all content management within a single interface.

### Implementation Details

#### Component Structure

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

#### Animation

- Used Framer Motion's `AnimatePresence` for smooth enter/exit animations
- Implemented height and opacity transitions
- Added border separation between header and content
- Ensured smooth performance even with many photos

#### User Experience Improvements

- Users can now manage photos without leaving the main admin interface
- Consistent drag-and-drop behavior between links and the photo book
- Clear visual indication of expandable content
- Seamless transitions between collapsed and expanded states

### Code Implementation

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

### Lessons Learned

1. **Component Adaptability**: Components should be designed to work in multiple contexts
2. **Progressive Enhancement**: Adding collapsible functionality improves UX without disrupting existing workflows
3. **Animation Performance**: Using proper animation techniques ensures smooth transitions even with complex content
4. **Consistent Experience**: Maintaining visual consistency between different interfaces improves usability
