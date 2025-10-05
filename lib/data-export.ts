// Data export/import utilities

export interface ExportData {
  version: string
  exportDate: string
  data: {
    files?: unknown[]
    tasks?: unknown[]
    conversations?: unknown[]
    calendar_events?: unknown[]
    contacts?: unknown[]
    settings?: unknown
    [key: string]: unknown
  }
}

export class DataExporter {
  static export(format: 'json' | 'csv' = 'json'): string {
    const data: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {}
    }

    // Get all localStorage keys
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          data.data[key] = JSON.parse(value)
        }
      } catch {
        // Skip non-JSON values
      }
    })

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      return this.convertToCSV(data)
    }
  }

  static exportModule(module: string, format: 'json' | 'csv' = 'json'): string {
    const data = localStorage.getItem(module)
    if (!data) return ''

    if (format === 'json') {
      return JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        module,
        data: JSON.parse(data)
      }, null, 2)
    } else {
      const parsed = JSON.parse(data)
      return this.arrayToCSV(Array.isArray(parsed) ? parsed : [parsed])
    }
  }

  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  static async import(file: File): Promise<boolean> {
    try {
      const content = await file.text()
      const data: ExportData = JSON.parse(content)

      if (!data.version || !data.data) {
        throw new Error('Invalid export file format')
      }

      // Import all data
      Object.entries(data.data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, JSON.stringify(value))
        }
      })

      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  static async importModule(file: File, module: string): Promise<boolean> {
    try {
      const content = await file.text()
      const data = JSON.parse(content)

      if (data.module && data.module !== module) {
        throw new Error('Module mismatch')
      }

      const moduleData = data.data || data
      localStorage.setItem(module, JSON.stringify(moduleData))

      return true
    } catch (error) {
      console.error('Module import failed:', error)
      return false
    }
  }

  private static convertToCSV(data: ExportData): string {
    let csv = 'Module,Data\n'

    Object.entries(data.data).forEach(([key, value]) => {
      const jsonStr = JSON.stringify(value).replace(/"/g, '""')
      csv += `"${key}","${jsonStr}"\n`
    })

    return csv
  }

  private static arrayToCSV(array: unknown[]): string {
    if (array.length === 0) return ''

    const headers = Object.keys(array[0] as Record<string, unknown>)
    let csv = headers.join(',') + '\n'

    array.forEach(item => {
      const row = headers.map(header => {
        const value = (item as Record<string, unknown>)[header]
        const str = String(value).replace(/"/g, '""')
        return `"${str}"`
      })
      csv += row.join(',') + '\n'
    })

    return csv
  }
}

export class DataBackup {
  static createBackup(): string {
    return DataExporter.export('json')
  }

  static restoreBackup(content: string): boolean {
    try {
      const data: ExportData = JSON.parse(content)

      // Clear existing data (optional)
      // localStorage.clear()

      // Restore all data
      Object.entries(data.data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, JSON.stringify(value))
        }
      })

      return true
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }

  static scheduleAutoBackup(intervalMinutes: number) {
    const interval = intervalMinutes * 60 * 1000

    setInterval(() => {
      const backup = this.createBackup()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      DataExporter.downloadFile(
        backup,
        `saasx-backup-${timestamp}.json`,
        'application/json'
      )
    }, interval)
  }
}
