/**
 * Super Analytics 2.0 Dashboard tests
 *
 * These tests verify that the Super Analytics 2.0 dashboard components
 * load correctly and display the expected data.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import SuperAnalyticsPage from '@/pages/admin/super-analytics/index';
import { SessionProvider } from 'next-auth/react';

// Mock the session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { id: 'test-user-id', name: 'Test User' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  SessionProvider: ({ children }) => children,
}));

// Mock the custom hooks
jest.mock('@/hooks/useCurrentUser', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: { id: 'test-user-id', name: 'Test User' },
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/hooks/usePlausibleUserAnalytics', () => ({
  __esModule: true,
  default: jest.fn((type, timeRange) => {
    // Return different mock data based on the type
    switch (type) {
      case 'dashboard':
        return {
          data: {
            metrics: {
              visitors: 937,
              previous_visitors: 1000,
              visits: 1100,
              previous_visits: 1200,
              pageviews: 3100,
              previous_pageviews: 3200,
              bounce_rate: { value: 46 },
              previous_bounce_rate: { value: 45 },
              visit_duration: 1153,
              previous_visit_duration: 900,
            },
            timeseries: [
              { date: '2023-01-01', visitors: 120, pageviews: 350 },
              { date: '2023-01-02', visitors: 150, pageviews: 400 },
              { date: '2023-01-03', visitors: 180, pageviews: 450 },
            ],
          },
          isLoading: false,
          error: null,
        };
      case 'sources':
        return {
          data: {
            sources: [
              { name: 'Direct / None', visitors: 851 },
              { name: 'Google', visitors: 50 },
              { name: 'chatgpt.com', visitors: 5 },
            ],
            utm_medium: [
              { name: 'referral', visitors: 55 },
              { name: 'organic', visitors: 35 },
            ],
            utm_source: [
              { name: 'google', visitors: 50 },
              { name: 'chatgpt', visitors: 5 },
            ],
            utm_campaign: [
              { name: 'winter_promo', visitors: 12 },
              { name: 'homepage', visitors: 8 },
            ],
          },
          isLoading: false,
          error: null,
        };
      case 'pages':
        return {
          data: {
            top_pages: [
              { page: '/dashboard', visitors: 652 },
              { page: '/sites', visitors: 102 },
              { page: '/', visitors: 89 },
            ],
            entry_pages: [
              { page: '/dashboard', entries: 620 },
              { page: '/sites', entries: 75 },
              { page: '/', entries: 150 },
            ],
            exit_pages: [
              { page: '/dashboard', exits: 652 },
              { page: '/sites', exits: 102 },
              { page: '/', exits: 89 },
            ],
          },
          isLoading: false,
          error: null,
        };
      case 'locations':
        return {
          data: {
            countries: [
              { name: 'United States', country_code: 'US', visitors: 520 },
              { name: 'United Kingdom', country_code: 'GB', visitors: 124 },
              { name: 'Canada', country_code: 'CA', visitors: 89 },
            ],
            regions: [
              { name: 'California', visitors: 210 },
              { name: 'New York', visitors: 120 },
              { name: 'Texas', visitors: 95 },
            ],
            cities: [
              { name: 'San Francisco', visitors: 105 },
              { name: 'New York', visitors: 95 },
              { name: 'London', visitors: 80 },
            ],
          },
          isLoading: false,
          error: null,
        };
      case 'devices':
        return {
          data: {
            browsers: [
              { name: 'Chrome', visitors: 585 },
              { name: 'Safari', visitors: 245 },
              { name: 'Firefox', visitors: 47 },
            ],
            operating_systems: [
              { name: 'Windows', visitors: 425 },
              { name: 'macOS', visitors: 315 },
              { name: 'iOS', visitors: 125 },
            ],
            screen_sizes: [
              { name: 'Desktop', visitors: 625 },
              { name: 'Mobile', visitors: 235 },
              { name: 'Tablet', visitors: 77 },
            ],
          },
          isLoading: false,
          error: null,
        };
      default:
        return { data: null, isLoading: false, error: null };
    }
  }),
}));

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/admin/super-analytics',
    push: jest.fn(),
  })),
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  };
});

// Mock layout components
jest.mock('@/components/layout/Layout', () => {
  return {
    __esModule: true,
    default: ({ children }) => <div data-testid="layout">{children}</div>,
  };
});

jest.mock('@/components/layout/footer/footer', () => {
  return {
    __esModule: true,
    default: () => <footer data-testid="footer">Footer</footer>,
  };
});

// Mock chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

describe('SuperAnalyticsPage', () => {
  test('renders the page title', () => {
    render(<SuperAnalyticsPage />);
    expect(screen.getByText('Super Analytics 2.0')).toBeInTheDocument();
  });

  test('renders the time range selector', () => {
    render(<SuperAnalyticsPage />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('renders the top stats section', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('UNIQUE VISITORS')).toBeInTheDocument();
      expect(screen.getByText('TOTAL VISITS')).toBeInTheDocument();
      expect(screen.getByText('TOTAL PAGEVIEWS')).toBeInTheDocument();
      expect(screen.getByText('VIEWS PER VISIT')).toBeInTheDocument();
      expect(screen.getByText('BOUNCE RATE')).toBeInTheDocument();
      expect(screen.getByText('VISIT DURATION')).toBeInTheDocument();
    });
  });

  test('renders the visitors graph', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Visitors Over Time')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  test('renders the sources component', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Top Sources')).toBeInTheDocument();
      // Check if the direct/none source is displayed
      expect(screen.getByText('Direct / None')).toBeInTheDocument();
    });
  });

  test('renders the pages component', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Pages')).toBeInTheDocument();
      // Check if the dashboard page is displayed
      expect(screen.getByText('/dashboard')).toBeInTheDocument();
    });
  });

  test('renders the locations component', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Locations')).toBeInTheDocument();
      // Check if the first country is displayed
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
  });

  test('renders the devices component', async () => {
    render(<SuperAnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
      // Check if the chrome browser is displayed
      expect(screen.getByText('Chrome')).toBeInTheDocument();
    });
  });

  test('changes time range when selector is changed', async () => {
    render(<SuperAnalyticsPage />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '7d' } });

    expect(select.value).toBe('7d');
  });
});
