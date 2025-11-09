import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'

const createRouteSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  duration: z.number().min(1),
  difficulty: z.string().optional(),
})

export const GET = withAdminRole(async (req: NextRequest) => {
  try {
    const routes = await db.route.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error('Get routes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = withAdminRole(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, description, price, duration, difficulty } = createRouteSchema.parse(body)

    const route = await db.route.create({
      data: {
        name,
        description,
        price,
        duration,
        difficulty,
      },
    })

    return NextResponse.json({
      message: 'Route created successfully',
      route,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})