import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditLinkModal from '../edit-link';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('@/utils/helpers', () => ({
  isValidUrl: jest.fn((url) => url.includes('.')),
  ensureHttps: jest.fn((url) => url.startsWith('http') ? url : `https://${url}`),
  signalIframe: jest.fn(),
}));

const mockClose = jest.fn();

describe('EditLinkModal', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const defaultProps = {
    id: '123',
    title: 'Test Link',
    url: 'https://example.com',
    close: mockClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditLinkModal {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it('should render with initial values', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('Title')).toHaveValue('Test Link');
    expect(screen.getByPlaceholderText('URL')).toHaveValue('https://example.com');
  });

  it('should handle URL validation', async () => {
    renderComponent();
    
    const urlInput = screen.getByPlaceholderText('URL');
    
    // Invalid URL
    fireEvent.change(urlInput, { target: { value: 'invalid url' } });
    expect(screen.getByText('Enter a valid URL (ex: hello.com)')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Valid URL
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    expect(screen.queryByText('Enter a valid URL (ex: hello.com)')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should auto-add https:// to URLs', () => {
    renderComponent();
    
    const urlInput = screen.getByPlaceholderText('URL');
    
    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    expect(urlInput).toHaveValue('https://example.com');
  });

  it('should preserve existing protocols', () => {
    renderComponent();
    
    const urlInput = screen.getByPlaceholderText('URL');
    
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });
    expect(urlInput).toHaveValue('http://example.com');
  });

  it('should handle successful link update', async () => {
    axios.patch.mockResolvedValueOnce({ data: { id: '123', title: 'Updated Link', url: 'https://example.com' } });
    
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Link' } });
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/links/123', {
        newTitle: 'Updated Link',
        newUrl: 'https://example.com',
      });
      expect(mockClose).toHaveBeenCalled();
      expect(toast.promise).toHaveBeenCalled();
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    axios.patch.mockRejectedValueOnce(error);
    
    renderComponent();
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
    });
  });

  it('should show loading state during update', async () => {
    axios.patch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));
    
    renderComponent();
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Updating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalled();
    });
  });

  it('should validate required fields', () => {
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Title');
    const urlInput = screen.getByPlaceholderText('URL');
    
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(urlInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Please fill the form');
    expect(mockClose).toHaveBeenCalled();
  });
}); 