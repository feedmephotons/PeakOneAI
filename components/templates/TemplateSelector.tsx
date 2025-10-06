'use client'

import { useState, useEffect } from 'react'
import { FileText, ChevronDown, Sparkles } from 'lucide-react'
import { Template, TemplateType, templateManager } from '@/lib/templates'

interface TemplateSelectorProps {
  type: TemplateType
  onSelect: (content: string) => void
  onOpenManager?: () => void
  className?: string
}

export default function TemplateSelector({ type, onSelect, onOpenManager, className = '' }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [showVariableForm, setShowVariableForm] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [type])

  const loadTemplates = () => {
    setTemplates(templateManager.getTemplates(type))
  }

  const handleSelectTemplate = (template: Template) => {
    if (template.variables.length === 0) {
      // No variables, apply immediately
      onSelect(template.content)
      setIsOpen(false)
    } else {
      // Has variables, show form
      setSelectedTemplate(template)
      setVariableValues({})
      setShowVariableForm(true)
      setIsOpen(false)
    }
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    const content = templateManager.applyTemplate(selectedTemplate, variableValues)
    onSelect(content)
    setShowVariableForm(false)
    setSelectedTemplate(null)
    setVariableValues({})
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Use Template</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Template</h3>
              </div>

              <div className="max-h-64 overflow-y-auto p-2">
                {templates.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No templates yet</p>
                    {onOpenManager && (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          onOpenManager()
                        }}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Create your first template
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              {template.name}
                            </h4>
                            {template.variables.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onOpenManager && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      onOpenManager()
                    }}
                    className="w-full px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition font-medium"
                  >
                    Manage Templates
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Variable Form Modal */}
      {showVariableForm && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Fill Template Variables</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Template: {selectedTemplate.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedTemplate.variables.map(variable => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {variable.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                    placeholder={`Enter ${variable}...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowVariableForm(false)
                  setSelectedTemplate(null)
                  setVariableValues({})
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
