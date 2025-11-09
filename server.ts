// server.ts - Next.js Standalone + Socket.IO (Development only)
// Note: This custom server is only used for local development.
// On Vercel, Next.js runs as serverless functions and Pusher is used for real-time features.

import { createServer } from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const isVercel = process.env.VERCEL === '1';
const currentPort = parseInt(process.env.PORT || '8080', 10);
const hostname = '0.0.0.0';

// Only setup Socket.IO in development and when not on Vercel
let setupSocketIO = false;
if (dev && !isVercel) {
  try {
    const { setupSocket } = require('@/lib/socket');
    const { Server } = require('socket.io');
    setupSocketIO = true;
  } catch (err) {
    console.warn('Socket.IO not available, using Pusher for real-time features');
  }
}

// Custom server with optional Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler (only in dev)
      if (setupSocketIO && req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO only in development (not on Vercel)
    if (setupSocketIO) {
      const { setupSocket } = require('@/lib/socket');
      const { Server } = require('socket.io');
      
      const io = new Server(server, {
        path: '/api/socketio',
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      setupSocket(io);
      console.log(`> Socket.IO server enabled for local development`);
    } else {
      console.log(`> Using Pusher for real-time features (production/serverless mode)`);
    }

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      if (setupSocketIO) {
        console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
      }
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
