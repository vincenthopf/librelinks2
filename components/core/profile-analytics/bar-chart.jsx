import Loader from '@/components/utils/loading-spinner';
import { BarChart as SimpleChart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Format timestamp for display
const formatTimestamp = timestamp => {
  if (!timestamp) return '';

  const date = new Date(timestamp);

  // For hourly data, show hour
  if (date.getMinutes() === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // For daily data, show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Chart = ({ analytics, totalVisits, isLoading }) => {
  // Format data for the chart
  const chartData = Array.isArray(analytics)
    ? analytics.map(item => ({
        timestamp: item.timestamp,
        t: formatTimestamp(item.timestamp),
        visits: item.visits,
      }))
    : [];

  // Check if we have an access warning
  const hasPermissionIssue =
    analytics?.warning?.includes('access') || analytics?.warning?.includes('token');

  return (
    <>
      <div className="mt-4 rounded-xl border bg-white py-4 px-2 w-full h-auto">
        <p className="font-semibold text-sm px-3 pb-2">Total visits</p>
        <div className="flex items-center gap-2 font-semibold text-2xl px-3 pb-2">
          {!isLoading ? (
            <h3>{totalVisits}</h3>
          ) : (
            <h3>
              <div className="mr-2 h-6 w-6 animate-pulse rounded-md bg-gray-200 lg:w-10 lg:h-10" />
            </h3>
          )}
          <SimpleChart />
        </div>
        <div className="">
          <ResponsiveContainer width="95%" height={300}>
            {!isLoading ? (
              chartData.length > 0 ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="t"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={15}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value}`}
                  />
                  <Tooltip
                    labelFormatter={label => `Time: ${label}`}
                    formatter={value => [`${value} visits`, 'Visits']}
                  />
                  <Bar dataKey="visits" fill="#adfa1d" />
                </BarChart>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {hasPermissionIssue ? (
                    <div className="text-center text-gray-500">
                      <p>Access to pageviews data is restricted.</p>
                      <p className="text-sm mt-2">Please check your Tinybird token permissions.</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No pageview data available yet.</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div>
                <Loader bgColor={'black'} message={'Fetching data'} />
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Chart;
