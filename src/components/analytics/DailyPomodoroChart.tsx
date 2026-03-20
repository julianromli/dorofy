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
        <XAxis dataKey="name" tick={{ fill: 'rgba(148, 163, 184, 0.85)', fontSize: 12 }} axisLine={false} tickLine={false} />
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

export default DailyPomodoroChart;
