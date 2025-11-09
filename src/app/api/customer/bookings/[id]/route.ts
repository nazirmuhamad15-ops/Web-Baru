import { NextRequest, NextResponse } from 'next/server'
import { withCustomerRole } from '@/lib/middleware'
import { db } from '@/lib/db'

export const DELETE = withCustomerRole(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const bookingId = params.id

    // Get booking with optimistic locking
    const booking = await db.booking.findFirst({
      where: { 
        id: bookingId, 
        userId: req.user!.userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        dailyCapacity: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or cannot be cancelled' },
        { status: 404 }
      )
    }

    // Cancel booking with optimistic locking
    await db.$transaction(async (tx) => {
      // Get fresh booking
      const freshBooking = await tx.booking.findUnique({
        where: { id: bookingId },
      })

      if (!freshBooking || freshBooking.version !== booking.version) {
        throw new Error('OPTIMISTIC_LOCK_FAILED')
      }

      // Update booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          version: freshBooking.version + 1,
        },
      })

      // Update capacity
      await tx.dailyCapacity.update({
        where: { id: booking.dailyCapacityId },
        data: {
          currentBookings: {
            decrement: booking.numberOfPeople,
          },
        },
      })
    })

    return NextResponse.json({
      message: 'Booking cancelled successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'OPTIMISTIC_LOCK_FAILED') {
      return NextResponse.json(
        { error: 'System busy, please try again' },
        { status: 409 }
      )
    }

    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})