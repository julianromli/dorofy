import { useState } from 'react'
import { AlertTriangle, Download, RotateCcw, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { GlassBadge, GlassButton, GlassCard } from '@/components/glass'
import {
  clearProductivityData,
  exportProductivityBackup,
  importProductivityBackup,
  type ProductivityBackupData,
} from '@/features/analytics/hooks/useProductivityData'

interface BackupPanelProps {
  reload: () => Promise<void>
}

const BackupPanel = ({ reload }: BackupPanelProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const data = await exportProductivityBackup()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `dorofy-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Backup exported successfully', {
        description: 'Your data has been downloaded as a JSON file.',
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export backup', {
        description: 'Please try again or contact support if the issue persists.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsImporting(true)
      const text = await file.text()
      const data: ProductivityBackupData = JSON.parse(text)

      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup file format')
      }

      await importProductivityBackup(data)
      await reload()

      toast.success('Backup imported successfully', {
        description: 'Your data has been restored and analytics were refreshed.',
      })
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import backup', {
        description: error instanceof Error ? error.message : 'Invalid file format',
      })
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    try {
      await clearProductivityData()
      await reload()

      toast.success('All data cleared', {
        description: 'Your data has been removed and analytics were refreshed.',
      })
    } catch (error) {
      console.error('Clear data failed:', error)
      toast.error('Failed to clear data', {
        description: 'Please try again or contact support.',
      })
    }
  }

  return (
    <GlassCard variant="default" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="glass-floating-button flex h-11 w-11 items-center justify-center rounded-[1.15rem]">
              <Download className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Backup and restore</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Export tasks, pomodoro history, and settings as a local JSON snapshot.
              </p>
            </div>
          </div>
        </div>

        <GlassBadge variant="outline">Safety</GlassBadge>
      </div>

      <div className="glass-panel glass-panel-danger rounded-[1.4rem] px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Regular exports are recommended before browser changes or major UI updates.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <GlassButton onClick={handleExport} disabled={isExporting} variant="hero" icon={Download} className="w-full justify-center">
          {isExporting ? 'Exporting...' : 'Export data'}
        </GlassButton>

        <div className="relative">
          <input
            id="backup-import"
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <GlassButton asChild variant="default" icon={Upload} className="w-full justify-center" disabled={isImporting}>
            <label htmlFor="backup-import" className="cursor-pointer">
              {isImporting ? 'Importing...' : 'Import data'}
            </label>
          </GlassButton>
        </div>
      </div>

      <GlassButton onClick={handleClearData} variant="danger" icon={RotateCcw} className="w-full justify-center">
        Clear all data
      </GlassButton>

      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong>Export:</strong> Creates a JSON file with all app data.</p>
        <p><strong>Import:</strong> Restores data from a previous backup and overwrites current content.</p>
        <p><strong>Clear:</strong> Permanently removes local data from this browser.</p>
      </div>
    </GlassCard>
  )
}

export default BackupPanel
