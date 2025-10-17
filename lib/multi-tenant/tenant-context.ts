/**
 * Multi-Tenant Context System
 * Provides tenant isolation and context management
 */

export interface Organization {
  id: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  settings: {
    ragEnabled: boolean
    ragCorpusLimit: number
    maxUsers: number
    features: string[]
  }
  createdAt: Date
  ownerId: string
}

export interface TenantUser {
  id: string
  organizationId: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  permissions: string[]
  createdAt: Date
}

/**
 * Tenant Context Manager
 * Handles current tenant state and switching
 */
class TenantContextManager {
  private currentOrganization: Organization | null = null
  private currentUser: TenantUser | null = null

  /**
   * Get current organization
   */
  getCurrentOrganization(): Organization | null {
    if (!this.currentOrganization && typeof window !== 'undefined') {
      const stored = localStorage.getItem('current_organization')
      if (stored) {
        this.currentOrganization = JSON.parse(stored)
      }
    }
    return this.currentOrganization
  }

  /**
   * Get current organization ID (required for all queries)
   */
  getCurrentOrgId(): string | null {
    const org = this.getCurrentOrganization()
    return org?.id || null
  }

  /**
   * Set current organization (when user switches)
   */
  setCurrentOrganization(org: Organization): void {
    this.currentOrganization = org
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_organization', JSON.stringify(org))

      // Emit event for components to react
      window.dispatchEvent(new CustomEvent('organizationChanged', { detail: org }))
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): TenantUser | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('current_user')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
    return this.currentUser
  }

  /**
   * Set current user
   */
  setCurrentUser(user: TenantUser): void {
    this.currentUser = user
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user))
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Owners have all permissions
    if (user.role === 'owner') return true

    return user.permissions.includes(permission)
  }

  /**
   * Check if feature is enabled for current tenant
   */
  hasFeature(feature: string): boolean {
    const org = this.getCurrentOrganization()
    if (!org) return false

    return org.settings.features.includes(feature)
  }

  /**
   * Get plan limits for current tenant
   */
  getPlanLimits() {
    const org = this.getCurrentOrganization()
    if (!org) return PLAN_LIMITS.free

    return PLAN_LIMITS[org.plan]
  }

  /**
   * Clear tenant context (logout)
   */
  clearContext(): void {
    this.currentOrganization = null
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_organization')
      localStorage.removeItem('current_user')
    }
  }

  /**
   * Initialize with demo data (for development)
   */
  initializeDemoData(): void {
    const demoOrg: Organization = {
      id: 'org_demo',
      name: 'Demo Organization',
      plan: 'pro',
      settings: {
        ragEnabled: true,
        ragCorpusLimit: 10000,
        maxUsers: 50,
        features: ['rag', 'advanced-ai', 'api-access', 'sso']
      },
      createdAt: new Date(),
      ownerId: 'user_demo'
    }

    const demoUser: TenantUser = {
      id: 'user_demo',
      organizationId: 'org_demo',
      email: 'demo@peakai.com',
      name: 'Demo User',
      role: 'owner',
      permissions: ['*'],
      createdAt: new Date()
    }

    this.setCurrentOrganization(demoOrg)
    this.setCurrentUser(demoUser)
  }
}

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    ragDocuments: 100,
    ragQueriesPerMonth: 50,
    storageGB: 1,
    maxUsers: 5,
    features: ['basic-ai']
  },
  pro: {
    ragDocuments: 10000,
    ragQueriesPerMonth: 1000,
    storageGB: 50,
    maxUsers: 50,
    features: ['basic-ai', 'rag', 'advanced-ai', 'api-access']
  },
  enterprise: {
    ragDocuments: Infinity,
    ragQueriesPerMonth: Infinity,
    storageGB: Infinity,
    maxUsers: Infinity,
    features: ['basic-ai', 'rag', 'advanced-ai', 'api-access', 'sso', 'custom-models', 'dedicated-support']
  }
} as const

// Export singleton
export const tenantContext = new TenantContextManager()

// Initialize demo data on first load
if (typeof window !== 'undefined') {
  const org = tenantContext.getCurrentOrganization()
  if (!org) {
    tenantContext.initializeDemoData()
  }
}
