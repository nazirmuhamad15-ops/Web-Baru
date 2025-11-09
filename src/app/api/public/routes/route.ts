import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const routes = await db.route.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error('Failed to fetch routes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    )
  }
}