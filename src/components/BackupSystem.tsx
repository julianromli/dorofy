import React, { useState } from 'react'
import { Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { dorofyDB, BackupData } from '@/lib/indexeddb'
import { toast } from 'sonner'

interface BackupSystemProps {
  onDataImported?: () => void
}

const BackupSystem: React.FC<BackupSystemProps> = ({ onDataImported }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const data = await dorofyDB.exportData()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dorofy-backup-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      toast.success('Backup exported successfully', {
        description: 'Your data has been downloaded as a JSON file'
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export backup', {
        description: 'Please try again or contact support if the issue persists'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      
      const text = await file.text()
      const data: BackupData = JSON.parse(text)
      
      // Validate backup data structure
      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup file format')
      }
      
      await dorofyDB.importData(data)
      
      toast.success('Backup imported successfully', {
        description: 'Your data has been restored. Please refresh the page.'
      })
      
      // Notify parent component to refresh data
      onDataImported?.()
      
      // Optionally reload the page to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import backup', {
        description: error instanceof Error ? error.message : 'Invalid file format'
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    try {
      await dorofyDB.clear()
      toast.success('All data cleared', {
        description: 'Your data has been removed. Please refresh the page.'
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Clear data failed:', error)
      toast.error('Failed to clear data', {
        description: 'Please try again or contact support'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Data Backup & Restore
        </CardTitle>
        <CardDescription>
          Export your data for backup or import from a previous backup file.
          Your data includes tasks, pomodoro history, and settings.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Regular backups are recommended to prevent data loss. 
            Export your data before major updates or browser changes.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          {/* Row 1: Export + Import */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 w-full sm:flex-1 min-w-[200px]"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>

            <div className="relative w-full sm:flex-1 min-w-[200px]">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="backup-import"
              />
              <Button 
                variant="outline"
                disabled={isImporting}
                className="flex items-center gap-2 w-full"
                asChild
              >
                <label htmlFor="backup-import" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </label>
              </Button>
            </div>
          </div>

          {/* Row 2: Clear button full width */}
          <div>
            <Button 
              variant="destructive"
              onClick={handleClearData}
              className="flex items-center gap-2 w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Export:</strong> Creates a JSON file with all your data</p>
          <p><strong>Import:</strong> Restores data from a backup file (overwrites current data)</p>
          <p><strong>Clear:</strong> Permanently removes all stored data</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BackupSystem
