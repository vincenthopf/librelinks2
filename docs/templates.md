# Templates Feature Documentation

## Overview

The templates feature allows users to apply pre-designed layouts and styles to their profiles. Admins can create and manage templates, while users can browse and apply them to their profiles.

## User Roles

### Admin

- Create, edit, and delete templates
- Save current profile as a template
- Manage template visibility (public/private)
- Access template usage analytics
- Access both Templates and Templates Admin sections

### Regular User

- Browse public templates
- Preview templates before applying
- Apply templates to their profile
- Rate templates
- Access only Templates section

## Components

### Save as Template

- Located in navigation bar (admin only)
- Captures complete profile state including:
  - All current links and their metadata
  - Theme and styling settings
  - Layout configuration
  - Frame settings and animations
  - All customization options

### Template Editor

- Located in: `components/core/templates/template-editor.jsx`
- Purpose: Create and edit templates
- Features:
  - Template name and description
  - Style configuration
  - Link management

### Template List

- Located in: `components/core/templates/template-list.jsx`
- Purpose: Display and manage templates
- Features:
  - Grid/list view of templates
  - Preview, edit, duplicate, delete actions
  - Usage statistics

### Template Browser

- Located in: `components/core/templates/template-browser.jsx`
- Purpose: Allow users to browse and apply templates
- Features:
  - Search and filter templates
  - Preview templates
  - Apply templates with confirmation
  - Rate templates

### Template Preview

- Located in: `components/core/templates/template-preview.jsx`
- Purpose: Show live preview of templates
- Features:
  - Live preview of template appearance
  - Mobile/desktop views

## API Endpoints

### GET /api/templates

- List all templates (admins) or public templates (users)
- Includes template details and usage statistics

### POST /api/templates

- Create new template (admin only)
- Requires template details and styling configuration

### POST /api/templates/save-current

- Save current profile as template (admin only)
- Captures all current profile settings and links
- Creates new template with complete configuration

### GET /api/templates/[id]

- Get specific template details
- Includes links and styling configuration

### PUT /api/templates/[id]

- Update existing template (admin only)
- Update template details, links, or styling

### DELETE /api/templates/[id]

- Delete template (admin only)
- Removes template and associated links

### POST /api/templates/apply

- Apply template to user's profile
- Preserves existing links while applying template styling

### POST /api/templates/rate

- Submit template rating
- Updates template's average rating and rating count

## Error Handling

- Error boundaries for component-level errors
- Loading states for async operations
- Input validation on all forms
- Proper error messages and notifications

## Analytics

- Template usage tracking
- Rating system (1-5 stars)
- Usage statistics display

## Best Practices

1. Always preview templates before applying
2. Use meaningful template names and descriptions
3. Test templates across different screen sizes
4. Consider accessibility when creating templates
5. Use error boundaries to prevent cascading failures

## Troubleshooting

1. Template not appearing in list

   - Check template visibility setting
   - Verify user permissions

2. Template application fails

   - Check network connectivity
   - Verify template exists
   - Check server logs for errors

3. Preview not loading
   - Clear browser cache
   - Check template data integrity
   - Verify all required fields are present
