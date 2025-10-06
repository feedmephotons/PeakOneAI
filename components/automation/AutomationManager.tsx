'use client'

import { useState, useEffect } from 'react'
import { Zap, Plus, Power, Trash2, X, Play, Pause, Activity } from 'lucide-react'
import { AutomationRule, automationEngine, TriggerType, ActionType } from '@/lib/automation'

interface AutomationManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function AutomationManager({ isOpen, onClose }: AutomationManagerProps) {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadRules()
    }
  }, [isOpen])

  const loadRules = () => {
    setRules(automationEngine.getRules())
  }

  const handleToggleRule = (id: string) => {
    automationEngine.toggleRule(id)
    loadRules()
  }

  const handleDeleteRule = (id: string) => {
    if (!confirm('Delete this automation rule?')) return
    automationEngine.deleteRule(id)
    loadRules()
  }

  const handleInstallPreset = (preset: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>) => {
    automationEngine.installPreset(preset)
    loadRules()
  }

  const presets = automationEngine.getPresetRules()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Automation Rules</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automate repetitive tasks with if-then workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Active Rules */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Rules</h3>

            {rules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <Zap className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No automation rules yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create rules to automate your workflow
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 border rounded-lg transition ${
                      rule.enabled
                        ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                          {rule.enabled ? (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
                              Paused
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Trigger: {rule.trigger.type.replace('_', ' ')}
                          </span>
                          <span>Actions: {rule.actions.length}</span>
                          <span>Runs: {rule.runCount}</span>
                          {rule.lastRun && (
                            <span>Last run: {rule.lastRun.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`p-2 rounded transition ${
                            rule.enabled
                              ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={rule.enabled ? 'Pause' : 'Activate'}
                        >
                          {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preset Templates */}
          {presets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Start Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleInstallPreset(preset)}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition group"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {preset.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{preset.description}</p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Trigger: {preset.trigger.type.replace('_', ' ')} → {preset.actions.length} action(s)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rules.filter(r => r.enabled).length} active rules • {rules.length} total
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
