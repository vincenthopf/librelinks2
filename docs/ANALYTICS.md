# Librelinks Analytics Implementation

This document outlines the analytics implementation for Librelinks using Tinybird.

## Overview

Librelinks uses Tinybird for analytics tracking. The implementation includes:

1. **Page Views**: Tracking user visits to profile pages
2. **Device Analytics**: Tracking what devices users are using to visit profiles
3. **Location Analytics**: Tracking geographical locations of visitors
4. **Link Clicks**: Tracking which links are being clicked

## Tinybird Configuration

### Required Pipes

The following Tinybird pipes need to be configured:

1. `Page_View_pipe_7265.json` - For tracking page views
2. `Device_Tracking_pipe_1352.json` - For tracking device information
3. `Location_Tracking_pipe_3375.json` - For tracking location information

### Events

The following events are tracked:

1. Default page view events (automatically tracked by flock.js)
2. `device_view` - Custom event for device tracking
3. `location_view` - Custom event for location tracking
4. `link_click` - Custom event for link click tracking

### Tinybird Data Sources

You need to create the following data sources in Tinybird:

1. **Page Views**:

   ```sql
   CREATE TABLE page_views (
     timestamp DateTime,
     handle String,
     event_name String,
     session_id String
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, handle)
   ```

2. **Device Views**:

   ```sql
   CREATE TABLE device_views (
     timestamp DateTime,
     handle String,
     device String,
     event_name String,
     session_id String
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, handle)
   ```

3. **Location Views**:

   ```sql
   CREATE TABLE location_views (
     timestamp DateTime,
     handle String,
     country String,
     event_name String,
     session_id String
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, handle)
   ```

4. **Link Clicks**:
   ```sql
   CREATE TABLE link_clicks (
     timestamp DateTime,
     handle String,
     link_id String,
     link_title String,
     link_url String,
     event_name String,
     session_id String
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, handle)
   ```

### Pipes Configuration

1. **Page View Pipe** (`Page_View_pipe_7265`):

   ```sql
   SELECT
     toDate(timestamp) as t,
     count() as visits
   FROM page_views
   WHERE handle = {{String(handle, '/')}}
   AND timestamp >= now() - interval {{String(filter, 'last_hour')}}
   GROUP BY t
   ORDER BY t
   ```

2. **Device Tracking Pipe** (`Device_Tracking_pipe_1352`):

   ```sql
   SELECT
     device,
     count() as visits
   FROM device_views
   WHERE handle = {{String(handle, '/')}}
   AND timestamp >= now() - interval 30 day
   GROUP BY device
   ORDER BY visits DESC
   ```

3. **Location Tracking Pipe** (`Location_Tracking_pipe_3375`):
   ```sql
   SELECT
     country as location,
     count() as visits
   FROM location_views
   WHERE handle = {{String(handle, '/')}}
   AND timestamp >= now() - interval 30 day
   GROUP BY location
   ORDER BY visits DESC
   ```

## Implementation Details

### Client-Side Tracking

The tracking is implemented using Tinybird's flock.js library. The script is loaded on the profile page and tracks:

1. Page views (automatic)
2. Device information (custom event)
3. Location information (IP-based, handled by Tinybird)
4. Link clicks (custom event)

### Server-Side API

The following API endpoints are used to retrieve analytics data:

1. `/api/analytics/views` - For page views
2. `/api/analytics/views/device` - For device analytics
3. `/api/analytics/views/location` - For location analytics

## Troubleshooting

If analytics data is not showing up:

1. Check that the Tinybird API tokens are correctly set in the `.env` file
2. Verify that the Tinybird pipes are correctly configured
3. Check the browser console for any errors related to flock.js
4. Ensure that the events are being properly tracked by checking the Tinybird dashboard

## Future Improvements

1. Add more detailed device information (browser, OS)
2. Track time spent on page
3. Track scroll depth
4. Add heatmap tracking for link clicks
5. Implement A/B testing for link placement and styling
