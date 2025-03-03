import Chart from './bar-chart';
import Select from 'react-select';
import LinkStats from './link-stats';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useState } from 'react';
import { LocationStats } from './location-stats';
import { DeviceStats } from './device-stats';
import useTinybirdAnalytics from '@/hooks/useTinybirdAnalytics';

export function AnalyticsDashboard() {
  const options = [
    { value: 'last_hour', label: 'Last hour' },
    { value: 'last_24_hours', label: 'Last 24 hours' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
  ];

  const { data: currentUser } = useCurrentUser();
  const [filter, setFilter] = useState('last_hour');

  // Fetch analytics data from Tinybird
  const { data: pageviewData, isLoading: isPageviewLoading } = useTinybirdAnalytics(
    currentUser?.handle,
    filter,
    'pageviews'
  );

  const { data: deviceData, isLoading: isDeviceLoading } = useTinybirdAnalytics(
    currentUser?.handle,
    filter,
    'devices'
  );

  const { data: locationData, isLoading: isLocationLoading } = useTinybirdAnalytics(
    currentUser?.handle,
    filter,
    'locations'
  );

  const { data: linkData, isLoading: isLinkLoading } = useTinybirdAnalytics(
    currentUser?.handle,
    filter,
    'links'
  );

  // Format data for the chart component
  const formattedPageviewData = pageviewData?.data || [];

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h3 className="text-xl font-semibold">Analytics</h3>
        <Select
          onChange={option => setFilter(option.value)}
          className="w-[170px]"
          defaultValue={options[0]}
          options={options}
        />
      </div>
      <Chart
        analytics={pageviewData}
        totalVisits={pageviewData?.totalVisits || 0}
        isLoading={isPageviewLoading}
      />
      <LinkStats linkData={linkData} isLoading={isLinkLoading} />
      <DeviceStats analytics={deviceData} isLoading={isDeviceLoading} />
      <LocationStats analytics={locationData} isLoading={isLocationLoading} />
    </>
  );
}
