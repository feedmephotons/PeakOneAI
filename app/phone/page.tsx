"use client";

import React, { useState } from 'react';

interface Call {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  contact: string;
  phoneNumber: string;
  time: string;
  duration?: string;
  recorded: boolean;
  transcribed: boolean;
  aiSummary: boolean;
  status?: 'active' | 'ended';
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  lastCalled?: string;
  favorite?: boolean;
}

export default function PhonePage() {
  const [activeTab, setActiveTab] = useState<'recent' | 'contacts' | 'recordings'>('recent');
  const [isCallActive, setIsCallActive] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);

  const recentCalls: Call[] = [
    {
      id: '1',
      type: 'incoming',
      contact: 'Sarah Johnson',
      phoneNumber: '+1 (555) 123-4567',
      time: '10 min ago',
      duration: '5:23',
      recorded: true,
      transcribed: true,
      aiSummary: true,
      status: 'ended'
    },
    {
      id: '2',
      type: 'outgoing',
      contact: 'Michael Chen',
      phoneNumber: '+1 (555) 987-6543',
      time: '2 hours ago',
      duration: '12:45',
      recorded: true,
      transcribed: true,
      aiSummary: false,
      status: 'ended'
    },
    {
      id: '3',
      type: 'missed',
      contact: 'Emily Davis',
      phoneNumber: '+1 (555) 456-7890',
      time: '3 hours ago',
      recorded: false,
      transcribed: false,
      aiSummary: false,
      status: 'ended'
    },
    {
      id: '4',
      type: 'incoming',
      contact: 'David Wilson',
      phoneNumber: '+1 (555) 321-6547',
      time: 'Yesterday',
      duration: '25:10',
      recorded: true,
      transcribed: true,
      aiSummary: true,
      status: 'ended'
    },
  ];

  const contacts: Contact[] = [
    { id: '1', name: 'Sarah Johnson', phoneNumber: '+1 (555) 123-4567', email: 'sarah@company.com', company: 'Acme Corp', lastCalled: '10 min ago', favorite: true },
    { id: '2', name: 'Michael Chen', phoneNumber: '+1 (555) 987-6543', email: 'michael@tech.com', company: 'Tech Solutions', lastCalled: '2 hours ago' },
    { id: '3', name: 'Emily Davis', phoneNumber: '+1 (555) 456-7890', email: 'emily@design.com', company: 'Design Studio', lastCalled: '3 hours ago' },
    { id: '4', name: 'David Wilson', phoneNumber: '+1 (555) 321-6547', email: 'david@finance.com', company: 'Finance Inc', lastCalled: 'Yesterday', favorite: true },
  ];

  const CallIcon = ({ type }: { type: 'incoming' | 'outgoing' | 'missed' }) => {
    if (type === 'incoming') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    if (type === 'outgoing') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  const CallCard = ({ call }: { call: Call }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full ${
            call.type === 'missed' ? 'bg-red-100' : 'bg-gray-100'
          } flex items-center justify-center`}>
            <CallIcon type={call.type} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{call.contact}</h3>
              {call.status === 'active' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <span>{call.phoneNumber}</span>
              <span>•</span>
              <span>{call.time}</span>
              {call.duration && (
                <>
                  <span>•</span>
                  <span>{call.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {call.aiSummary && (
            <button className="px-3 py-1.5 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition-colors">
              AI Summary
            </button>
          )}
          {call.transcribed && (
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Transcript
            </button>
          )}
          {call.recorded && (
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Play
            </button>
          )}
          <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{contact.name}</h3>
              {contact.favorite && (
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500">{contact.company}</p>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
              <span>{contact.phoneNumber}</span>
              {contact.lastCalled && (
                <>
                  <span>•</span>
                  <span>Last called: {contact.lastCalled}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phone Calls</h1>
              <p className="text-sm text-gray-500 mt-1">Make calls with automatic recording and AI transcription</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNewContactModal(true)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Add Contact
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium">
                New Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dialer */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-8 text-white mb-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Quick Dial</h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <input
                type="tel"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="Enter phone number..."
                className="w-full bg-transparent text-2xl text-center placeholder-white/50 focus:outline-none"
              />
            </div>

            {/* Dial Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setDialNumber(prev => prev + digit)}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-xl font-medium transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              {isCallActive ? (
                <button
                  onClick={() => setIsCallActive(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>End Call</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsCallActive(true)}
                  className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </button>
              )}
              <button
                onClick={() => setDialNumber('')}
                className="px-6 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {/* AI Recording Notice */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-medium">Lisa Recording Active</p>
                  <p className="text-sm text-violet-100">Auto-transcription enabled</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1 mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'recent' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Calls
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'contacts' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'recordings' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recordings
          </button>
        </div>

        {/* Recent Calls */}
        {activeTab === 'recent' && (
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}

        {/* Recordings */}
        {activeTab === 'recordings' && (
          <div className="space-y-3">
            {recentCalls.filter(call => call.recorded).map((call) => (
              <div key={call.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{call.contact}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{call.time}</span>
                      <span>•</span>
                      <span>Duration: {call.duration}</span>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      {call.transcribed && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Transcribed
                        </span>
                      )}
                      {call.aiSummary && (
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                          ✓ AI Summary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors">
                      Play
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                      Download
                    </button>
                    {call.transcribed && (
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        View Transcript
                      </button>
                    )}
                    {call.aiSummary && (
                      <button className="px-3 py-1.5 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition-colors">
                        AI Insights
                      </button>
                    )}
                  </div>
                </div>

                {call.aiSummary && (
                  <div className="mt-4 p-4 bg-violet-50 rounded-lg">
                    <div className="flex items-center text-sm text-violet-700 mb-2">
                      <span className="mr-2">🤖</span>
                      <span className="font-medium">Lisa&apos;s Summary:</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Discussed project timeline and deliverables. Action items: 1) Send updated proposal by Friday, 2) Schedule follow-up meeting next week, 3) Review budget allocation.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Insights */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              Call Intelligence by Lisa
            </h3>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View All Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-violet-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📞</span>
                <span className="text-2xl font-bold text-gray-900">47</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Calls</p>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-2xl font-bold text-gray-900">3.5h</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Duration</p>
              <p className="text-xs text-gray-500 mt-1">Average: 4.5 min</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📝</span>
                <span className="text-2xl font-bold text-gray-900">23</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Action Items</p>
              <p className="text-xs text-gray-500 mt-1">Extracted from calls</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💬</span>
                <span className="text-2xl font-bold text-gray-900">92%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Transcription Rate</p>
              <p className="text-xs text-gray-500 mt-1">Accuracy score</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Contact</h2>
              <button
                onClick={() => setShowNewContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter contact name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter phone number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter email address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter company name..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewContactModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}