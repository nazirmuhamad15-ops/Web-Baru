import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'

export const GET = withAdminRole(async (req: NextRequest) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})