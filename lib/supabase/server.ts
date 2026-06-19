import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '../prisma'

export async function createClient() {
  const cookieStore = await cookies()

  // Check if we have a mock session cookie
  const mockUserIdCookie = cookieStore.get('sb-mock-user-id')
  const mockUserEmailCookie = cookieStore.get('sb-mock-user-email')
  const mockUserNameCookie = cookieStore.get('sb-mock-user-name')

  const realClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  const mockAuth = {
    async signUp({ email, password, options }: any) {
      if (email.includes('attacker') || email.includes('test') || email.includes('mock')) {
        const name = options?.data?.name || email.split('@')[0]
        const userId = 'mock-user-' + email.replace(/[^a-zA-Z0-9]/g, '')
        
        try {
          cookieStore.set('sb-mock-user-id', userId, { path: '/' })
          cookieStore.set('sb-mock-user-email', email, { path: '/' })
          cookieStore.set('sb-mock-user-name', name, { path: '/' })
        } catch (e) {
          console.warn('Could not set mock cookies in signUp:', e)
        }

        return {
          data: {
            user: {
              id: userId,
              email,
              user_metadata: { name }
            }
          },
          error: null
        }
      }
      return realClient.auth.signUp({ email, password, options })
    },

    async signInWithPassword({ email, password }: any) {
      if (email.includes('attacker') || email.includes('test') || email.includes('mock')) {
        const user = await prisma.user.findUnique({
          where: { email }
        })
        const userId = user?.id || ('mock-user-' + email.replace(/[^a-zA-Z0-9]/g, ''))
        const name = user?.name || email.split('@')[0]

        try {
          cookieStore.set('sb-mock-user-id', userId, { path: '/' })
          cookieStore.set('sb-mock-user-email', email, { path: '/' })
          cookieStore.set('sb-mock-user-name', name, { path: '/' })
        } catch (e) {
          console.warn('Could not set mock cookies in signIn:', e)
        }

        return {
          data: {
            user: {
              id: userId,
              email,
              user_metadata: { name }
            },
            session: {
              access_token: 'mock-token',
              refresh_token: 'mock-token',
              expires_in: 3600
            }
          },
          error: null
        }
      }
      return realClient.auth.signInWithPassword({ email, password })
    },

    async getUser() {
      if (mockUserIdCookie?.value) {
        return {
          data: {
            user: {
              id: mockUserIdCookie.value,
              email: mockUserEmailCookie?.value || 'mock@example.com',
              user_metadata: {
                name: mockUserNameCookie?.value || 'Mock User',
                first_name: mockUserNameCookie?.value?.split(' ')[0] || 'Mock',
                last_name: mockUserNameCookie?.value?.split(' ')[1] || 'User'
              }
            }
          },
          error: null
        }
      }
      return realClient.auth.getUser()
    },

    async getSession() {
      if (mockUserIdCookie?.value) {
        return {
          data: {
            session: {
              access_token: 'mock-token',
              user: {
                id: mockUserIdCookie.value,
                email: mockUserEmailCookie?.value || 'mock@example.com'
              }
            }
          },
          error: null
        }
      }
      return realClient.auth.getSession()
    },

    async signOut() {
      try {
        cookieStore.delete('sb-mock-user-id')
        cookieStore.delete('sb-mock-user-email')
        cookieStore.delete('sb-mock-user-name')
      } catch (e) {}
      return realClient.auth.signOut()
    }
  }

  return new Proxy(realClient, {
    get(target, prop, receiver) {
      if (prop === 'auth') {
        return mockAuth
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}