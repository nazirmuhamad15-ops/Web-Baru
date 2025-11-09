import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(),
  difficulty: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const PUT = withAdminRole(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    console.log('PUT request received:', { id: params.id, body })
    
    const updateData = updateRouteSchema.parse(body)
    console.log('Parsed update data:', updateData)
    
    // Specifically check if isActive is being updated
    if ('isActive' in updateData) {
      console.log('Status update detected - isActive:', updateData.isActive)
    }

    const updatedRoute = await db.route.update({
      where: { id: params.id },
      data: updateData,
    })

    console.log('Route updated successfully:', updatedRoute)

    return NextResponse.json({
      message: updateData.isActive !== undefined 
        ? `Rute berhasil ${updateData.isActive ? 'diaktifkan' : 'dinonaktifkan'}`
        : 'Rute berhasil diperbarui',
      route: updatedRoute,
    })
  } catch (error) {
    console.error('Update route error:', error)
    
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error.errors)
      return NextResponse.json(
        { error: 'Input tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Kesalahan server internal' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminRole(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Check if route has existing bookings
    const existingBookings = await db.booking.findFirst({
      where: { routeId: params.id },
    })

    if (existingBookings) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus rute yang memiliki pemesanan aktif. Nonaktifkan rute sebagai gantinya.' },
        { status: 400 }
      )
    }

    // Delete related daily capacities first
    await db.dailyCapacity.deleteMany({
      where: { routeId: params.id },
    })

    // Delete the route
    await db.route.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Rute berhasil dihapus secara permanen',
    })
  } catch (error) {
    console.error('Delete route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})