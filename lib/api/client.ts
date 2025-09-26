// API Client - Easy to switch from localStorage to real API
// Just change the implementation of these functions when backend is ready

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// API configuration
// API configuration for future use
// const API_CONFIG = {
//   baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// }

class ApiClient {
  private token: string | null = null

  constructor() {
    // In production, get token from auth service
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Simulate network delay in development
      if (process.env.NODE_ENV === 'development') {
        await delay(300 + Math.random() * 200)
      }

      // For now, use localStorage
      // In production, this will be: fetch(`${API_CONFIG.baseURL}${endpoint}`, ...)
      const response = await this.mockRequest<T>(endpoint, options)
      return response
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }
    }
  }

  // Mock implementation using localStorage
  private async mockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET'

    // Parse endpoint to determine resource
    const parts = endpoint.split('/').filter(Boolean)
    const resource = parts[0]
    const id = parts[1]
    const action = parts[2]

    switch (resource) {
      case 'auth':
        return this.handleAuth(action, options)
      case 'users':
        return this.handleUsers(id, method, options)
      case 'tasks':
        return this.handleTasks(id, method, options)
      case 'files':
        return this.handleFiles(id, method, options)
      case 'messages':
        return this.handleMessages(id, method, options)
      case 'activities':
        return this.handleActivities(id, method, options)
      default:
        return { success: false, error: 'Unknown endpoint' }
    }
  }

  private handleAuth(action: string | undefined, options: RequestInit): ApiResponse {
    const body = options.body ? JSON.parse(options.body as string) : {}

    switch (action) {
      case 'login':
        // Mock login
        const token = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('authToken', token)
        return {
          success: true,
          data: { token, user: { id: '1', email: body.email } }
        }
      case 'logout':
        localStorage.removeItem('authToken')
        return { success: true }
      case 'register':
        return {
          success: true,
          data: { message: 'Registration successful' }
        }
      default:
        return { success: false, error: 'Unknown auth action' }
    }
  }

  private handleUsers(id: string | undefined, method: string, options: RequestInit): ApiResponse {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const body = options.body ? JSON.parse(options.body as string) : {}

    switch (method) {
      case 'GET':
        if (id) {
          const user = users.find((u: {id: string}) => u.id === id)
          return user
            ? { success: true, data: user }
            : { success: false, error: 'User not found' }
        }
        return { success: true, data: users }

      case 'POST':
        const newUser = { ...body, id: Date.now().toString(), createdAt: new Date() }
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        return { success: true, data: newUser }

      case 'PUT':
        const index = users.findIndex((u: {id: string}) => u.id === id)
        if (index !== -1) {
          users[index] = { ...users[index], ...body, updatedAt: new Date() }
          localStorage.setItem('users', JSON.stringify(users))
          return { success: true, data: users[index] }
        }
        return { success: false, error: 'User not found' }

      case 'DELETE':
        const filtered = users.filter((u: {id: string}) => u.id !== id)
        localStorage.setItem('users', JSON.stringify(filtered))
        return { success: true }

      default:
        return { success: false, error: 'Method not allowed' }
    }
  }

  private handleTasks(id: string | undefined, method: string, options: RequestInit): ApiResponse {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const body = options.body ? JSON.parse(options.body as string) : {}

    switch (method) {
      case 'GET':
        if (id) {
          const task = tasks.find((t: {id: string}) => t.id === id)
          return task
            ? { success: true, data: task }
            : { success: false, error: 'Task not found' }
        }
        return { success: true, data: tasks }

      case 'POST':
        const newTask = {
          ...body,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        tasks.push(newTask)
        localStorage.setItem('tasks', JSON.stringify(tasks))
        return { success: true, data: newTask }

      case 'PUT':
        const index = tasks.findIndex((t: {id: string}) => t.id === id)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...body, updatedAt: new Date() }
          localStorage.setItem('tasks', JSON.stringify(tasks))
          return { success: true, data: tasks[index] }
        }
        return { success: false, error: 'Task not found' }

      case 'DELETE':
        const filtered = tasks.filter((t: {id: string}) => t.id !== id)
        localStorage.setItem('tasks', JSON.stringify(filtered))
        return { success: true }

      default:
        return { success: false, error: 'Method not allowed' }
    }
  }

  private handleFiles(id: string | undefined, method: string, options: RequestInit): ApiResponse {
    const files = JSON.parse(localStorage.getItem('fileManager') || '[]')
    const body = options.body ? JSON.parse(options.body as string) : {}

    switch (method) {
      case 'GET':
        if (id) {
          const file = files.find((f: {id: string}) => f.id === id)
          return file
            ? { success: true, data: file }
            : { success: false, error: 'File not found' }
        }
        return { success: true, data: files }

      case 'POST':
        const newFile = {
          ...body,
          id: Date.now().toString(),
          createdAt: new Date(),
          modifiedAt: new Date()
        }
        files.push(newFile)
        localStorage.setItem('fileManager', JSON.stringify(files))
        return { success: true, data: newFile }

      case 'PUT':
        const index = files.findIndex((f: {id: string}) => f.id === id)
        if (index !== -1) {
          files[index] = { ...files[index], ...body, modifiedAt: new Date() }
          localStorage.setItem('fileManager', JSON.stringify(files))
          return { success: true, data: files[index] }
        }
        return { success: false, error: 'File not found' }

      case 'DELETE':
        const filtered = files.filter((f: {id: string}) => f.id !== id)
        localStorage.setItem('fileManager', JSON.stringify(filtered))
        return { success: true }

      default:
        return { success: false, error: 'Method not allowed' }
    }
  }

  private handleMessages(id: string | undefined, method: string, options: RequestInit): ApiResponse {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    const body = options.body ? JSON.parse(options.body as string) : {}

    switch (method) {
      case 'GET':
        // Get messages for a conversation
        if (id) {
          const convMessages = messages.filter((m: {conversationId: string}) => m.conversationId === id)
          return { success: true, data: convMessages }
        }
        return { success: true, data: conversations }

      case 'POST':
        const newMessage = {
          ...body,
          id: Date.now().toString(),
          timestamp: new Date(),
          isRead: false
        }
        messages.push(newMessage)
        localStorage.setItem('messages', JSON.stringify(messages))

        // Update conversation last message
        const convIndex = conversations.findIndex((c: {id: string}) => c.id === body.conversationId)
        if (convIndex !== -1) {
          conversations[convIndex].lastMessage = body.content
          conversations[convIndex].lastMessageTime = new Date()
          localStorage.setItem('conversations', JSON.stringify(conversations))
        }

        return { success: true, data: newMessage }

      default:
        return { success: false, error: 'Method not allowed' }
    }
  }

  private handleActivities(id: string | undefined, method: string, options: RequestInit): ApiResponse {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')

    switch (method) {
      case 'GET':
        // Support filtering via query params
        const url = new URL(window.location.href)
        const filter = url.searchParams.get('filter')
        // const timeRange = url.searchParams.get('timeRange') // For future use

        let filtered = activities
        if (filter && filter !== 'all') {
          filtered = filtered.filter((a: {type: string}) => a.type === filter)
        }

        return { success: true, data: filtered }

      case 'POST':
        const newActivity = {
          ...options.body ? JSON.parse(options.body as string) : {},
          id: Date.now().toString(),
          timestamp: new Date()
        }
        activities.unshift(newActivity)
        // Keep only last 100 activities
        const trimmed = activities.slice(0, 100)
        localStorage.setItem('activities', JSON.stringify(trimmed))
        return { success: true, data: newActivity }

      default:
        return { success: false, error: 'Method not allowed' }
    }
  }

  // Public API methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }
}

// Export singleton instance
const apiClient = new ApiClient()
export default apiClient

// Export types
export type { ApiResponse }

// Helper hooks for React components
export const useApi = () => {
  return apiClient
}