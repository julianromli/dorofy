import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { subDays, format, startOfDay } from 'date-fns';

interface DailyPomodoroChartProps {
  sessions: PomodoroSession[];
  rangeDays?: number; // default 7
  metric?: 'sessions' | 'minutes';
}

const DailyPomodoroChart: React.FC<DailyPomodoroChartProps> = ({ sessions, rangeDays = 7, metric = 'sessions' }) => {
  const processData = () => {
    const lastNDays = Array.from({ length: rangeDays }, (_, i) => startOfDay(subDays(new Date(), i))).reverse();

    const data = lastNDays.map(day => {
      const dayStr = format(day, 'MMM d');
      const daySessions = sessions.filter(session => {
        const sessionDay = startOfDay(new Date(session.completedAt));
        return sessionDay.getTime() === day.getTime();
      });

      const value = metric === 'sessions'
        ? daySessions.length
        : Math.round(daySessions.reduce((acc, s) => acc + s.duration, 0) / 60); // minutes

      return { name: dayStr, value };
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
        <Bar name={metric === 'sessions' ? 'Focus Sessions' : 'Focus Minutes'} dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyPomodoroChart;
