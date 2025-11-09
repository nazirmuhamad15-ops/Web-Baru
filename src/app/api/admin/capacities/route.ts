import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'

const createCapacitySchema = z.object({
  routeId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxCapacity: z.number().min(1),
})

export const GET = withAdminRole(async (req: NextRequest) => {
  try {
    const capacities = await db.dailyCapacity.findMany({
      include: {
        route: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(capacities)
  } catch (error) {
    console.error('Get capacities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = withAdminRole(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { routeId, date, maxCapacity } = createCapacitySchema.parse(body)

    const capacity = await db.dailyCapacity.upsert({
      where: {
        routeId_date: { routeId, date },
      },
      update: {
        maxCapacity,
      },
      create: {
        routeId,
        date,
        maxCapacity,
        currentBookings: 0,
        version: 0,
      },
      include: {
        route: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Capacity set successfully',
      capacity,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create capacity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})