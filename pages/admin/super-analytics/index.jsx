import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Footer from '@/components/layout/footer/footer';
import PlausibleTracker from '@/components/analytics/plausible/PlausibleTracker';
import TopStats from '@/components/analytics/plausible/TopStats';
import VisitorsGraph from '@/components/analytics/plausible/VisitorsGraph';
import TopSources from '@/components/analytics/plausible/TopSources';
import PagesComponent from '@/components/analytics/plausible/PagesComponent';
import LocationsComponent from '@/components/analytics/plausible/LocationsComponent';
import DevicesComponent from '@/components/analytics/plausible/DevicesComponent';
import OutboundLinks from '@/components/analytics/plausible/OutboundLinks';
import SourcesComponent from '@/components/analytics/plausible/SourcesComponent';
import DetailsModal from '@/components/analytics/plausible/DetailsModal';
import useCurrentUser from '@/hooks/useCurrentUser';
import usePlausibleUserAnalytics from '@/hooks/usePlausibleUserAnalytics';
import { timezones } from '@/lib/timezones';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * Super Analytics 2.0 Dashboard Page
 *
 * This page displays a user-specific analytics dashboard using Plausible
 * that matches the design of the Plausible dashboard.
 */
const SuperAnalyticsPage = () => {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [timeRange, setTimeRange] = useState('7d');
  const [timezone, setTimezone] = useState('UTC');
  const [chartMetric, setChartMetric] = useState('visits');
  const [modalContent, setModalContent] = useState(null);
  const router = useRouter();

  // Fetch data for each section of the dashboard
  const { data: dashboardData, isLoading: isDashboardLoading } = usePlausibleUserAnalytics(
    'dashboard',
    timeRange,
    { timezone: timezone }
  );

  const { data: sourcesData, isLoading: isSourcesLoading } = usePlausibleUserAnalytics(
    'sources',
    timeRange,
    { timezone: timezone }
  );

  const { data: pagesData, isLoading: isPagesLoading } = usePlausibleUserAnalytics(
    'pages',
    timeRange,
    { timezone: timezone }
  );

  const { data: locationsData, isLoading: isLocationsLoading } = usePlausibleUserAnalytics(
    'locations',
    timeRange,
    { timezone: timezone }
  );

  const { data: devicesData, isLoading: isDevicesLoading } = usePlausibleUserAnalytics(
    'devices',
    timeRange,
    { timezone: timezone }
  );

  const { data: outboundLinksData, isLoading: isOutboundLinksLoading } = usePlausibleUserAnalytics(
    'outbound-links',
    timeRange,
    { timezone: timezone }
  );

  // Time range options for selector
  const timeRangeOptions = [
    { value: 'day', label: 'Today' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'month', label: 'This month' },
    { value: '6mo', label: 'Last 6 months' },
    { value: '12mo', label: 'Last 12 months' },
  ];

  // Format for date range selector
  const formatTimeRangeLabel = range => {
    const option = timeRangeOptions.find(opt => opt.value === range);
    return option ? option.label : 'Today';
  };

  // Handler for opening detail modals
  const openDetailsModal = (type, data) => {
    setModalContent({ type, data });
  };

  // Handler for closing detail modals
  const closeModal = () => {
    setModalContent(null);
  };

  // Check if the user has an active subscription
  const isSubscribed = currentUser?.stripeSubscriptionStatus === 'active';

  // Loading state check
  if (isUserLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          {/* Add a loading indicator if desired */}
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Idly.pro | Super Analytics 2.0</title>
      </Head>

      {/* Include the Plausible tracker component */}
      <PlausibleTracker customProps={{ page: 'super-analytics' }} />

      <Layout>
        <div className="w-full lg:w-[100vw] pl-4 pr-4 overflow-auto">
          <div className="max-w-[1200px] mx-auto my-10">
            <div className="mb-8">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Super Analytics 2.0</h1>

                {/* Keep selectors always visible, but functionality might depend on subscription indirectly */}
                <div className="grid grid-cols-2 gap-4 mb-4 flex-grow">
                  {/* Timezone Selector */}
                  <div>
                    <label
                      htmlFor="timezone-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Time Zone
                    </label>
                    {/* Selectors remain - actual data fetching might be blocked if needed, but UI shows */}
                    <div className="relative">
                      <select
                        id="timezone-select"
                        className="block appearance-none bg-white border rounded-md w-full py-2 px-3 pr-8 leading-tight focus:outline-none focus:shadow-outline"
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                      >
                        {timezones.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Time Range Selector */}
                  <div>
                    <label
                      htmlFor="timerange-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Time Range
                    </label>
                    {/* ... Time Range select dropdown ... */}
                    <div className="relative">
                      <select
                        id="timerange-select"
                        className="block appearance-none bg-white border rounded-md w-full py-2 px-3 pr-8 leading-tight focus:outline-none focus:shadow-outline"
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value)}
                      >
                        {timeRangeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render all components, passing isSubscribed status */}
              {/* NOTE: Removed the main conditional block */}
              <>
                {/* Top stats section */}
                <TopStats
                  metrics={dashboardData?.metrics}
                  isLoading={isDashboardLoading || isUserLoading} // Consider user loading state too
                  selectedMetric={chartMetric}
                  onMetricSelect={setChartMetric}
                  isSubscribed={isSubscribed} // Pass subscription status
                />

                {/* Visitors graph */}
                <VisitorsGraph
                  timeseriesData={dashboardData?.timeseries}
                  isLoading={isDashboardLoading || isUserLoading}
                  timeRange={timeRange}
                  timezone={timezone}
                  metricToPlot={chartMetric}
                  isSubscribed={isSubscribed} // Pass subscription status
                />

                {/* Render the new SourcesComponent */}
                <SourcesComponent
                  sourcesData={sourcesData}
                  isLoading={isSourcesLoading || isUserLoading}
                  isSubscribed={isSubscribed} // Pass subscription status
                />

                {/* Outbound Links section */}
                <OutboundLinks
                  outboundLinksData={outboundLinksData}
                  isLoading={isOutboundLinksLoading || isUserLoading}
                  isSubscribed={isSubscribed} // Pass subscription status
                />

                {/* Locations and Devices section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Locations */}
                  <LocationsComponent
                    locationsData={locationsData}
                    isLoading={isLocationsLoading || isUserLoading}
                    isSubscribed={isSubscribed} // Pass subscription status
                  />

                  {/* Devices */}
                  <DevicesComponent
                    devicesData={devicesData}
                    isLoading={isDevicesLoading || isUserLoading}
                    isSubscribed={isSubscribed} // Pass subscription status
                  />
                </div>
              </>
              {/* Removed the lock screen block */}
            </div>

            {/* Upgrade prompt banner - MOVED HERE - shown only if user data loaded, user exists, and not subscribed */}
            {!isUserLoading && currentUser && !isSubscribed && (
              <div className="mt-10 mb-10 px-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md text-center">
                  <Lock className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Unlock Full Analytics Power
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to a Premium plan to view detailed charts and all analytics data.
                  </p>
                  <Link href="/admin/subscription" legacyBehavior>
                    <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-sm">
                      View Plans
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Details modal remains conditional on subscription */}
      {isSubscribed && modalContent && (
        <DetailsModal
          isOpen={!!modalContent}
          onClose={closeModal}
          title={
            modalContent.type === 'sources'
              ? 'Sources Details'
              : modalContent.type === 'pages'
                ? 'Pages Details'
                : modalContent.type === 'locations'
                  ? 'Locations Details'
                  : modalContent.type === 'devices'
                    ? 'Devices Details'
                    : modalContent.type === 'outbound-links'
                      ? 'Outbound Links Details'
                      : 'Details'
          }
        >
          <div className="p-4">
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(modalContent.data, null, 2)}
            </pre>
          </div>
        </DetailsModal>
      )}

      {/* Upgrade prompt banner - REMOVED FROM HERE */}
      {/* {!isUserLoading && currentUser && !isSubscribed && ( ... Banner code removed ... )} */}

      <Footer />
    </>
  );
};

export default SuperAnalyticsPage;
