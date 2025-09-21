'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function TestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults({})

    // Test 1: Database Connection (via API)
    try {
      const dbTest = await fetch('/api/test/db')
      const dbResult = await dbTest.json()
      setResults(prev => ({ ...prev, database: dbResult.success }))
    } catch (error) {
      setResults(prev => ({ ...prev, database: false }))
    }

    // Test 2: Supabase Storage
    try {
      const storageTest = await fetch('/api/test/storage')
      const storageResult = await storageTest.json()
      setResults(prev => ({ ...prev, storage: storageResult.success }))
    } catch (error) {
      setResults(prev => ({ ...prev, storage: false }))
    }

    // Test 3: OpenAI Integration
    try {
      const aiTest = await fetch('/api/test/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello Lisa, are you working?' })
      })
      const aiResult = await aiTest.json()
      setResults(prev => ({ ...prev, ai: aiResult.success, aiResponse: aiResult.response }))
    } catch (error) {
      setResults(prev => ({ ...prev, ai: false }))
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Integration Test</h1>
              <p className="text-gray-500">Verify all services are working correctly</p>
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mb-8"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>

          <div className="space-y-4">
            {/* Database Test */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">DB</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Database Connection</h3>
                    <p className="text-sm text-gray-500">PostgreSQL via Supabase</p>
                  </div>
                </div>
                <div>
                  {loading && !('database' in results) && <Loader className="w-6 h-6 text-gray-400 animate-spin" />}
                  {results.database === true && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {results.database === false && <XCircle className="w-6 h-6 text-red-500" />}
                </div>
              </div>
            </div>

            {/* Storage Test */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">ST</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Storage Buckets</h3>
                    <p className="text-sm text-gray-500">Supabase Storage</p>
                  </div>
                </div>
                <div>
                  {loading && !('storage' in results) && <Loader className="w-6 h-6 text-gray-400 animate-spin" />}
                  {results.storage === true && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {results.storage === false && <XCircle className="w-6 h-6 text-red-500" />}
                </div>
              </div>
            </div>

            {/* AI Test */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lisa AI Assistant</h3>
                    <p className="text-sm text-gray-500">OpenAI GPT-5</p>
                  </div>
                </div>
                <div>
                  {loading && !('ai' in results) && <Loader className="w-6 h-6 text-gray-400 animate-spin" />}
                  {results.ai === true && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {results.ai === false && <XCircle className="w-6 h-6 text-red-500" />}
                </div>
              </div>
              {results.aiResponse && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-900"><strong>Lisa:</strong> {results.aiResponse}</p>
                </div>
              )}
            </div>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Test Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(results).filter(r => r === true).length}
                  </p>
                  <p className="text-sm text-gray-500">Passed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {Object.values(results).filter(r => r === false).length}
                  </p>
                  <p className="text-sm text-gray-500">Failed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {Math.round((Object.values(results).filter(r => r === true).length / 3) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}