
import { Info, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { GlassCard, GlassBadge } from '@/components/glass';
import BackupPanel from '@/features/analytics/components/BackupPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import CompletedTaskInsights from '@/features/analytics/components/CompletedTaskInsights';
import AnalyticsRecentSessions from '@/features/analytics/components/AnalyticsRecentSessions';
import AnalyticsSummaryCards from '@/features/analytics/components/AnalyticsSummaryCards';
import SessionTrendSection from '@/features/analytics/components/SessionTrendSection';
import useAnalyticsPage from '@/features/analytics/hooks/useAnalyticsPage';
import type { AnalyticsFilterPreset } from '@/features/analytics/types';

const Analytics = () => {
  const navigate = useNavigate();
  const {
    preset,
    selectedMonth,
    metric,
    monthOptions,
    currentFilterLabel,
    summary,
    chartSeries,
    recentSessions,
    completedTasks,
    isLoading,
    error,
    reload,
    setPreset,
    setMetric,
    setSelectedMonth,
  } = useAnalyticsPage();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground md:px-6">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground md:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center pt-20 text-center">
          <p className="text-destructive">Failed to load analytics data.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 pb-20 text-foreground md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        
        {/* 1. Page Header & Navigation */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="glass-floating-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:-translate-x-1 mt-1"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Productivity analytics
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Review focus sessions and completed task history.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={preset} onValueChange={(value: string) => setPreset(value as AnalyticsFilterPreset)}>
              <SelectTrigger className="glass-select-trigger w-40 rounded-[1.1rem]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent className="glass-select-content rounded-[1.1rem]">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="month">Specific month</SelectItem>
              </SelectContent>
            </Select>

            {preset === 'month' && (
              <Select
                value={selectedMonth ?? monthOptions[0]?.value ?? ''}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="glass-select-trigger w-44 rounded-[1.1rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-select-content rounded-[1.1rem]">
                  {monthOptions.map((monthOption) => (
                    <SelectItem key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex items-center gap-2">
              <GlassBadge variant="outline">{currentFilterLabel}</GlassBadge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="glass-floating-button flex h-9 w-9 items-center justify-center rounded-full" aria-label="Range info">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="glass-select-content border-0">
                    <p>Filters limit tasks and sessions by date and update live with your range selection.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* 2. Primary Session Summary Cards */}
        <section aria-label="Session Summary">
          <AnalyticsSummaryCards summary={summary} filterLabel={currentFilterLabel} />
        </section>

        {/* 3. Primary Session Trend Chart */}
        <SessionTrendSection 
          chartSeries={chartSeries} 
          metric={metric} 
          onMetricChange={setMetric} 
        />

        <div className="grid gap-6 xl:grid-cols-2">
          {/* 4. Secondary Recent Sessions */}
          <section aria-label="Recent Sessions">
            <GlassCard variant="default" className="h-full min-h-[360px]">
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent sessions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your latest focus blocks and linked tasks.</p>
                </div>
                <AnalyticsRecentSessions sessions={recentSessions} />
              </div>
            </GlassCard>
          </section>

          {/* 5. Secondary Completed Task Insights */}
          <section aria-label="Completed Tasks">
            <GlassCard variant="default" className="h-full min-h-[360px]">
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">Completed tasks log</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Everything you finished within the range.</p>
                </div>
                <CompletedTaskInsights tasks={completedTasks} />
              </div>
            </GlassCard>
          </section>
        </div>

        {/* 6. Final Backup Panel */}
        <section aria-label="Data Backup">
          <BackupPanel reload={reload} />
        </section>

      </div>
    </main>
  );
};

export default Analytics;
