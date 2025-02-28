import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import BackgroundImageSelector from '@/components/core/background-images/background-image-selector';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('@/hooks/useCurrentUser');
jest.mock('@/utils/helpers', () => ({
  signalIframe: jest.fn(),
}));

const mockBackgroundImages = [
  {
    id: '1',
    name: 'Background 1',
    imageUrl: 'https://example.com/bg1.jpg',
    isPublic: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Background 2',
    imageUrl: 'https://example.com/bg2.jpg',
    isPublic: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    userId: 'user1',
  },
];

const mockUser = {
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  handle: 'testuser',
  image: null,
  backgroundImage: 'https://example.com/bg1.jpg',
};

describe('BackgroundImageSelector', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Mock useCurrentUser hook
    (useCurrentUser as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    // Mock axios get request for background images
    (axios.get as jest.Mock).mockResolvedValue({ data: mockBackgroundImages });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BackgroundImageSelector />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    (useCurrentUser as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderComponent();
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  it('renders error state when user data fails to load', () => {
    (useCurrentUser as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load user'),
    });

    renderComponent();
    expect(
      screen.getByText(
        'Failed to load user data. Please try refreshing the page.'
      )
    ).toBeInTheDocument();
  });

  it('renders background images and selects current user background', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Background 1')).toBeInTheDocument();
      expect(screen.getByText('Background 2')).toBeInTheDocument();
    });

    // Check that the current user's background is selected
    const selectedImage = screen.getByAltText('Background 1');
    expect(selectedImage.closest('div')).toHaveClass('border-blue-500');
  });

  it('handles background image selection', async () => {
    (axios.patch as jest.Mock).mockResolvedValueOnce({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Background 2')).toBeInTheDocument();
    });

    // Click on the second background image
    fireEvent.click(screen.getByText('Background 2'));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/customize', {
        backgroundImage: 'https://example.com/bg2.jpg',
      });
      expect(toast.promise).toHaveBeenCalled();
    });
  });

  it('handles background image removal', async () => {
    (axios.patch as jest.Mock).mockResolvedValueOnce({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    // Click on the "None" option
    fireEvent.click(screen.getByText('None'));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/customize', {
        backgroundImage: 'none',
      });
      expect(toast.promise).toHaveBeenCalled();
    });
  });

  it('handles failed background image update', async () => {
    const error = new Error('Update failed');
    (axios.patch as jest.Mock).mockRejectedValueOnce(error);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Background 2')).toBeInTheDocument();
    });

    // Click on the second background image
    fireEvent.click(screen.getByText('Background 2'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update background image. Please try again.'
      );
    });
  });

  it('prevents multiple simultaneous updates', async () => {
    // Mock a slow update
    (axios.patch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Background 2')).toBeInTheDocument();
    });

    // Click on the second background image
    fireEvent.click(screen.getByText('Background 2'));
    fireEvent.click(screen.getByText('Background 1'));

    // Should only call patch once
    expect(axios.patch).toHaveBeenCalledTimes(1);
  });

  it('handles image loading errors gracefully', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByAltText('Background 1')).toBeInTheDocument();
    });

    // Simulate image load error
    const image = screen.getByAltText('Background 1');
    fireEvent.error(image);

    // Check if the image source is set to placeholder
    expect(image).toHaveAttribute('src', '/placeholder-image.png');
  });
});

// Test URL validation function
describe('URL Validation', () => {
  it('validates image URLs correctly', () => {
    const validUrls = [
      'https://example.com/image.jpg',
      'http://example.com/image.png',
      'https://subdomain.example.com/path/to/image.webp',
    ];

    const invalidUrls = [
      'not-a-url',
      'ftp://example.com/image.jpg',
      'file:///local/image.png',
      '',
      'http://',
    ];

    validUrls.forEach((url) => {
      expect(isValidImageUrl(url)).toBe(true);
    });

    invalidUrls.forEach((url) => {
      expect(isValidImageUrl(url)).toBe(false);
    });
  });
});
