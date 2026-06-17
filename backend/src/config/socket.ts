import { Server as HttpServer } from 'http';

import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

import logger from '../utils/logger';

import env from './env';

export interface SocketUser {
  id: string;
  role: string;
  email: string;
}

let io: Server;
export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL ||
          'https://resturant-managment-system-frontend.vercel.app',
        process.env.CLIENT_URL ||
          'https://resturant-managment-system-frontend.vercel.app',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const parseCookies = (
    cookieHeader: string | undefined
  ): Record<string, string> => {
    const list: Record<string, string> = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift()?.trim();
      if (name) {
        list[name] = decodeURIComponent(parts.join('='));
      }
    });
    return list;
  };

  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers?.cookie);
      const token =
        socket.handshake.auth?.token ||
        cookies['accessToken'] ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication Error: Token missing'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as SocketUser;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Authentication Error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as SocketUser;
    logger.info(`Socket connected: ${socket.id} (User: ${user.id})`);

    // Users join a personal room to receive their order updates
    socket.join(`user_${user.id}`);

    // Allow staff/admin to join restaurant-specific rooms
    if (
      [
        'ADMIN',
        'SUPER_ADMIN',
        'KITCHEN_STAFF',
        'CASHIER',
        'DELIVERY_MANAGER',
      ].includes(user.role)
    ) {
      socket.join('staff_room');
    }

    if (user.role === 'DELIVERY_PARTNER') {
      socket.join(`driver_${user.id}`);
    }

    // Clients can explicitly join a room for a specific order tracking
    socket.on('join_order_room', (orderId: string) => {
      socket.join(`order_${orderId}`);
      logger.info(`User ${user.id} joined tracking room: order_${orderId}`);
    });

    socket.on('leave_order_room', (orderId: string) => {
      socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
