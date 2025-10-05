'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'

interface TimeEntry {
  taskId: string
  startTime: Date
  endTime?: Date
  duration: number
}

interface TimeTrackerProps {
  taskId: string
  taskTitle: string
}

export default function TimeTracker({ taskId }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [entries, setEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    const savedEntries = localStorage.getItem(`time_entries_${taskId}`)
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [taskId])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    if (elapsed > 0) {
      const newEntry: TimeEntry = {
        taskId,
        startTime: new Date(Date.now() - elapsed * 1000),
        endTime: new Date(),
        duration: elapsed
      }
      const updatedEntries = [...entries, newEntry]
      setEntries(updatedEntries)
      localStorage.setItem(`time_entries_${taskId}`, JSON.stringify(updatedEntries))
    }
    setIsRunning(false)
    setElapsed(0)
  }

  const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0) + elapsed

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Time Tracking</h3>
        </div>
        <div className="text-2xl font-mono font-semibold text-gray-900 dark:text-white">
          {formatTime(elapsed)}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={handleStop}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          disabled={elapsed === 0}
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total time</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatTime(totalTime)}</span>
        </div>
        {entries.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {entries.length} session{entries.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
