'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VideoCall from '@/components/video/VideoCall'

/**
 * Demo Video Page - Works without Daily.co
 * Perfect for quick client demos showing AI features
 */
export default function DemoVideoPage() {
  const router = useRouter()
  const [inCall, setInCall] = useState(false)

  const handleJoinDemo = () => {
    setInCall(true)
  }

  const handleLeave = () => {
    setInCall(false)
  }

  if (inCall) {
    return (
      <VideoCall
        meetingId="client-demo"
        onLeave={handleLeave}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              AI Meeting Assistant Demo
            </h1>
            <p className="text-blue-200 text-lg">
              Live transcription + AI action items
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎙️</span>
                </div>
                <h3 className="text-white font-semibold">Real-Time Transcription</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Powered by OpenAI Whisper - transcribes every 5 seconds
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="text-white font-semibold">AI Action Items</h3>
              </div>
              <p className="text-blue-200 text-sm">
                GPT-4 automatically detects tasks and deadlines
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <h3 className="text-white font-semibold">One-Click Tasks</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Add action items directly to your Kanban board
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="text-white font-semibold">Searchable Transcripts</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Full-text search with highlighting after meeting
              </p>
            </div>
          </div>

          {/* Demo Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Demo Instructions
            </h3>
            <ol className="text-blue-200 text-sm space-y-2 ml-6">
              <li className="list-decimal">Click "Start Demo" below</li>
              <li className="list-decimal">Allow camera and microphone access</li>
              <li className="list-decimal">Click the purple AI button (bottom right)</li>
              <li className="list-decimal">Say: <span className="text-white font-mono">"John needs to send the proposal by Friday"</span></li>
              <li className="list-decimal">Watch transcripts appear in real-time</li>
              <li className="list-decimal">See AI detect the action item automatically</li>
              <li className="list-decimal">Click "Add to Task Board" to create the task</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleJoinDemo}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              🚀 Start Demo
            </button>
            <button
              onClick={() => router.push('/video')}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition border border-white/20"
            >
              Back
            </button>
          </div>

          {/* Requirements */}
          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm">
              💡 No Daily.co needed • Works immediately with your camera
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
