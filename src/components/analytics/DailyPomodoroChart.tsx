import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { subDays, format, startOfDay } from 'date-fns';

interface DailyPomodoroChartProps {
  sessions: PomodoroSession[];
}

const DailyPomodoroChart: React.FC<DailyPomodoroChartProps> = ({ sessions }) => {
  const processData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), i))).reverse();

    const data = last7Days.map(day => {
      const dayStr = format(day, 'MMM d');
      const count = sessions.filter(session => {
        const sessionDay = startOfDay(new Date(session.completedAt));
        return sessionDay.getTime() === day.getTime();
      }).length;

      return { name: dayStr, 'Focus Sessions': count };
    });

    return data;
  };

  const chartData = processData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1917',
            borderColor: '#2c2a28',
            color: '#d6d3d1'
          }}
        />
        <Legend />
        <Bar dataKey="Focus Sessions" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyPomodoroChart;
