# Tinybird Web Analytics Implementation

This document outlines how Tinybird Web Analytics is implemented in Librelinks.

## Overview

Librelinks uses Tinybird's Web Analytics template to track user interactions with profiles and links. This provides valuable insights into how users interact with your content.

## Implementation Details

### 1. Global Analytics Script

The Tinybird analytics script is added globally in `pages/_app.js`:

```jsx
<Script
  defer
  src="https://unpkg.com/@tinybirdco/flock.js"
  data-host="https://api.us-east.tinybird.co"
  data-token={process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN}
  strategy="afterInteractive"
/>
```

This script automatically tracks:

- Page views
- Session information
- Device information (browser, OS, device type)
- Location information (country, region)
- Referrer information

### 2. Profile Page Analytics

For profile pages (`pages/[handle].jsx`), we include the Tinybird script again to ensure tracking works even in iframe contexts:

```jsx
{
  !query.isIframe ? (
    <Script
      defer
      src="https://unpkg.com/@tinybirdco/flock.js"
      data-host="https://api.us-east.tinybird.co"
      data-token={process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN}
    />
  ) : (
    ''
  );
}
```

### 3. Link Click Tracking

When users click on links, we track these events using Tinybird's custom event tracking:

```jsx
window.flock.push({
  event_name: 'click',
  data: {
    link_id: id,
    link_title: clickedLink.title,
    link_url: clickedLink.url,
    handle: `/${handle}`,
  },
});
```

## Using Tinybird's Pre-built Pipes

Tinybird's Web Analytics template comes with pre-built pipes that we use to fetch analytics data:

1. **Page Views**: Uses the `analytics_pages` pipe to get page views over time
2. **Device Analytics**: Uses the `top_devices` pipe to get device usage statistics
3. **Location Analytics**: Uses the `top_locations` pipe to get visitor locations
4. **Link Clicks**: Uses the `analytics_hits` pipe filtered by click events

### API Endpoints

We've created custom API endpoints that filter Tinybird data by user handle:

1. `/api/tinybird/pageviews`: Fetches page view data for a specific handle using the `analytics_pages` pipe
2. `/api/tinybird/devices`: Fetches device data for a specific handle using the `top_devices` pipe
3. `/api/tinybird/locations`: Fetches location data for a specific handle using the `top_locations` pipe
4. `/api/tinybird/links`: Fetches link click data for a specific handle using the `analytics_hits` pipe

### Filtering by User Handle

To show each user their own analytics, we filter the Tinybird data by path:

```javascript
// Example: Filtering page views by handle
const response = await axios.get(tinybirdUrl, {
  params: {
    token: process.env.ANALYTICS_TOKEN,
    path: `/${handle}`, // Filter by path which contains the handle
    time_range: timeRange,
  },
});
```

## Tinybird Dashboard

To view the overall analytics data:

1. Log in to your Tinybird account at [https://app.tinybird.co/](https://app.tinybird.co/)
2. Navigate to your Web Analytics project
3. View the pre-built dashboards for:
   - Page views
   - Visitors
   - Devices
   - Locations
   - Referrers

## Custom Queries

You can create custom queries in Tinybird to analyze specific aspects of your data. For example:

```sql
-- Top performing links
SELECT
  data.link_title as title,
  data.link_url as url,
  count() as clicks
FROM events
WHERE event_name = 'click'
GROUP BY title, url
ORDER BY clicks DESC
LIMIT 10
```

## Environment Variables

The Tinybird Web Analytics token is stored in the `.env` file:

```
NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN=your-token-here
```

## Troubleshooting

If analytics data is not showing up:

1. Check that the Tinybird script is loading correctly (check browser console)
2. Verify that your token is correct in the `.env` file
3. Make sure your Tinybird project is properly set up
4. Check for any errors in the browser console related to Tinybird or flock.js
5. Verify that the path filtering is working correctly in the API endpoints

### Missing Pipes

The application expects the following pipes to exist in your Tinybird account:

- `analytics_pages` - For tracking page views
- `top_devices` - For tracking device information
- `top_locations` - For tracking visitor locations
- `analytics_hits` - For tracking events (including link clicks)

If these pipes don't exist, the application will gracefully handle the 404 errors and return empty data with a warning message. To fix this issue:

1. Log into your Tinybird account
2. Create the missing pipes with the appropriate schema
3. Make sure your token has permission to access these pipes

Alternatively, you can customize the pipe names in the API endpoints to match your existing Tinybird setup:

- `/api/tinybird/pageviews.js`
- `/api/tinybird/devices.js`
- `/api/tinybird/locations.js`
- `/api/tinybird/links.js`

## Resources

- [Tinybird Web Analytics Documentation](https://www.tinybird.co/docs/guides/web-analytics.html)
- [Flock.js Documentation](https://www.tinybird.co/docs/guides/flock-js.html)
