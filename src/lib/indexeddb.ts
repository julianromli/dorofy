/**
 * IndexedDB wrapper for Dorofy data persistence
 * Provides a robust storage solution with better capacity and querying than localStorage
 */

export interface DorofyData {
  tasks: any[]
  pomodoroHistory: any[]
  timerState: any
  settings: any
  activeTaskId: string | null
}

export interface BackupData extends DorofyData {
  version: number
  timestamp: number
  appVersion: string
}

class DorofyDB {
  private dbName = 'DorofyDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('pomodoroHistory')) {
          const historyStore = db.createObjectStore('pomodoroHistory', { keyPath: 'id' })
          historyStore.createIndex('timestamp', 'timestamp')
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }

  async setTasks(tasks: any[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(['tasks'], 'readwrite')
    const store = transaction.objectStore('tasks')

    // Clear existing tasks
    await store.clear()

    // Add all tasks
    for (const task of tasks) {
      await store.add(task)
    }
  }

  async getTasks(): Promise<any[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error('Failed to get tasks'))
      }
    })
  }

  async addPomodoroSession(session: any): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(['pomodoroHistory'], 'readwrite')
    const store = transaction.objectStore('pomodoroHistory')
    
    const sessionWithId = {
      ...session,
      id: session.id || Date.now().toString()
    }
    
    await store.add(sessionWithId)
  }

  async getPomodoroHistory(): Promise<any[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pomodoroHistory'], 'readonly')
      const store = transaction.objectStore('pomodoroHistory')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error('Failed to get pomodoro history'))
      }
    })
  }

  async setSetting(key: string, value: any): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(['settings'], 'readwrite')
    const store = transaction.objectStore('settings')
    
    await store.put({ key, value })
  }

  async getSetting(key: string): Promise<any> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result?.value)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get setting: ${key}`))
      }
    })
  }

  async exportData(): Promise<BackupData> {
    const [tasks, pomodoroHistory] = await Promise.all([
      this.getTasks(),
      this.getPomodoroHistory()
    ])

    const [timerState, activeTaskId, isLongPomodoro] = await Promise.all([
      this.getSetting('timerState'),
      this.getSetting('activeTaskId'),
      this.getSetting('isLongPomodoro')
    ])

    return {
      version: this.dbVersion,
      timestamp: Date.now(),
      appVersion: '1.0.0',
      tasks,
      pomodoroHistory,
      timerState,
      activeTaskId,
      settings: {
        isLongPomodoro
      }
    }
  }

  async importData(data: BackupData): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(['tasks', 'pomodoroHistory', 'settings'], 'readwrite')

    try {
      // Clear existing data
      await transaction.objectStore('tasks').clear()
      await transaction.objectStore('pomodoroHistory').clear()
      await transaction.objectStore('settings').clear()

      // Import tasks
      if (data.tasks) {
        for (const task of data.tasks) {
          await transaction.objectStore('tasks').add(task)
        }
      }

      // Import pomodoro history
      if (data.pomodoroHistory) {
        for (const session of data.pomodoroHistory) {
          await transaction.objectStore('pomodoroHistory').add(session)
        }
      }

      // Import settings
      if (data.timerState) {
        await transaction.objectStore('settings').put({ key: 'timerState', value: data.timerState })
      }
      if (data.activeTaskId) {
        await transaction.objectStore('settings').put({ key: 'activeTaskId', value: data.activeTaskId })
      }
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          await transaction.objectStore('settings').put({ key, value })
        }
      }
    } catch (error) {
      transaction.abort()
      throw new Error(`Failed to import data: ${error}`)
    }
  }

  async clear(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(['tasks', 'pomodoroHistory', 'settings'], 'readwrite')
    
    await Promise.all([
      transaction.objectStore('tasks').clear(),
      transaction.objectStore('pomodoroHistory').clear(),
      transaction.objectStore('settings').clear()
    ])
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Singleton instance
export const dorofyDB = new DorofyDB()

// Migration helper from localStorage
export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    // Check if there's data in localStorage to migrate
    const tasks = localStorage.getItem('tasks')
    const timerState = localStorage.getItem('timerState')
    const activeTaskId = localStorage.getItem('activeTaskId')
    const isLongPomodoro = localStorage.getItem('isLongPomodoro')

    if (!tasks && !timerState && !activeTaskId && !isLongPomodoro) {
      return false // No data to migrate
    }

    await dorofyDB.init()

    // Migrate tasks
    if (tasks) {
      const parsedTasks = JSON.parse(tasks)
      await dorofyDB.setTasks(parsedTasks)
    }

    // Migrate timer state
    if (timerState) {
      const parsedTimerState = JSON.parse(timerState)
      await dorofyDB.setSetting('timerState', parsedTimerState)
    }

    // Migrate active task ID
    if (activeTaskId) {
      await dorofyDB.setSetting('activeTaskId', activeTaskId)
    }

    // Migrate long pomodoro setting
    if (isLongPomodoro) {
      await dorofyDB.setSetting('isLongPomodoro', isLongPomodoro === 'true')
    }

    // Mark migration as complete
    await dorofyDB.setSetting('migrationComplete', true)

    // Optionally clear localStorage after successful migration
    localStorage.removeItem('tasks')
    localStorage.removeItem('timerState')
    localStorage.removeItem('activeTaskId')
    localStorage.removeItem('isLongPomodoro')

    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

// Check if migration has been completed
export async function isMigrationComplete(): Promise<boolean> {
  try {
    await dorofyDB.init()
    const migrationComplete = await dorofyDB.getSetting('migrationComplete')
    return migrationComplete === true
  } catch {
    return false
  }
}