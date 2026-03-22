import { useCallback, useEffect, useRef, useState } from 'react'

import type { PomodoroSession } from '@/hooks/usePomodoroHistory'
import type { Task } from '@/hooks/useTasks'
import {
  type BackupData,
  dorofyDB,
  isMigrationComplete,
  migrateFromLocalStorage,
  type StoredTimerState,
} from '@/lib/indexeddb'

export type ProductivitySettings = {
  activeTaskId: string | null
  isLongPomodoro: boolean
  timerState: StoredTimerState | null
}

export type ProductivityBackupData = BackupData

type ProductivityData = {
  tasks: Task[]
  sessions: PomodoroSession[]
  settings: ProductivitySettings
}

const EMPTY_SETTINGS: ProductivitySettings = {
  activeTaskId: null,
  isLongPomodoro: false,
  timerState: null,
}

const EMPTY_DATA: ProductivityData = {
  tasks: [],
  sessions: [],
  settings: EMPTY_SETTINGS,
}

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error
  }

  return new Error('Failed to load productivity data')
}

const getLocalStorageValue = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const getStoredIsLongPomodoro = (): boolean => getLocalStorageValue('isLongPomodoro') === 'true'

const getStoredTimerState = (): StoredTimerState | null => {
  const serializedTimerState = getLocalStorageValue('timerState')

  if (!serializedTimerState) {
    return null
  }

  try {
    const parsedTimerState = JSON.parse(serializedTimerState)
    return parsedTimerState && typeof parsedTimerState === 'object' ? parsedTimerState as StoredTimerState : null
  } catch {
    return null
  }
}

const loadProductivityData = async (): Promise<ProductivityData> => {
  const migrationDone = await isMigrationComplete()
  if (!migrationDone) {
    await migrateFromLocalStorage()
  }

  await dorofyDB.init()

  const [tasks, sessions, activeTaskId] = await Promise.all([
    dorofyDB.getTasks<Task>(),
    dorofyDB.getPomodoroHistory<PomodoroSession>(),
    dorofyDB.getSetting<string | null>('activeTaskId'),
  ])

  return {
    tasks,
    sessions,
    settings: {
      activeTaskId: typeof activeTaskId === 'string' ? activeTaskId : null,
      isLongPomodoro: getStoredIsLongPomodoro(),
      timerState: getStoredTimerState(),
    },
  }
}

export const exportProductivityBackup = async (): Promise<ProductivityBackupData> => {
  return dorofyDB.exportData()
}

export const importProductivityBackup = async (data: ProductivityBackupData): Promise<void> => {
  await dorofyDB.importData(data)
}

export const clearProductivityData = async (): Promise<void> => {
  await dorofyDB.clear()
}

const useProductivityData = () => {
  const [tasks, setTasks] = useState<Task[]>(EMPTY_DATA.tasks)
  const [sessions, setSessions] = useState<PomodoroSession[]>(EMPTY_DATA.sessions)
  const [settings, setSettings] = useState<ProductivitySettings>(EMPTY_DATA.settings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef(true)
  const latestRequestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    const requestId = latestRequestIdRef.current + 1
    latestRequestIdRef.current = requestId

    if (isMountedRef.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const nextData = await loadProductivityData()

      if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
        return
      }

      setTasks(nextData.tasks)
      setSessions(nextData.sessions)
      setSettings(nextData.settings)
    } catch (error) {
      const normalizedError = normalizeError(error)
      console.error('Error loading productivity data:', normalizedError)

      if (!isMountedRef.current || latestRequestIdRef.current !== requestId) {
        return
      }

      setTasks(EMPTY_DATA.tasks)
      setSessions(EMPTY_DATA.sessions)
      setSettings(EMPTY_DATA.settings)
      setError(normalizedError)
    } finally {
      if (isMountedRef.current && latestRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    tasks,
    sessions,
    settings,
    isLoading,
    error,
    reload,
  }
}

export default useProductivityData
