import { createClient } from '@supabase/supabase-js'

// Test database helper
export function getTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.local'
    )
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  return !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseKey !== 'your_supabase_service_role_key'
  )
}

// Helper to generate unique test data
export function generateTestId() {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`
}
