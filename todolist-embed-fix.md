# Embedded Links Refetching Fix Todolist

- [x] Create the todolist.md file with all tasks needed to solve the issue

## Modify `signalIframe()` Function

- [x] Update `signalIframe()` in utils/helpers.js to accept a type parameter
  - Change function signature to include type parameter with default value
  - Modify the function to pass the type to postMessage instead of always 'refresh'
  - Add JSDoc documentation explaining the new parameter

## Update Message Event Listener in `[handle].jsx`

- [x] Modify the message event listener to handle specific message types
  - Update to check event.data and respond appropriately to different message types
  - Implement specific handling for 'update_links', 'update_user', and 'refresh'
  - Ensure proper cleanup in the useEffect return function

## Update signalIframe() Calls

- [x] Update all calls to signalIframe() in edit-link.jsx to use 'update_links' type
- [x] Update all calls to signalIframe() in add-new-link.jsx to use 'update_links' type
- [x] Update all calls to signalIframe() in popover-desktop.jsx to use 'update_links' type (for link operations)
- [x] Update all calls to signalIframe() in links-editor.jsx to use 'update_links' type
- [ ] Update all calls to signalIframe() in user settings related components to use 'update_user' type

## Optimize RichMediaPreview Component

- [x] Reduce or remove console.log statements in rich-media-preview.tsx
- [x] Add memoization for expensive rendering operations
- [x] Optimize initialization logic to prevent redundant processing

## Enhance React Query Caching

- [x] Update the React Query configuration in useLinks.js
  - Add cacheTime property
  - Set refetchOnWindowFocus to false
  - Set refetchOnReconnect to false
  - Add additional optimizations if needed

## Testing and Verification

- [ ] Verify embedded links load properly on initial page load
- [ ] Verify links update properly when a new link is added
- [ ] Verify links update properly when a link is edited
- [ ] Verify no unnecessary refreshes occur when interacting with other components

## Documentation

- [ ] Update CURSOR_MEMORY.md with learnings from this implementation
- [ ] Document the changes in the codebase for future reference
