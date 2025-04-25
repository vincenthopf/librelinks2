# Super Analytics 2.0 - Plausible v2 API Migration Todolist

## Setup and Utilities

- [x] Create Plausible v2 API utility functions

  - Create `lib/plausibleV2Api.js` with core API functions
  - Implement `queryPlausibleV2` function for making API requests
  - Implement `formatTimeRangeV2` function for date range formatting

- [x] Update test script to use v2 API
  - Modify `test-plausible.js` to test v2 API endpoints
  - Add tests for basic metrics query
  - Add tests for dimensions query

## API Endpoint Updates

- [x] Update Dashboard API endpoint

  - Update `/api/super-analytics/dashboard.js` to use v2 API
  - Implement metrics query
  - Implement timeseries query
  - Maintain fallback logic for no data scenarios

- [x] Update Sources API endpoint

  - Update `/api/super-analytics/sources.js` to use v2 API
  - Implement source dimensions query
  - Update response formatting for frontend compatibility

- [x] Update Pages API endpoint

  - Update `/api/super-analytics/pages.js` to use v2 API
  - Implement page dimensions query
  - Update response formatting for frontend compatibility

- [x] Update Locations API endpoint

  - Update `/api/super-analytics/locations.js` to use v2 API
  - Implement location dimensions query
  - Update response formatting for frontend compatibility

- [x] Update Devices API endpoint

  - Update `/api/super-analytics/devices.js` to use v2 API
  - Implement device dimensions query
  - Update response formatting for frontend compatibility

- [x] Update Outbound Links API endpoint

  - Update `/api/super-analytics/outbound-links.js` to use v2 API
  - Implement outbound links query
  - Update response formatting for frontend compatibility

- [x] Update all API endpoints to filter by URL path instead of userID
  - Change from filtering by `event:props:userId` to `event:page`
  - Look up user's username from database to construct path filter
  - Update fallback data to use actual user's URL path
  - Improve visitor count estimates from click data

## Bug Fixes and Improvements

- [x] Fix dashboard metrics display issue (zero values showing)

  - Updated dashboard.js to handle API limitation with views_per_visit metric
  - Calculate views_per_visit manually from pageviews and visits
  - Improved error handling for 400 status responses
  - Ensure fallback data is provided when API constraints are encountered

- [x] Fix Plausible v2 API filter syntax

  - Updated all API endpoints to use the correct filter syntax: ["contains", "event:page", [pathToFilter]]
  - Fixed site_id parameter to ensure it's properly set in all API requests
  - Ensured consistent filter syntax across all endpoints (dashboard, sources, pages, locations, devices, outbound-links)
  - Improved error handling and logging for API responses

- [x] Fix TopStats component to properly display metrics

  - Updated the component to expect flat metrics structure instead of nested objects
  - Fixed the way metrics are accessed in the component (removing .value properties)
  - Ensured views_per_visit is properly displayed from the API response
  - Aligned frontend expectations with the actual API response format

- [x] Update dashboard chart to display total visits and remove "Pages per visit" metric

  - Changed VisitorsGraph to display total visits instead of unique visitors
  - Removed "Pages per visit" metric from TopStats component
  - Updated grid layout to show 3 metrics instead of 4
  - Modified dashboard.js API endpoint to include visits in timeseries data
  - Updated header from "Visitors Over Time" to "Visits Over Time"

- [x] Fix chart rendering issues with timeseries data

  - Added fallback data generation when no timeseries data is available
  - Improved visibility of data points by setting non-zero pointRadius
  - Added y-axis scale suggestions to make small values visible
  - Implemented comprehensive logging for debugging chart data
  - Added mock data generation when real data is unavailable

- [x] Fix line chart visualization issues
  - Increased line borderWidth to 3px to ensure lines are clearly visible
  - Improved handling of single data point scenarios by expanding to multiple points
  - Updated chart.js configuration to be compatible with Chart.js v3 (using tension property correctly)
  - Added helper functions for better testing and visualization (expandSingleDataPoint, generateMockData)
  - Optimized line rendering by adjusting tension based on data point density
  - Improved point styling with white backgrounds and colored borders for better visibility

## Testing and Validation

- [ ] Test each API endpoint individually

  - Verify dashboard endpoint
  - Verify sources endpoint
  - Verify pages endpoint
  - Verify locations endpoint
  - Verify devices endpoint
  - Verify outbound links endpoint

- [ ] Test full dashboard integration
  - Verify all components display data correctly
  - Test different time ranges
  - Test with different user IDs

## Documentation

- [ ] Update code comments

  - Add explanations for v2 API structure
  - Document response format changes
  - Document API limitations and workarounds

- [ ] Create migration notes
  - Document key differences between v1 and v2 APIs
  - Note any breaking changes or limitations
  - Include information about API constraints like views_per_visit

# Bento View Feature Implementation Todolist

## Database and Schema Changes

- [x] Update user schema in Prisma to change `stackView` from boolean to string enum with values 'normal', 'stacked', and 'bento'
- [x] Create migration script for existing data to convert boolean `stackView` to string `viewMode`

## Component Development

- [x] Create Core Bento View Components
  - [x] Create `components/core/bento-view/media-item.jsx` for individual grid items
  - [x] Create `components/core/bento-view/gallery-modal.jsx` for expanded view
  - [x] Create `components/core/bento-view/bento-cards-view.jsx` as main component
- [x] Create Three-Way Toggle Component
  - [x] Develop `view-mode-toggle.jsx` for switching between Normal, Stacked, and Bento views
  - [x] Add appropriate styling and animations

## Integration

- [x] Update Preview Components
  - [x] Modify `components/shared/profile-preview/preview.jsx` to conditionally render based on viewMode
  - [x] Modify `components/shared/profile-preview/preview-mobile.jsx` for consistent rendering
- [x] Update Public Profile Page
  - [x] Update `pages/[handle].jsx` to render Bento View based on user preferences
- [x] Create Content Mapping Utilities
  - [x] Develop utility functions to transform existing content into Bento grid items
  - [x] Handle different content types (links, texts, images) appropriately

## API Implementation

- [x] Create/Update API Endpoints
  - [x] Update `/api/users` endpoints to handle viewMode property
  - [x] Create endpoints for saving Bento grid customizations
  - [x] Update relevant queries and hooks

## Animation and Interaction

- [x] Install and Configure framer-motion
- [x] Implement Drag Functionality
  - [x] Create drag constraints based on grid layout
  - [x] Implement item reordering through drag
  - [x] Add visual feedback during drag operations
- [x] Implement Modal Interactions
  - [x] Create open/close animations for item details
  - [x] Handle media navigation within modals
  - [x] Add zoom functionality for images

## Testing and Refinement

- [ ] Cross-Device Testing
  - [ ] Verify responsive behavior on mobile, tablet, and desktop
  - [ ] Test touch interactions on mobile devices
- [ ] Content Type Testing
  - [ ] Test with various link types, images, and text content
  - [ ] Verify embedding functionality works in Bento View
- [ ] Performance Optimization
  - [ ] Optimize animations for performance
  - [ ] Implement lazy loading for media content
  - [ ] Monitor and reduce unnecessary re-renders

## Documentation

- [ ] Update User Documentation
  - [ ] Create help articles explaining Bento View
  - [ ] Add usage examples and best practices
- [x] Update Developer Documentation
  - [x] Document component structure and APIs
  - [x] Include customization options and extensibility notes
