import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await authenticateUser(email, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    })

    return NextResponse.json({
      message: 'Login berhasil',
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

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Kesalahan server internal' },
      { status: 500 }
    )
  }
}