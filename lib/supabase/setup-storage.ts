import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// This script sets up the required storage buckets in Supabase
// Run with: npx tsx lib/supabase/setup-storage.ts

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Create 'files' bucket for general file storage
    const { data: filesBucket, error: filesError } = await supabase.storage
      .createBucket('files', {
        public: false,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
        fileSizeLimit: 52428800, // 50MB
      })

    if (filesError && !filesError.message.includes('already exists')) {
      console.error('Error creating files bucket:', filesError)
    } else {
      console.log('✓ Files bucket created/exists')
    }

    // Create 'avatars' bucket for user profile pictures
    const { data: avatarsBucket, error: avatarsError } = await supabase.storage
      .createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880, // 5MB
      })

    if (avatarsError && !avatarsError.message.includes('already exists')) {
      console.error('Error creating avatars bucket:', avatarsError)
    } else {
      console.log('✓ Avatars bucket created/exists')
    }

    // Create 'recordings' bucket for call recordings
    const { data: recordingsBucket, error: recordingsError } = await supabase.storage
      .createBucket('recordings', {
        public: false,
        fileSizeLimit: 52428800, // 50MB - same as files bucket
      })

    if (recordingsError && !recordingsError.message.includes('already exists')) {
      console.error('Error creating recordings bucket:', recordingsError)
    } else {
      console.log('✓ Recordings bucket created/exists')
    }

    console.log('\nStorage setup complete!')
    console.log('You can now upload files to these buckets.')

  } catch (error) {
    console.error('Setup error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupStorage()
}

export { setupStorage }