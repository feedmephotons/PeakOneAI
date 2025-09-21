import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed'
    }, { status: 500 })
  }
}