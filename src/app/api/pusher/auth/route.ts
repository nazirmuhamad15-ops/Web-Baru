import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: NextRequest) {
  try {
    const { socket_id, channel_name } = await req.json()

    // For private channels, you can add authentication logic here
    // For now, we'll allow all authenticated requests
    // You can check for Clerk authentication here if needed
    
    const auth = pusherServer.authorizeChannel(socket_id, channel_name)
    
    return NextResponse.json(auth)
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 403 }
    )
  }
}

