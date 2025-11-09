import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'
import { Role } from '@prisma/client'

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
})

export const PUT = withAdminRole(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { isActive, role } = updateUserSchema.parse(body)

    // Prevent super admin from being deactivated by admin
    if (req.user!.role === 'ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify super admin accounts' },
        { status: 403 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        isActive,
        ...(role && { role: role as Role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})