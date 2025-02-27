import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemesPicker from '@/components/core/custom-page-themes/themes-picker';
import { themes } from '@/utils/themes';
import '@testing-library/jest-dom';

// Mock the axios module
jest.mock('axios');
const axios = require('axios');

// Mock the useCurrentUser hook
jest.mock('@/hooks/useCurrentUser', () => ({
  __esModule: true,
  default: () => ({
    data: {
      themePalette: { name: 'Light', palette: themes[0].palette },
      backgroundImage: null,
    },
  }),
}));

describe('ThemesPicker', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderThemesPicker = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemesPicker />
      </QueryClientProvider>
    );
  };

  it('renders theme options', () => {
    renderThemesPicker();

    // Check if initial themes are displayed
    themes.slice(0, 9).forEach((theme) => {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
    });
  });

  it('shows more themes when "Show More" is clicked', () => {
    renderThemesPicker();

    // Click "Show More" button
    fireEvent.click(screen.getByText('Show More'));

    // Check if all themes are displayed
    themes.forEach((theme) => {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
    });
  });

  it('shows color customization panel when theme is selected', async () => {
    renderThemesPicker();

    // Select a theme
    fireEvent.click(screen.getByText(themes[0].name));

    // Check if customization panel appears
    await waitFor(() => {
      expect(screen.getByText('Customize Colors')).toBeInTheDocument();
    });

    // Check if all color pickers are present
    expect(screen.getByText('Background Color')).toBeInTheDocument();
    expect(screen.getByText('Secondary Color')).toBeInTheDocument();
    expect(screen.getByText('Text Color')).toBeInTheDocument();
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
  });

  it('updates theme colors when customized', async () => {
    // Mock the API call
    axios.patch.mockResolvedValue({ data: {} });

    renderThemesPicker();

    // Select a theme
    fireEvent.click(screen.getByText(themes[0].name));

    // Wait for customization panel
    await waitFor(() => {
      expect(screen.getByText('Customize Colors')).toBeInTheDocument();
    });

    // Find color inputs
    const colorInputs = screen.getAllByTitle('Color hex value');

    // Change background color
    fireEvent.change(colorInputs[0], { target: { value: '#123456' } });

    // Verify API was called with updated colors
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        '/api/customize',
        expect.objectContaining({
          themePalette: expect.objectContaining({
            palette: expect.arrayContaining(['#123456']),
          }),
        })
      );
    });
  });

  it('resets colors when Reset button is clicked', async () => {
    // Mock the API call
    axios.patch.mockResolvedValue({ data: {} });

    renderThemesPicker();

    // Select a theme
    fireEvent.click(screen.getByText(themes[0].name));

    // Wait for customization panel
    await waitFor(() => {
      expect(screen.getByText('Customize Colors')).toBeInTheDocument();
    });

    // Click reset button
    fireEvent.click(screen.getByText('Reset to Original'));

    // Verify API was called with original colors
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        '/api/customize',
        expect.objectContaining({
          themePalette: expect.objectContaining({
            palette: themes[0].palette,
          }),
        })
      );
    });
  });
});
