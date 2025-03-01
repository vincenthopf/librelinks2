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

## Link Management Components

### EditLinkModal

A modal component for editing existing links. Handles URL validation, automatic HTTPS prefixing, and rich media data updates through Iframely.

#### Props

```typescript
{
  id: string;       // Link ID
  title: string;    // Current link title
  url: string;      // Current link URL
  close: () => void; // Function to close the modal
}
```

#### Features

- Validates URLs and automatically adds https:// if missing
- Shows loading state during updates
- Displays error messages for invalid URLs
- Preserves existing URL protocols
- Fetches and updates rich media data when URL changes
- Maintains consistent UX with AddLinkModal

#### Example Usage

```jsx
<EditLinkModal
  id="123"
  title="My Link"
  url="https://example.com"
  close={() => setIsOpen(false)}
/>
```

### AddLinkModal

A modal component for adding new links. Shares common functionality with EditLinkModal.

#### Props

None - Uses internal state management

#### Features

- Validates URLs and automatically adds https:// if missing
- Shows loading state during creation
- Displays error messages for invalid URLs
- Supports social media icon toggle
- Fetches rich media data for preview
- Maintains consistent UX with EditLinkModal

#### Example Usage

```jsx
<AddLinkModal />
```

## URL Processing Utilities

### ensureHttps

A utility function that ensures URLs have the HTTPS protocol.

```typescript
function ensureHttps(url: string): string;
```

#### Features

- Adds https:// prefix if no protocol is present
- Preserves existing protocols (http://, ftp://, etc.)
- Handles null/undefined inputs safely

#### Example Usage

```javascript
ensureHttps('example.com'); // returns 'https://example.com'
ensureHttps('http://example.com'); // returns 'http://example.com'
ensureHttps('https://example.com'); // returns 'https://example.com'
```

### isValidUrl

A utility function that validates URLs, working in conjunction with ensureHttps.

```typescript
function isValidUrl(url: string): boolean;
```

#### Features

- Validates URLs with or without protocols
- Automatically adds https:// during validation
- Supports URLs with paths, query parameters, and fragments

#### Example Usage

```javascript
isValidUrl('example.com'); // returns true
isValidUrl('not a url'); // returns false
isValidUrl('http://example.com'); // returns true
```

## TextCard Component

The TextCard component displays text content with an expandable/collapsible view.

### Props

```typescript
interface TextCardProps {
  title: string;
  content: string;
  buttonStyle: string;
  theme: {
    primary: string;
    secondary: string;
    neutral: string;
    accent: string;
  };
  fontSize: number;
  fontFamily: string;
  cardHeight: number;
  archived?: boolean;
}
```

### Features

- Displays text title and content
- Expandable/collapsible content view
- "Read more"/"Show less" toggle for long content
- Consistent styling with LinkCard component
- Customizable font sizes and families
- Theme-aware styling

### Usage

```jsx
<TextCard
  title="About Me"
  content="This is my bio information that can be expanded to show more text..."
  buttonStyle="rounded-lg"
  theme={{
    primary: '#ffffff',
    secondary: '#f3f4f6',
    neutral: '#9ca3af',
    accent: '#1f2937',
  }}
  fontSize={14}
  fontFamily="Inter"
  cardHeight={16}
/>
```
