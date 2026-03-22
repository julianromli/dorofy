import { useCallback, useEffect, useMemo, useState } from 'react'

import useProductivityData from '@/features/analytics/hooks/useProductivityData'
import {
  selectRecentSessions,
  selectSessionChartSeries,
  selectSessionSummary,
} from '@/features/analytics/selectors/sessionSelectors'
import {
  deriveAnalyticsFilterLabel,
  selectCompletedTaskMonthOptions,
  selectCompletedTasks,
  selectResolvedAnalyticsFilter,
} from '@/features/analytics/selectors/taskSelectors'
import type {
  AnalyticsChartMetric,
  AnalyticsChartPoint,
  AnalyticsCompletedTaskItem,
  AnalyticsFilter,
  AnalyticsFilterPreset,
  AnalyticsMonthOption,
  AnalyticsRecentSession,
  AnalyticsSummary,
} from '@/features/analytics/types'

const DEFAULT_FILTER: AnalyticsFilter = { preset: '30d' }
const DEFAULT_METRIC: AnalyticsChartMetric = 'minutes'
const RECENT_SESSION_LIMIT = 10

const areFiltersEqual = (left: AnalyticsFilter, right: AnalyticsFilter) => {
  return left.preset === right.preset && left.selectedMonth === right.selectedMonth
}

export interface UseAnalyticsPageOptions {
  now?: Date
}

export interface AnalyticsPageViewModel {
  filter: AnalyticsFilter
  preset: AnalyticsFilterPreset
  selectedMonth: string | undefined
  metric: AnalyticsChartMetric
  monthOptions: AnalyticsMonthOption[]
  currentFilterLabel: string
  summary: AnalyticsSummary
  chartSeries: AnalyticsChartPoint[]
  recentSessions: AnalyticsRecentSession[]
  completedTasks: AnalyticsCompletedTaskItem[]
  isLoading: boolean
  error: Error | null
  reload: () => Promise<void>
  setPreset: (preset: AnalyticsFilterPreset) => void
  setMetric: (metric: AnalyticsChartMetric) => void
  setSelectedMonth: (selectedMonth: string) => void
}

const useAnalyticsPage = ({ now: nowOverride }: UseAnalyticsPageOptions = {}): AnalyticsPageViewModel => {
  const now = useMemo(() => nowOverride ?? new Date(), [nowOverride])
  const { tasks, sessions, isLoading, error, reload } = useProductivityData()

  const [filter, setFilter] = useState<AnalyticsFilter>(DEFAULT_FILTER)
  const [metric, setMetricState] = useState<AnalyticsChartMetric>(DEFAULT_METRIC)

  const monthOptions = useMemo(
    () => selectCompletedTaskMonthOptions(tasks, now),
    [now, tasks],
  )

  const resolvedFilter = useMemo(
    () => selectResolvedAnalyticsFilter({ filter, monthOptions, now }),
    [filter, monthOptions, now],
  )

  useEffect(() => {
    if (!areFiltersEqual(filter, resolvedFilter)) {
      setFilter(resolvedFilter)
    }
  }, [filter, resolvedFilter])

  const currentFilterLabel = useMemo(
    () => deriveAnalyticsFilterLabel(resolvedFilter, now),
    [now, resolvedFilter],
  )

  const summary = useMemo(
    () => selectSessionSummary({ sessions, tasks, filter: resolvedFilter, now }),
    [now, resolvedFilter, sessions, tasks],
  )

  const chartSeries = useMemo(
    () => selectSessionChartSeries({ sessions, filter: resolvedFilter, metric, now }),
    [metric, now, resolvedFilter, sessions],
  )

  const recentSessions = useMemo(
    () => selectRecentSessions({ sessions, tasks, filter: resolvedFilter, now, limit: RECENT_SESSION_LIMIT }),
    [sessions, tasks, resolvedFilter, now],
  )

  const completedTasks = useMemo(
    () => selectCompletedTasks({ tasks, filter: resolvedFilter, now }),
    [now, resolvedFilter, tasks],
  )

  const setPreset = useCallback((preset: AnalyticsFilterPreset) => {
    setFilter((current) => (
      current.preset === preset
        ? current
        : { ...current, preset }
    ))
  }, [])

  const setMetric = useCallback((nextMetric: AnalyticsChartMetric) => {
    setMetricState((current) => current === nextMetric ? current : nextMetric)
  }, [])

  const setSelectedMonth = useCallback((selectedMonth: string) => {
    setFilter((current) => current.selectedMonth === selectedMonth ? current : { ...current, selectedMonth })
  }, [])

  return {
    filter: resolvedFilter,
    preset: resolvedFilter.preset,
    selectedMonth: resolvedFilter.selectedMonth,
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
  }
}

export default useAnalyticsPage
