import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Sync user to database
    if (data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email!,
        },
        create: {
          id: data.user.id,
          clerkId: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          name: data.user.user_metadata?.first_name
            ? `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name || ''}`.trim()
            : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
