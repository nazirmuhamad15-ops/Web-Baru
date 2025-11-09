import { NextRequest, NextResponse } from 'next/server'
import { withCustomerRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createBookingSchema = z.object({
  routeId: z.string(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numberOfPeople: z.number().min(1).max(8),
  notes: z.string().optional(),
})

export const POST = withCustomerRole(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { routeId, bookingDate, numberOfPeople, notes } = createBookingSchema.parse(body)

    // Get route details
    const route = await db.route.findUnique({
      where: { id: routeId, isActive: true },
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    // Find or create daily capacity
    let dailyCapacity = await db.dailyCapacity.findUnique({
      where: { routeId_date: { routeId, date: bookingDate } },
    })

    if (!dailyCapacity) {
      // Create default capacity for new dates
      dailyCapacity = await db.dailyCapacity.create({
        data: {
          routeId,
          date: bookingDate,
          maxCapacity: 50, // Default capacity
          currentBookings: 0,
          version: 0,
        },
      })
    }

    // Check availability with optimistic locking
    const availableSlots = dailyCapacity.maxCapacity - dailyCapacity.currentBookings
    if (availableSlots < numberOfPeople) {
      return NextResponse.json(
        { error: 'Not enough available slots for this date' },
        { status: 409 }
      )
    }

    // Create booking with optimistic locking
    const totalPrice = route.price * numberOfPeople
    
    try {
      const result = await db.$transaction(async (tx) => {
        // Get fresh capacity with version
        const freshCapacity = await tx.dailyCapacity.findUnique({
          where: { id: dailyCapacity!.id },
        })

        if (!freshCapacity || freshCapacity.version !== dailyCapacity!.version) {
          throw new Error('OPTIMISTIC_LOCK_FAILED')
        }

        if (freshCapacity.currentBookings + numberOfPeople > freshCapacity.maxCapacity) {
          throw new Error('CAPACITY_EXCEEDED')
        }

        // Update capacity
        const updatedCapacity = await tx.dailyCapacity.update({
          where: { id: freshCapacity.id },
          data: {
            currentBookings: freshCapacity.currentBookings + numberOfPeople,
            version: freshCapacity.version + 1,
          },
        })

        // Create booking
        const booking = await tx.booking.create({
          data: {
            userId: req.user!.userId,
            routeId,
            dailyCapacityId: updatedCapacity.id,
            bookingDate,
            numberOfPeople,
            totalPrice,
            notes,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            version: 0,
          },
          include: {
            route: {
              select: {
                name: true,
                duration: true,
                price: true,
              },
            },
          },
        })

        return booking
      })

      // Send confirmation email (simulated)
      await sendConfirmationEmail(result)

      return NextResponse.json({
        message: 'Booking created successfully',
        booking: result,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'OPTIMISTIC_LOCK_FAILED') {
          return NextResponse.json(
            { error: 'System busy, please try again' },
            { status: 409 }
          )
        }
        if (error.message === 'CAPACITY_EXCEEDED') {
          return NextResponse.json(
            { error: 'Not enough available slots for this date' },
            { status: 409 }
          )
        }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const GET = withCustomerRole(async (req: NextRequest) => {
  try {
    const bookings = await db.booking.findMany({
      where: { userId: req.user!.userId },
      include: {
        route: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

type BookingWithRoute = Prisma.BookingGetPayload<{
  include: {
    route: {
      select: {
        name: true
        duration: true
        price: true
      }
    }
  }
}>

async function sendConfirmationEmail(booking: BookingWithRoute) {
  // Simulate email sending
  console.log('Sending confirmation email for booking:', booking.id)
  // In a real implementation, this would use nodemailer or similar
}