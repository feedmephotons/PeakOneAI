import { useNotifications } from '@/components/notifications/NotificationProvider'

// Notification utilities for use outside of React components
let notificationInstance: ReturnType<typeof useNotifications> | null = null

export const setNotificationInstance = (instance: ReturnType<typeof useNotifications>) => {
  notificationInstance = instance
}

export const notify = {
  success: (title: string, message?: string, options?: any) => {
    if (notificationInstance) {
      notificationInstance.showNotification({
        type: 'success',
        title,
        message,
        ...options
      })
    }
  },
  error: (title: string, message?: string, options?: any) => {
    if (notificationInstance) {
      notificationInstance.showNotification({
        type: 'error',
        title,
        message,
        ...options
      })
    }
  },
  warning: (title: string, message?: string, options?: any) => {
    if (notificationInstance) {
      notificationInstance.showNotification({
        type: 'warning',
        title,
        message,
        ...options
      })
    }
  },
  info: (title: string, message?: string, options?: any) => {
    if (notificationInstance) {
      notificationInstance.showNotification({
        type: 'info',
        title,
        message,
        ...options
      })
    }
  }
}

// Pre-configured notification messages for common actions
export const notifications = {
  file: {
    uploadSuccess: (fileName: string) =>
      notify.success('File uploaded', `${fileName} has been uploaded successfully`),
    uploadError: (fileName: string, error?: string) =>
      notify.error('Upload failed', `Failed to upload ${fileName}${error ? `: ${error}` : ''}`),
    deleteSuccess: (fileName: string) =>
      notify.success('File deleted', `${fileName} has been removed`),
    shareSuccess: (fileName: string) =>
      notify.success('File shared', `${fileName} has been shared successfully`),
    downloadStarted: (fileName: string) =>
      notify.info('Download started', `Downloading ${fileName}...`),
  },
  task: {
    created: (taskName: string) =>
      notify.success('Task created', `"${taskName}" has been added to your tasks`),
    completed: (taskName: string) =>
      notify.success('Task completed', `"${taskName}" marked as done`),
    assigned: (taskName: string, assignee: string) =>
      notify.info('Task assigned', `"${taskName}" assigned to ${assignee}`),
    dueSoon: (taskName: string) =>
      notify.warning('Task due soon', `"${taskName}" is due in 1 hour`),
  },
  message: {
    received: (sender: string) =>
      notify.info('New message', `Message from ${sender}`),
    sent: () =>
      notify.success('Message sent', undefined, { duration: 2000 }),
    error: () =>
      notify.error('Message failed', 'Failed to send message'),
  },
  meeting: {
    starting: (meetingName: string) =>
      notify.info('Meeting starting', `${meetingName} is starting now`, {
        action: {
          label: 'Join',
          onClick: () => window.location.href = '/video'
        }
      }),
    reminder: (meetingName: string, time: string) =>
      notify.info('Meeting reminder', `${meetingName} at ${time}`),
    ended: () =>
      notify.info('Meeting ended', 'The video call has ended'),
  },
  ai: {
    processing: () =>
      notify.info('Processing', 'Lisa is thinking...', { duration: 0 }),
    ready: () =>
      notify.success('Ready', 'Lisa has a response for you'),
    error: () =>
      notify.error('AI Error', 'Lisa encountered an error processing your request'),
  },
  auth: {
    loginSuccess: () =>
      notify.success('Welcome back!', 'You have successfully logged in'),
    loginError: (error?: string) =>
      notify.error('Login failed', error || 'Invalid credentials'),
    logoutSuccess: () =>
      notify.info('Logged out', 'You have been logged out'),
    sessionExpired: () =>
      notify.warning('Session expired', 'Please log in again'),
  },
  general: {
    saved: () =>
      notify.success('Saved', 'Changes saved successfully'),
    error: (message?: string) =>
      notify.error('Error', message || 'Something went wrong'),
    loading: (message?: string) =>
      notify.info('Loading', message || 'Please wait...', { duration: 0 }),
    copied: () =>
      notify.success('Copied', 'Copied to clipboard', { duration: 2000 }),
  }
}