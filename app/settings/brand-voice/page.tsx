'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Upload, FileText, Brain, Plus, Trash2, Check, Edit3,
  AlertCircle, BookOpen, Settings, ToggleLeft, ToggleRight, Shield, X
} from 'lucide-react'
import { MOCK_BRAND_VOICE } from '@/lib/peak/mock'

interface BrandGuideline {
  id: string
  name: string
  description?: string
  voiceTone: string
  personality: string[]
  isActive: boolean
  isDefault: boolean
  createdAt: string
  _count: {
    approvedTerms: number
    forbiddenTerms: number
    messagingRules: number
  }
}

const VOICE_TONES = [
  { value: 'formal', label: 'Formal', description: 'Professional and business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { value: 'technical', label: 'Technical', description: 'Precise and specialized' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'professional', label: 'Professional', description: 'Balanced and polished' }
]

const ENFORCEMENT_LEVELS = [
  { level: 1, name: 'Basic', description: 'Spell check and grammar only' },
  { level: 2, name: 'Suggestions', description: 'Gentle brand alignment suggestions' },
  { level: 3, name: 'Strict', description: 'Strong enforcement with explanations' },
  { level: 4, name: 'Auto-Rewrite', description: 'Automatic brand voice alignment' }
]

// Map the canonical defaultLevel onto the enforcement scale.
const LEVEL_FROM_DEFAULT: Record<string, number> = { subtle: 2, balanced: 3, strong: 4 }

// Seed the Acme "Company Brand Voice" guideline from the canonical fixture so the page is never empty.
function seedGuidelines(): BrandGuideline[] {
  const bv = MOCK_BRAND_VOICE
  return [
    {
      id: bv.id,
      name: bv.name,
      description: bv.sample,
      voiceTone: 'professional',
      personality: bv.tone,
      isActive: bv.enabled,
      isDefault: true,
      createdAt: bv.createdAt,
      _count: {
        approvedTerms: bv.doList.length,
        forbiddenTerms: bv.dontList.length,
        messagingRules: bv.doList.length + bv.dontList.length,
      },
    },
  ]
}

const STORAGE_KEY = 'brandVoiceGuidelines'
const SETTINGS_KEY = 'brandVoiceSettings'

export default function BrandVoiceSettingsPage() {
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editing, setEditing] = useState<BrandGuideline | null>(null)
  const [newGuideline, setNewGuideline] = useState({
    name: '',
    description: '',
    voiceTone: 'professional'
  })
  const [defaultLevel, setDefaultLevel] = useState(LEVEL_FROM_DEFAULT[MOCK_BRAND_VOICE.defaultLevel])
  const [brandVoiceEnabled, setBrandVoiceEnabled] = useState(MOCK_BRAND_VOICE.enabled)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const persist = useCallback((list: BrandGuideline[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [])

  // Hydrate from localStorage, falling back to the canonical seed (never empty).
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setGuidelines(JSON.parse(raw))
      } catch {
        setGuidelines(seedGuidelines())
      }
    } else {
      const seeded = seedGuidelines()
      setGuidelines(seeded)
      persist(seeded)
    }

    const s = localStorage.getItem(SETTINGS_KEY)
    if (s) {
      try {
        const v = JSON.parse(s)
        if (typeof v.defaultLevel === 'number') setDefaultLevel(v.defaultLevel)
        if (typeof v.brandVoiceEnabled === 'boolean') setBrandVoiceEnabled(v.brandVoiceEnabled)
      } catch { /* ignore */ }
    }
    setIsLoading(false)
  }, [persist])

  const persistSettings = (next: { defaultLevel?: number; brandVoiceEnabled?: boolean }) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      defaultLevel: next.defaultLevel ?? defaultLevel,
      brandVoiceEnabled: next.brandVoiceEnabled ?? brandVoiceEnabled,
    }))
  }

  // Single file-select path shared by the click-to-upload input and drag-and-drop.
  const acceptFile = (file?: File | null) => {
    if (file && file.type === 'application/pdf') setUploadFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    acceptFile(e.dataTransfer.files?.[0])
  }

  const resetModal = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setEditing(null)
    setNewGuideline({ name: '', description: '', voiceTone: 'professional' })
  }

  const handleSubmit = () => {
    if (!newGuideline.name.trim()) return
    // EXTERNAL: needs Clerk + Prisma (POST /api/brand-voice/guidelines) and Gemini PDF extraction.
    // Demo path creates/edits a guideline locally so the flow is fully demoable.
    if (editing) {
      const updated = guidelines.map((g) =>
        g.id === editing.id
          ? { ...g, name: newGuideline.name, description: newGuideline.description, voiceTone: newGuideline.voiceTone }
          : g
      )
      setGuidelines(updated)
      persist(updated)
    } else {
      const created: BrandGuideline = {
        id: `guideline-${Date.now()}`,
        name: newGuideline.name,
        description: newGuideline.description,
        voiceTone: newGuideline.voiceTone,
        personality: [],
        isActive: true,
        isDefault: guidelines.length === 0,
        createdAt: new Date().toISOString(),
        _count: { approvedTerms: 0, forbiddenTerms: 0, messagingRules: 0 },
      }
      const next = [...guidelines, created]
      setGuidelines(next)
      persist(next)
    }
    resetModal()
  }

  const toggleActive = (id: string) => {
    const next = guidelines.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    setGuidelines(next)
    persist(next)
  }

  const startEdit = (g: BrandGuideline) => {
    setEditing(g)
    setNewGuideline({ name: g.name, description: g.description ?? '', voiceTone: g.voiceTone })
    setShowUploadModal(true)
  }

  const deleteGuideline = (id: string) => {
    if (!confirm('Delete this brand guideline?')) return
    const next = guidelines.filter((g) => g.id !== id)
    setGuidelines(next)
    persist(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-indigo-500" />
                  Brand Voice Intelligence
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure brand guidelines to keep all communications on-brand
                </p>
              </div>
            </div>

            <button
              onClick={() => { setEditing(null); setNewGuideline({ name: '', description: '', voiceTone: 'professional' }); setShowUploadModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Guidelines
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Global Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Workspace Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Brand Voice Assistant</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Enable real-time brand voice analysis for all users
                </div>
              </div>
              <button
                onClick={() => { const next = !brandVoiceEnabled; setBrandVoiceEnabled(next); persistSettings({ brandVoiceEnabled: next }) }}
                className={`p-1 rounded-full transition ${
                  brandVoiceEnabled ? 'text-purple-600' : 'text-gray-400'
                }`}
                aria-label="Toggle brand voice assistant"
              >
                {brandVoiceEnabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Default Enforcement Level */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="font-medium text-gray-900 dark:text-white mb-2">Default Enforcement Level</div>
              <select
                value={defaultLevel}
                onChange={(e) => { const v = Number(e.target.value); setDefaultLevel(v); persistSettings({ defaultLevel: v }) }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ENFORCEMENT_LEVELS.map((level) => (
                  <option key={level.level} value={level.level}>
                    Level {level.level}: {level.name} - {level.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guidelines List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Brand Guidelines
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading guidelines...</p>
            </div>
          ) : guidelines.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Brand Guidelines Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Upload your brand guidelines PDF or create them manually to enable AI-powered brand voice enforcement.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Upload className="w-4 h-4" />
                Upload Guidelines PDF
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {guidelines.map((guideline) => (
                <div key={guideline.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {guideline.name}
                        </h3>
                        {guideline.isDefault && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => toggleActive(guideline.id)}
                          className={`px-2 py-0.5 text-xs rounded-full transition ${
                            guideline.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {guideline.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      {guideline.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {guideline.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Shield className="w-4 h-4" />
                          {guideline.voiceTone}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-green-600 dark:text-green-400">
                          {guideline._count.approvedTerms} approved terms
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-red-600 dark:text-red-400">
                          {guideline._count.forbiddenTerms} forbidden terms
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {guideline._count.messagingRules} rules
                        </span>
                      </div>

                      {guideline.personality.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {guideline.personality.slice(0, 5).map((trait, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEdit(guideline)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                        aria-label="Edit guideline"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteGuideline(guideline.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                        aria-label="Delete guideline"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20
          rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-500" />
            How Brand Voice Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Upload your brand guidelines PDF and AI will extract voice, tone, and rules automatically
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              As team members write emails, messages, and documents, they get real-time suggestions
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Enforcement levels let you choose from gentle suggestions to automatic rewrites
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Admins control workspace-wide settings; users can enable personal mode to bypass
            </li>
          </ul>
        </div>
      </div>

      {/* Upload / Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Brand Guidelines' : 'Add Brand Guidelines'}
              </h3>
              <button onClick={resetModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guideline Name *
                </label>
                <input
                  type="text"
                  value={newGuideline.name}
                  onChange={(e) => setNewGuideline({ ...newGuideline, name: e.target.value })}
                  placeholder="e.g., Company Brand Voice"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newGuideline.description}
                  onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
                  placeholder="Brief description of these guidelines..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Voice Tone
                </label>
                <select
                  value={newGuideline.voiceTone}
                  onChange={(e) => setNewGuideline({ ...newGuideline, voiceTone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {VOICE_TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label} - {tone.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Brand Guidelines PDF (Optional)
                </label>
                {/* Single file input + real drag-and-drop (no double-fire). */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                    isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-purple-500" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">{uploadFile.name}</div>
                        <div className="text-sm text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button
                        onClick={() => setUploadFile(null)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        aria-label="Remove file"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Drag &amp; drop a PDF here, or
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {/* EXTERNAL: needs Gemini PDF extraction to auto-derive voice + terminology + rules. */}
                  AI will analyze the PDF and extract brand voice, terminology, and messaging rules automatically.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={resetModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newGuideline.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <Brain className="w-4 h-4" />
                {editing ? 'Save Changes' : 'Create Guidelines'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
