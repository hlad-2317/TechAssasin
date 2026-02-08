import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/middleware/auth'
import { profileUpdateSchema } from '@/lib/validations/profile'
import { handleApiError, NotFoundError, ConflictError, AuthorizationError } from '@/lib/errors'
import type { Profile } from '@/types/database'

/**
 * GET /api/profile
 * Get current user's profile with all fields
 * Requirements: 3.5
 */
export async function GET() {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Get Supabase client
    const supabase = await createClient()
    
    // Fetch user's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }
    
    if (!profile) {
      throw new NotFoundError('Profile not found')
    }
    
    return NextResponse.json(profile as Profile)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 * Validates input with profileUpdateSchema
 * Checks username uniqueness
 * Prevents is_admin modification
 * Requirements: 3.1, 3.2, 3.4, 3.7
 */
export async function PATCH(request: Request) {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Parse and validate request body
    const body = await request.json()
    
    // Validate input with Zod schema
    const validatedData = profileUpdateSchema.parse(body)
    
    // Prevent is_admin modification
    if ('is_admin' in body) {
      throw new AuthorizationError('Cannot modify admin status')
    }
    
    // Get Supabase client
    const supabase = await createClient()
    
    // If username is being updated, check uniqueness
    if (validatedData.username) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', validatedData.username)
        .neq('id', user.id)
        .single()
      
      if (existingProfile) {
        throw new ConflictError('Username already taken')
      }
    }
    
    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }
    
    return NextResponse.json(updatedProfile as Profile)
  } catch (error) {
    return handleApiError(error)
  }
}
