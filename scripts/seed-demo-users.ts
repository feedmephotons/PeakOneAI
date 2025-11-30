/**
 * Seed Demo Users Script
 *
 * Run with: npx tsx scripts/seed-demo-users.ts
 *
 * This creates demo users in Supabase Auth for testing the platform.
 * Triple-click on the logo at the sign-in page to reveal demo accounts.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure .env.local exists with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  // Site Admin
  { email: 'admin@peakone.ai', password: 'Demo123!', firstName: 'Sarah', lastName: 'Chen', org: 'Platform Admin' },

  // Acme Corporation
  { email: 'john.smith@example.com', password: 'Demo123!', firstName: 'John', lastName: 'Smith', org: 'Acme Corp' },
  { email: 'emily.davis@example.com', password: 'Demo123!', firstName: 'Emily', lastName: 'Davis', org: 'Acme Corp' },
  { email: 'michael.wong@example.com', password: 'Demo123!', firstName: 'Michael', lastName: 'Wong', org: 'Acme Corp' },
  { email: 'lisa.patel@example.com', password: 'Demo123!', firstName: 'Lisa', lastName: 'Patel', org: 'Acme Corp' },
  { email: 'david.jones@example.com', password: 'Demo123!', firstName: 'David', lastName: 'Jones', org: 'Acme Corp' },

  // TechStart Inc
  { email: 'alex.rivera@techstart.io', password: 'Demo123!', firstName: 'Alex', lastName: 'Rivera', org: 'TechStart' },
  { email: 'jessica.kim@techstart.io', password: 'Demo123!', firstName: 'Jessica', lastName: 'Kim', org: 'TechStart' },
  { email: 'ryan.thompson@techstart.io', password: 'Demo123!', firstName: 'Ryan', lastName: 'Thompson', org: 'TechStart' },
  { email: 'maria.garcia@techstart.io', password: 'Demo123!', firstName: 'Maria', lastName: 'Garcia', org: 'TechStart' },
  { email: 'kevin.lee@techstart.io', password: 'Demo123!', firstName: 'Kevin', lastName: 'Lee', org: 'TechStart' },

  // Individual Freelancer
  { email: 'freelancer@gmail.com', password: 'Demo123!', firstName: 'Chris', lastName: 'Taylor', org: 'Individual' },
]

async function seedUsers() {
  console.log('Starting to seed demo users...\n')

  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const exists = existingUsers?.users?.find(u => u.email === user.email)

      if (exists) {
        console.log(`✓ User ${user.email} already exists`)
        continue
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          organization: user.org,
        }
      })

      if (error) {
        console.error(`✗ Failed to create ${user.email}: ${error.message}`)
      } else {
        console.log(`✓ Created ${user.firstName} ${user.lastName} (${user.email}) - ${user.org}`)
      }
    } catch (err) {
      console.error(`✗ Error creating ${user.email}:`, err)
    }
  }

  console.log('\nDemo user seeding complete!')
  console.log('\nTo access demo accounts:')
  console.log('1. Go to /sign-in')
  console.log('2. Triple-click on the PeakOne AI logo')
  console.log('3. Click any demo account to auto-login')
}

seedUsers().catch(console.error)
