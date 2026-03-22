import React from 'react';
import { GlassCard, GlassButton } from '@/components/glass';
import AnalyticsTrendChart from './AnalyticsTrendChart';
import type { AnalyticsChartPoint, AnalyticsChartMetric } from '../types';

export interface SessionTrendSectionProps {
  chartSeries: AnalyticsChartPoint[];
  metric: AnalyticsChartMetric;
  onMetricChange: (metric: AnalyticsChartMetric) => void;
}

const SessionTrendSection: React.FC<SessionTrendSectionProps> = ({ chartSeries, metric, onMetricChange }) => {
  return (
    <section aria-label="Session Trend Chart">
      <GlassCard variant="elevated" className="min-h-[360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Focus sessions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Trend view of completed sessions over the selected range.</p>
            </div>
            <div className="flex items-center gap-2">
              <GlassButton
                onClick={() => onMetricChange('sessions')}
                variant={metric === 'sessions' ? 'active' : 'ghost'}
                size="sm"
                className={metric === 'sessions' ? 'glass-mode-accent text-white' : ''}
                aria-pressed={metric === 'sessions'}
              >
                Sessions
              </GlassButton>
              <GlassButton
                onClick={() => onMetricChange('minutes')}
                variant={metric === 'minutes' ? 'active' : 'ghost'}
                size="sm"
                className={metric === 'minutes' ? 'glass-mode-accent text-white' : ''}
                aria-pressed={metric === 'minutes'}
              >
                Minutes
              </GlassButton>
            </div>
          </div>
          <div className="min-h-[300px]">
            <AnalyticsTrendChart chartSeries={chartSeries} metric={metric} />
          </div>
        </div>
      </GlassCard>
    </section>
  );
};

export default SessionTrendSection;
