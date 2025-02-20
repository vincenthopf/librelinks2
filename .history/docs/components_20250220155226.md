# Component Documentation

## LinkCard Component

The LinkCard component displays a link with an optional rich media preview that can be toggled.

### Props

```typescript
interface LinkCardProps {
  url: string;
  title: string;
  buttonStyle: string;
  theme: {
    primary: string;
    secondary: string;
    neutral: string;
  };
  archived?: boolean;
  registerClicks?: () => void;
  // Iframely data
  embedHtml?: string;
  thumbnails?: Array<{ href: string }>;
  type?: string;
  providerName?: string;
  iframelyMeta?: {
    description?: string;
  };
}
```

### Features

- Displays link with favicon and title
- Toggle button for rich media preview
- Smooth transitions for preview show/hide
- Maintains consistent width
- Handles various content types

### Usage

```jsx
<LinkCard
  url="https://example.com"
  title="Example Link"
  buttonStyle="rounded-lg"
  theme={{
    primary: '#ffffff',
    secondary: '#f3f4f6',
    neutral: '#9ca3af',
  }}
  embedHtml="<iframe src='...'></iframe>"
/>
```

## RichMediaPreview Component

The RichMediaPreview component handles the display of rich media content from various providers.

### Props

```typescript
interface RichMediaPreviewProps {
  link: {
    embedHtml?: string;
    thumbnails?: Array<{ href: string }>;
    title?: string;
    type?: string;
    providerName?: string;
    iframelyMeta?: {
      description?: string;
    };
  };
}
```

### Features

- Handles multiple content types (video, playlist, link)
- Provider-specific sizing
- Fallback to thumbnails
- Loading states
- Error handling with descriptive messages
- Optional description display

### Usage

```jsx
<RichMediaPreview
  link={{
    embedHtml: "<iframe src='...'></iframe>",
    type: 'video',
    providerName: 'YouTube',
    thumbnails: [{ href: 'thumbnail.jpg' }],
    iframelyMeta: {
      description: 'Video description',
    },
  }}
/>
```

## Error Handling

Both components implement comprehensive error handling:

1. **Network Errors**

   - Failed API requests
   - Invalid URLs
   - Timeout issues

2. **Content Errors**

   - Invalid embed HTML
   - Missing thumbnails
   - Corrupted metadata

3. **Display Errors**
   - Loading failures
   - Render issues
   - Invalid content types

## Best Practices

1. **Performance**

   - Use lazy loading for images and iframes
   - Implement proper cleanup in useEffect
   - Cache API responses

2. **Accessibility**

   - Provide alt text for images
   - Use ARIA labels for buttons
   - Ensure keyboard navigation

3. **Responsive Design**
   - Maintain aspect ratios
   - Scale content appropriately
   - Handle different screen sizes
