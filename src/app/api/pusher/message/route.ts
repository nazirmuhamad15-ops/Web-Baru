import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

const CHANNEL_NAME = 'presence-demo-channel'
const EVENT_NAME = 'message'

export async function POST(req: NextRequest) {
  try {
    const message = await req.json()

    // Broadcast message to all subscribers of the channel
    await pusherServer.trigger(CHANNEL_NAME, EVENT_NAME, message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pusher message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

