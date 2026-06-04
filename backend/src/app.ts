import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import errorHandler from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import AppError from './utils/appError';
import logger from './utils/logger';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import catalogRouter from './modules/catalog/catalog.routes';
import cartRouter from './modules/cart/cart.routes';
import addressRouter from './modules/addresses/addresses.routes';
import couponRouter from './modules/coupons/coupons.routes';
import paymentsRouter from './modules/payments/payments.routes';
import ordersRouter from './modules/orders/orders.routes';
import refundsRouter from './modules/refunds/refunds.routes';
import kitchenRouter from './modules/kitchen/kitchen.routes';
import deliveryRouter from './modules/delivery/delivery.routes';
import inventoryRouter from './modules/inventory/inventory.routes';
import posRouter from './modules/pos/pos.routes';
import reservationRouter from './modules/reservations/reservation.routes';
import tableRouter from './modules/tables/table.routes';
import waitlistRouter from './modules/waitlist/waitlist.routes';
import qrRouter from './modules/qr-ordering/qr.routes';
import adminRouter from './modules/admin/admin.routes';
import superAdminRouter from './modules/super-admin/superadmin.routes';
import notificationRouter from './modules/notifications/notification.routes';
import healthRouter from './routes/health.routes';

// Express application instance
export const app = express();

// 1. Global Middleware Pipelines
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL || 'https://resturant-managment-system-frontend.vercel.app'
    ],
    credentials: true,
  }),
);
app.use(apiRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Serve uploaded static avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log HTTP transactions with Winston logger
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

// 2. Health Monitoring Route
app.use('/health', healthRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/health', healthRouter);

// 3. Modular Feature Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/refunds', refundsRouter);
app.use('/api/v1/kitchen', kitchenRouter);
app.use('/api/v1/delivery', deliveryRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/pos', posRouter);
app.use('/api/v1/reservations', reservationRouter);
app.use('/api/v1/tables', tableRouter);
app.use('/api/v1/waitlist', waitlistRouter);
app.use('/api/v1/qr-ordering', qrRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/super-admin', superAdminRouter);
app.use('/api/v1/notifications', notificationRouter);

// 4. Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running all good!',
  });
});

// 5. Fallback Catch-All Route
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Resource not found. The route ${req.originalUrl} does not exist on this server.`,
      404,
    ),
  );
});

// 5. Global Exception Handler
app.use(errorHandler);

export default app;
