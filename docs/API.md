# API Documentation

## Links API

### Update Link

`PATCH /api/links/:linkId`

Updates a link's title, URL, and archived status. When the URL is changed, it automatically fetches and updates rich media data from Iframely.

#### Request Parameters

- `linkId` (string, required) - The ID of the link to update

#### Request Body

```json
{
  "newTitle": "string",
  "newUrl": "string",
  "archived": "boolean"
}
```

#### Response

```json
{
  "id": "string",
  "title": "string",
  "url": "string",
  "archived": "boolean",
  "order": "number",
  "isSocial": "boolean",
  "type": "string",
  "providerName": "string",
  "embedHtml": "string",
  "thumbnails": "array",
  "authorName": "string",
  "authorUrl": "string",
  "iframelyMeta": "object"
}
```

#### Error Responses

- `400 Bad Request` - Invalid linkId or request body
- `404 Not Found` - Link not found
- `500 Internal Server Error` - Server error

#### Notes

- The URL is automatically prefixed with `https://` if no protocol is specified
- Iframely data is only fetched when the URL is changed
- Old Iframely data is preserved if the new URL fetch fails
- All fields are optional in the request body

### Example Usage

```javascript
// Update link title and URL
const response = await axios.patch('/api/links/123', {
  newTitle: 'Updated Title',
  newUrl: 'example.com', // https:// will be added automatically
});

// Update only title
const response = await axios.patch('/api/links/123', {
  newTitle: 'Updated Title',
});

// Archive link
const response = await axios.patch('/api/links/123', {
  archived: true,
});
```
