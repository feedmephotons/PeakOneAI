'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Edit2, Trash2, X, Copy, BookOpen } from 'lucide-react'
import { Template, TemplateType, templateManager } from '@/lib/templates'

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  type?: TemplateType
}

export default function TemplateManager({ isOpen, onClose, type }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: (type || 'task') as TemplateType,
    content: '',
    isShared: false
  })

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, type])

  const loadTemplates = () => {
    setTemplates(templateManager.getTemplates(type))
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.content.trim()) return

    const variables = templateManager.extractVariables(formData.content)
    templateManager.createTemplate({
      name: formData.name,
      type: formData.type,
      content: formData.content,
      variables,
      isShared: formData.isShared
    })

    loadTemplates()
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingTemplate || !formData.name.trim() || !formData.content.trim()) return

    const variables = templateManager.extractVariables(formData.content)
    templateManager.updateTemplate(editingTemplate.id, {
      name: formData.name,
      content: formData.content,
      variables,
      isShared: formData.isShared
    })

    loadTemplates()
    resetForm()
  }

  const handleDelete = (templateId: string) => {
    if (!confirm('Delete this template?')) return

    templateManager.deleteTemplate(templateId)
    loadTemplates()
  }

  const handleDuplicate = (template: Template) => {
    templateManager.createTemplate({
      name: `${template.name} (Copy)`,
      type: template.type,
      content: template.content,
      variables: template.variables,
      isShared: false
    })
    loadTemplates()
  }

  const handleInstallPreset = (preset: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    templateManager.installPreset(preset)
    loadTemplates()
  }

  const startEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
      isShared: template.isShared || false
    })
    setIsCreating(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: type || 'task',
      content: '',
      isShared: false
    })
    setEditingTemplate(null)
    setIsCreating(false)
  }

  const presets = templateManager.getPresetTemplates(formData.type)
  const detectedVariables = templateManager.extractVariables(formData.content)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Template Manager</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create reusable templates for tasks, messages, and more</p>
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
        <div className="flex-1 overflow-hidden flex">
          {/* Template List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <button
              onClick={() => {
                setIsCreating(true)
                setEditingTemplate(null)
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Template</span>
            </button>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No templates yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border transition cursor-pointer group ${
                      editingTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => startEdit(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{template.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(template)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(template.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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

          {/* Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {isCreating || editingTemplate ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Daily Standup"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateType })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="task">Task</option>
                      <option value="message">Message</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Use {variable_name} for dynamic values..."
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tip: Use curly braces for variables like {'{name}'}, {'{date}'}, {'{project}'}
                  </p>
                </div>

                {detectedVariables.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Detected Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {detectedVariables.map(v => (
                        <span key={v} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">
                          {'{' + v + '}'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={editingTemplate ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select or Create a Template</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a template from the list or create a new one</p>
                </div>

                {presets.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Quick Start Templates</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {presets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handleInstallPreset(preset)}
                          className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{preset.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{preset.variables.length} variables</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
