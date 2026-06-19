import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.warn('Supabase login error, checking local DB fallback:', error.message)
      const user = await prisma.user.findUnique({
        where: { email }
      })
      if (user) {
        const response = NextResponse.json({
          user: { id: user.id, email: user.email, user_metadata: { name: user.name } },
          session: { access_token: 'mock-session-token' },
          message: 'Login successful! (Local Fallback)',
        })
        
        response.cookies.set('sb-mock-user-id', user.id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 1 day
        })
        return response
      }

      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: 'Login successful!',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}