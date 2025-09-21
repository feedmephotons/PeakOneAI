import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Create auth user with Supabase
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create user in database
    if (authData.user) {
      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name,
        },
      })

      return NextResponse.json({
        user,
        message: 'Registration successful! Please check your email to verify your account.',
      })
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}