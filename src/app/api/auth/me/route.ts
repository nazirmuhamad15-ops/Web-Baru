import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getUserById } from '@/lib/auth'

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const user = await getUserById(req.user!.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})