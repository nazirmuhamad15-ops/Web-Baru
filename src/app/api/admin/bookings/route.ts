import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'

export const GET = withAdminRole(async (req: NextRequest) => {
  try {
    const bookings = await db.booking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        route: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})