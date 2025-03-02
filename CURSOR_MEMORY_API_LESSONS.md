# API and Database Lessons

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

## Iframe Preview Refresh System

### Overview

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
