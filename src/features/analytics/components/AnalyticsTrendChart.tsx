import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import type { AnalyticsChartMetric, AnalyticsChartPoint } from '@/features/analytics/types';

interface AnalyticsTrendChartProps {
  chartSeries: AnalyticsChartPoint[];
  metric: AnalyticsChartMetric;
}

const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({ chartSeries, metric }) => {
  const hasMeaningfulData = chartSeries.length > 0 && chartSeries.some(p => p.value > 0);

  if (!hasMeaningfulData) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-muted/10">
        <p className="text-sm text-muted-foreground">No session data available for this range.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartSeries}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="label" tick={{ fill: 'rgba(148, 163, 184, 0.85)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: 'rgba(148, 163, 184, 0.85)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            color: '#e5edf8',
            borderRadius: '18px',
            backdropFilter: 'blur(18px)',
          }}
        />
        <Legend />
        <Bar name={metric === 'sessions' ? 'Focus Sessions' : 'Focus Minutes'} dataKey="value" fill="rgba(105, 147, 255, 0.86)" radius={[12, 12, 8, 8]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsTrendChart;
