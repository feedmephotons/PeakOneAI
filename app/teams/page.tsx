'use client'

import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, Mail, MoreVertical, Shield, Crown,
  User, Settings, UserPlus, X, Check, Clock
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  status: 'active' | 'pending' | 'inactive'
  avatar?: string
  initials: string
  department?: string
  joinedAt: Date
}

interface Team {
  id: string
  name: string
  description?: string
  memberCount: number
}

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  member: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  guest: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'guest'>('member')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data
    const mockMembers: TeamMember[] = [
      { id: '1', name: 'You', email: 'you@company.com', role: 'owner', status: 'active', initials: 'YO', department: 'Leadership', joinedAt: new Date(Date.now() - 86400000 * 365) },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'admin', status: 'active', initials: 'SJ', department: 'Product', joinedAt: new Date(Date.now() - 86400000 * 180) },
      { id: '3', name: 'John Smith', email: 'john@company.com', role: 'admin', status: 'active', initials: 'JS', department: 'Engineering', joinedAt: new Date(Date.now() - 86400000 * 120) },
      { id: '4', name: 'Emily Chen', email: 'emily@company.com', role: 'member', status: 'active', initials: 'EC', department: 'Design', joinedAt: new Date(Date.now() - 86400000 * 90) },
      { id: '5', name: 'Mike Wilson', email: 'mike@company.com', role: 'member', status: 'active', initials: 'MW', department: 'Engineering', joinedAt: new Date(Date.now() - 86400000 * 60) },
      { id: '6', name: 'Lisa Park', email: 'lisa@company.com', role: 'member', status: 'active', initials: 'LP', department: 'Marketing', joinedAt: new Date(Date.now() - 86400000 * 30) },
      { id: '7', name: 'Alex Rivera', email: 'alex@company.com', role: 'member', status: 'pending', initials: 'AR', joinedAt: new Date() },
      { id: '8', name: 'Client User', email: 'client@external.com', role: 'guest', status: 'active', initials: 'CU', joinedAt: new Date(Date.now() - 86400000 * 7) },
    ]

    const mockTeams: Team[] = [
      { id: '1', name: 'Engineering', description: 'Software development team', memberCount: 8 },
      { id: '2', name: 'Product', description: 'Product management', memberCount: 4 },
      { id: '3', name: 'Design', description: 'UX and visual design', memberCount: 3 },
      { id: '4', name: 'Marketing', description: 'Marketing and growth', memberCount: 5 },
    ]

    setMembers(mockMembers)
    setTeams(mockTeams)
    setLoading(false)
  }, [])

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInvite = () => {
    if (!inviteEmail) return

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      initials: inviteEmail.substring(0, 2).toUpperCase(),
      joinedAt: new Date()
    }

    setMembers([...members, newMember])
    setInviteEmail('')
    setShowInviteModal(false)
  }

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />
      case 'admin':
        return <Shield className="w-3 h-3" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Check className="w-3 h-3" /> Active</span>
      case 'pending':
        return <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400"><Clock className="w-3 h-3" /> Pending</span>
      case 'inactive':
        return <span className="flex items-center gap-1 text-xs text-gray-500"><X className="w-3 h-3" /> Inactive</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Team Members
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your organization&apos;s team members and permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.filter(m => m.status === 'active').length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.filter(m => m.status === 'pending').length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invites</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Teams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Teams</h3>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                {teams.map(team => (
                  <button
                    key={team.id}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{team.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{team.memberCount} members</p>
                    </div>
                    <Users className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading team...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                            {getRoleIcon(member.role)}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                          {member.department || '-'}
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="py-4 px-4">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="flex gap-2">
                  {(['admin', 'member', 'guest'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                        inviteRole === role
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
