import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    // Create sample bookings for testing
    const users = await db.user.findMany({
      where: { role: 'CUSTOMER' },
    })
    
    const routes = await db.route.findMany({
      where: { isActive: true },
    })

    if (users.length === 0 || routes.length === 0) {
      return NextResponse.json(
        { error: 'No users or routes found' },
        { status: 404 }
      )
    }

    // Create sample bookings
    const sampleBookings = []
    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomRoute = routes[Math.floor(Math.random() * routes.length)]
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30) + 1)
      const dateStr = randomDate.toISOString().split('T')[0]

      // Find or create daily capacity
      let dailyCapacity = await db.dailyCapacity.findUnique({
        where: { routeId_date: { routeId: randomRoute.id, date: dateStr } },
      })

      if (!dailyCapacity) {
        dailyCapacity = await db.dailyCapacity.create({
          data: {
            routeId: randomRoute.id,
            date: dateStr,
            maxCapacity: 50,
            currentBookings: 0,
            version: 0,
          },
        })
      }

      // Create booking
      const numberOfPeople = Math.floor(Math.random() * 5) + 1
      const booking = await db.booking.create({
        data: {
          userId: randomUser.id,
          routeId: randomRoute.id,
          dailyCapacityId: dailyCapacity.id,
          bookingDate: dateStr,
          numberOfPeople,
          totalPrice: randomRoute.price * numberOfPeople,
          status: ['PENDING', 'CONFIRMED', 'COMPLETED'][Math.floor(Math.random() * 3)],
          paymentStatus: ['PENDING', 'PAID'][Math.floor(Math.random() * 2)],
          notes: `Sample booking ${i + 1}`,
          version: 0,
        },
      })

      // Update capacity
      await db.dailyCapacity.update({
        where: { id: dailyCapacity.id },
        data: {
          currentBookings: dailyCapacity.currentBookings + numberOfPeople,
        },
      })

      sampleBookings.push(booking)
    }

    return NextResponse.json({
      message: 'Sample bookings created successfully',
      bookings: sampleBookings.length,
    })
  } catch (error) {
    console.error('Create sample bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}