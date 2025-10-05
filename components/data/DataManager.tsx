'use client'

import React, { useState } from 'react'
import { Download, Upload, FileJson, Database, Trash2, AlertTriangle } from 'lucide-react'
import { DataExporter, DataBackup } from '@/lib/data-export'
import { useNotifications } from '@/components/notifications/NotificationProvider'

export default function DataManager() {
  const { showNotification } = useNotifications()
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('json')
  const [selectedModule, setSelectedModule] = useState<string>('all')

  const modules = [
    { id: 'all', name: 'All Data' },
    { id: 'fileManager', name: 'Files' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'conversations', name: 'Messages' },
    { id: 'calendar_events', name: 'Calendar Events' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'settings', name: 'Settings' }
  ]

  const handleExport = () => {
    try {
      const content = selectedModule === 'all'
        ? DataExporter.export(selectedFormat)
        : DataExporter.exportModule(selectedModule, selectedFormat)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = selectedModule === 'all'
        ? `saasx-export-${timestamp}.${selectedFormat}`
        : `saasx-${selectedModule}-${timestamp}.${selectedFormat}`

      DataExporter.downloadFile(
        content,
        filename,
        selectedFormat === 'json' ? 'application/json' : 'text/csv'
      )

      showNotification({
        type: 'success',
        title: 'Export Successful',
        message: `Your data has been exported to ${filename}`,
        duration: 3000
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'There was an error exporting your data',
        duration: 3000
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const success = selectedModule === 'all'
        ? await DataExporter.import(file)
        : await DataExporter.importModule(file, selectedModule)

      if (success) {
        showNotification({
          type: 'success',
          title: 'Import Successful',
          message: 'Your data has been imported successfully',
          duration: 3000
        })
        window.location.reload()
      } else {
        throw new Error('Import failed')
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Import Failed',
        message: 'There was an error importing your data. Please check the file format.',
        duration: 3000
      })
    }

    event.target.value = ''
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (selectedModule === 'all') {
        localStorage.clear()
      } else {
        localStorage.removeItem(selectedModule)
      }

      showNotification({
        type: 'success',
        title: 'Data Cleared',
        message: 'Your data has been cleared successfully',
        duration: 3000
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const handleCreateBackup = () => {
    const backup = DataBackup.createBackup()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    DataExporter.downloadFile(
      backup,
      `saasx-backup-${timestamp}.json`,
      'application/json'
    )

    showNotification({
      type: 'success',
      title: 'Backup Created',
      message: 'Your backup has been downloaded',
      duration: 3000
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Data Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Export, import, and manage your application data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFormat('json')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    selectedFormat === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    selectedFormat === 'csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select a file to import
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backup</h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create a complete backup of all your data
          </p>

          <button
            onClick={handleCreateBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Database className="w-4 h-4" />
            Create Backup
          </button>
        </div>

        {/* Clear Data Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Clear selected data. This action cannot be undone.
          </p>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
        </div>
      </div>
    </div>
  )
}
