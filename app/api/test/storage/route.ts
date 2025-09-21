import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use service role key to list buckets
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // List storage buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      throw error
    }

    const expectedBuckets = ['files', 'avatars', 'recordings']
    const foundBuckets = buckets?.map(b => b.name) || []
    const allBucketsExist = expectedBuckets.every(b => foundBuckets.includes(b))

    return NextResponse.json({
      success: allBucketsExist,
      message: allBucketsExist ? 'All storage buckets configured' : 'Some buckets missing',
      buckets: foundBuckets
    })
  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Storage test failed'
    }, { status: 500 })
  }
}