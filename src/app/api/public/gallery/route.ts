import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const gallery = await db.gallery.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Failed to fetch gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}