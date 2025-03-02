# Rounded Corners Frame Template Implementation

## Core Components

- [x] Create RoundedCornersFrame Component

  - Create basic component structure
  - Implement SVG rendering for frame
  - Add props interface with all required parameters
  - Implement corner style rendering functions
  - Add support for individual corner radii

- [x] Implement Corner Style SVG Generators

  - Implement Notch corner style
  - Implement Scoop corner style
  - Implement Bevel corner style
  - Implement Diamond corner style
  - Implement Straight corner style
  - Implement Round corner style
  - Implement Squircle corner style
  - Implement Apple corner style

- [x] Create Frame Customization UI
  - Create corner style selector buttons
  - Implement "All Corners" toggle and slider
  - Add Border Radius slider
  - Create individual corner radius controls
  - Add CSS code preview box
  - Implement dimensions controls

## Integration

- [x] Update Frame Type Definitions

  - Add 'rounded-corners' to FrameTemplate type
  - Update FRAME_TEMPLATES array
  - Add preview rendering for rounded corners frame

- [x] Integrate with Avatar Components

  - Update renderFrame function in avatar.jsx
  - Add frame-specific styles for rounded corners
  - Update header-avatar.jsx with new frame type

- [x] Update Frame Customizer
  - Add state for new frame properties
  - Update props interface
  - Add conditional rendering for rounded corners customizer

## Database & API

- [x] Update User Schema

  - Add frameCornerStyle field
  - Add frameBorderRadius field
  - Add frameAllCorners field
  - Add individual corner radius fields

- [x] Update API Endpoints
  - Update user settings API
  - Add validation for new fields
  - Ensure backward compatibility

## Testing & Refinement

- [x] Test Corner Styles

  - Test all corner styles visually
  - Verify SVG rendering
  - Test with different radius values

- [x] Test UI Controls

  - Test corner style selection
  - Test "All Corners" toggle
  - Test radius sliders
  - Test dimensions controls

- [x] Test Integration
  - Test with existing avatar components
  - Test in profile view
  - Test in header
  - Test saving and loading preferences
