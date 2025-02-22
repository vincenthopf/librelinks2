# Cursor Memory - Project Insights

## Theme System Implementation

### Color Synchronization (Link Cards)

- The theme system uses a palette with four key colors:

  - `theme.primary` - Background color
  - `theme.secondary` - Secondary background color
  - `theme.accent` - Text color (used for profile name and interactive elements)
  - `theme.neutral` - Border/neutral color

- When implementing theme-based styling:
  - Use `theme.accent` for text and interactive elements that should match the profile name
  - Maintain consistency across components by referencing the same theme properties
  - Consider accessibility when choosing theme colors

### Lessons Learned

1. Theme Consistency: When adding new UI elements, always check if they should follow the theme's color scheme
2. Style Inheritance: When modifying styles, preserve existing style properties by using object spread or combining them in the style object
3. Component Cohesion: Related elements (like title and chevron) should use the same theme colors for visual consistency

### Future Considerations

- When adding new interactive elements, consider if they should follow the theme's accent color
- Test new theme-related changes across all available themes to ensure consistency
- Consider adding theme color validation to ensure sufficient contrast for accessibility
