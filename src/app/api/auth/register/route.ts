import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { Role } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Pengguna dengan email ini sudah ada' },
        { status: 409 }
      )
    }

    const user = await createUser(email, password, name, Role.CUSTOMER)
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    })

    return NextResponse.json({
      message: 'Pendaftaran berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Kesalahan server internal' },
      { status: 500 }
    )
  }
}