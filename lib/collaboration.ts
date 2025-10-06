export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastSeen?: Date
}

export interface Mention {
  id: string
  userId: string
  userName: string
  position: number
  length: number
}

export interface TypingIndicator {
  userId: string
  userName: string
  context: string // e.g., 'task:123', 'message:456'
  timestamp: Date
}

class CollaborationManager {
  private usersKey = 'collaboration_users'
  private presenceKey = 'user_presence'
  private typingKey = 'typing_indicators'

  // User Management
  getUsers(): User[] {
    const users = localStorage.getItem(this.usersKey)
    if (!users) return this.getDefaultUsers()

    return JSON.parse(users).map((u: User) => ({
      ...u,
      lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined
    }))
  }

  getCurrentUser(): User {
    // In a real app, this would come from auth
    return {
      id: 'current-user',
      name: 'You',
      email: 'you@example.com',
      status: 'online'
    }
  }

  updateUserStatus(userId: string, status: User['status']): void {
    const users = this.getUsers()
    const user = users.find(u => u.id === userId)

    if (user) {
      user.status = status
      if (status === 'offline') {
        user.lastSeen = new Date()
      }
      localStorage.setItem(this.usersKey, JSON.stringify(users))
      this.broadcastPresenceChange(userId, status)
    }
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        status: 'online'
      },
      {
        id: 'user-2',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        status: 'away'
      },
      {
        id: 'user-3',
        name: 'Alex Smith',
        email: 'alex@example.com',
        status: 'offline',
        lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
      },
      {
        id: 'user-4',
        name: 'Emma Davis',
        email: 'emma@example.com',
        status: 'online'
      }
    ]
  }

  // Mentions
  extractMentions(text: string): Mention[] {
    const mentions: Mention[] = []
    const users = this.getUsers()
    const regex = /@(\w+(?:\s+\w+)?)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const mentionText = match[1]
      const user = users.find(u =>
        u.name.toLowerCase().includes(mentionText.toLowerCase()) ||
        u.email.toLowerCase().includes(mentionText.toLowerCase())
      )

      if (user) {
        mentions.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          position: match.index,
          length: match[0].length
        })
      }
    }

    return mentions
  }

  getMentionSuggestions(query: string): User[] {
    const users = this.getUsers()
    const currentUser = this.getCurrentUser()

    return users
      .filter(u => u.id !== currentUser.id)
      .filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
  }

  // Typing Indicators
  setTypingIndicator(userId: string, userName: string, context: string): void {
    const indicators = this.getTypingIndicators()
    const existing = indicators.find(i => i.userId === userId && i.context === context)

    if (existing) {
      existing.timestamp = new Date()
    } else {
      indicators.push({
        userId,
        userName,
        context,
        timestamp: new Date()
      })
    }

    localStorage.setItem(this.typingKey, JSON.stringify(indicators))
    this.cleanOldTypingIndicators()
  }

  clearTypingIndicator(userId: string, context: string): void {
    const indicators = this.getTypingIndicators()
    const filtered = indicators.filter(i => !(i.userId === userId && i.context === context))
    localStorage.setItem(this.typingKey, JSON.stringify(filtered))
  }

  getTypingIndicators(context?: string): TypingIndicator[] {
    const indicators = localStorage.getItem(this.typingKey)
    if (!indicators) return []

    const parsed = JSON.parse(indicators).map((i: TypingIndicator) => ({
      ...i,
      timestamp: new Date(i.timestamp)
    }))

    // Filter by context if provided
    const filtered = context
      ? parsed.filter((i: TypingIndicator) => i.context === context)
      : parsed

    // Only return recent indicators (< 3 seconds old)
    return filtered.filter((i: TypingIndicator) =>
      Date.now() - i.timestamp.getTime() < 3000
    )
  }

  private cleanOldTypingIndicators(): void {
    const indicators = this.getTypingIndicators()
    const cutoff = Date.now() - 5000 // 5 seconds

    const active = indicators.filter(i => i.timestamp.getTime() > cutoff)
    localStorage.setItem(this.typingKey, JSON.stringify(active))
  }

  // Presence Broadcasting (would be WebSocket in production)
  private broadcastPresenceChange(userId: string, status: User['status']): void {
    // In a real app, this would broadcast via WebSocket
    window.dispatchEvent(new CustomEvent('presence-change', {
      detail: { userId, status }
    }))
  }

  subscribeToPresence(callback: (userId: string, status: User['status']) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail.userId, customEvent.detail.status)
    }

    window.addEventListener('presence-change', handler)

    return () => window.removeEventListener('presence-change', handler)
  }

  // Activity Tracking
  trackActivity(userId: string): void {
    const users = this.getUsers()
    const user = users.find(u => u.id === userId)

    if (user && user.status === 'away') {
      this.updateUserStatus(userId, 'online')
    }
  }

  // Format mentions in text
  formatTextWithMentions(text: string, mentions: Mention[]): string {
    let formatted = text
    const sortedMentions = [...mentions].sort((a, b) => b.position - a.position)

    sortedMentions.forEach(mention => {
      const before = formatted.slice(0, mention.position)
      const after = formatted.slice(mention.position + mention.length)
      formatted = `${before}<span class="mention">@${mention.userName}</span>${after}`
    })

    return formatted
  }
}

export const collaboration = new CollaborationManager()
