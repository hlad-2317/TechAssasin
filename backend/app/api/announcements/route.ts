import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, AuthenticationError, AuthorizationError } from '@/lib/middleware/auth'
import { announcementCreateSchema } from '@/lib/validations/announcement'
import { ZodError } from 'zod'

/**
 * GET /api/announcements
 * List announcements with pagination
 * Includes author profile information (username, avatar_url)
 * Orders by created_at DESC
 * Requirements: 7.6, 7.7, 7.8, 13.3
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    await requireAuth()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 50' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      throw new Error(`Failed to count announcements: ${countError.message}`)
    }
    
    // Fetch announcements with author profile information
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        author:profiles!announcements_author_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw new Error(`Failed to fetch announcements: ${error.message}`)
    }
    
    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    console.error('GET /api/announcements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/announcements
 * Create a new announcement (admin only)
 * Requirements: 7.1, 7.2, 7.5
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Verify admin privileges
    await requireAdmin(user.id)
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = announcementCreateSchema.parse(body)
    
    // Create announcement in database
    const supabase = await createClient()
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        author_id: user.id,
        content: validatedData.content
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        author:profiles!announcements_author_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .single()
    
    if (error) {
      throw new Error(`Failed to create announcement: ${error.message}`)
    }
    
    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    console.error('POST /api/announcements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
