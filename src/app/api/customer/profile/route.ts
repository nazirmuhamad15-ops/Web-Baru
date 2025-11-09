import { NextRequest, NextResponse } from 'next/server'
import { withCustomerRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
})

export const PUT = withCustomerRole(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, phone } = updateProfileSchema.parse(body)

    const updatedUser = await db.user.update({
      where: { id: req.user!.userId },
      data: {
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})