import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create user in database if Supabase auth succeeded
    if (data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email!,
          firstName,
          lastName,
          name: `${firstName || ''} ${lastName || ''}`.trim() || null,
        },
        create: {
          id: data.user.id,
          clerkId: data.user.id, // Using same ID for compatibility
          email: data.user.email!,
          firstName,
          lastName,
          name: `${firstName || ''} ${lastName || ''}`.trim() || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account created successfully'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
