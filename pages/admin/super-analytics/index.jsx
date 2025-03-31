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
import DetailsModal from '@/components/analytics/plausible/DetailsModal';
import useCurrentUser from '@/hooks/useCurrentUser';
import usePlausibleUserAnalytics from '@/hooks/usePlausibleUserAnalytics';

/**
 * Super Analytics 2.0 Dashboard Page
 *
 * This page displays a user-specific analytics dashboard using Plausible
 * that matches the design of the Plausible dashboard.
 */
const SuperAnalyticsPage = () => {
  const { data: currentUser } = useCurrentUser();
  const [timeRange, setTimeRange] = useState('day');
  const [modalContent, setModalContent] = useState(null);

  // Fetch data for each section of the dashboard
  const { data: dashboardData, isLoading: isDashboardLoading } = usePlausibleUserAnalytics(
    'dashboard',
    timeRange
  );

  const { data: sourcesData, isLoading: isSourcesLoading } = usePlausibleUserAnalytics(
    'sources',
    timeRange
  );

  const { data: pagesData, isLoading: isPagesLoading } = usePlausibleUserAnalytics(
    'pages',
    timeRange
  );

  const { data: locationsData, isLoading: isLocationsLoading } = usePlausibleUserAnalytics(
    'locations',
    timeRange
  );

  const { data: devicesData, isLoading: isDevicesLoading } = usePlausibleUserAnalytics(
    'devices',
    timeRange
  );

  const { data: outboundLinksData, isLoading: isOutboundLinksLoading } = usePlausibleUserAnalytics(
    'outbound-links',
    timeRange
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

  return (
    <>
      <Head>
        <title>Librelinks | Super Analytics 2.0</title>
      </Head>

      {/* Include the Plausible tracker component */}
      <PlausibleTracker customProps={{ page: 'super-analytics' }} />

      <Layout>
        <div className="w-full lg:w-[100vw] pl-4 pr-4 overflow-auto">
          <div className="max-w-[1200px] mx-auto my-10">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Super Analytics 2.0</h1>

                {/* Time range selector */}
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <select
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

              {/* Top stats section */}
              <TopStats metrics={dashboardData?.metrics} isLoading={isDashboardLoading} />

              {/* Visitors graph */}
              <VisitorsGraph
                timeseriesData={dashboardData?.timeseries}
                isLoading={isDashboardLoading}
                timeRange={timeRange}
              />

              {/* Outbound Links section */}
              <OutboundLinks
                outboundLinksData={outboundLinksData}
                isLoading={isOutboundLinksLoading}
              />

              {/* Sources and Pages section */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <TopSources sourcesData={sourcesData} isLoading={isSourcesLoading} />

                <PagesComponent pagesData={pagesData} isLoading={isPagesLoading} />
              </div> */}

              {/* Locations and Devices section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Locations */}
                <LocationsComponent locationsData={locationsData} isLoading={isLocationsLoading} />

                {/* Devices */}
                <DevicesComponent devicesData={devicesData} isLoading={isDevicesLoading} />
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Details modal for showing expanded information */}
      {modalContent && (
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

      <Footer />
    </>
  );
};

export default SuperAnalyticsPage;
