import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import errorHandler from './middleware/errorHandler';
import AppError from './utils/appError';
import logger from './utils/logger';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import catalogRouter from './modules/catalog/catalog.routes';

// Express application instance
export const app = express();

// 1. Global Middleware Pipelines
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve uploaded static avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log HTTP transactions with Winston logger
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

// 2. Health Monitoring Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    message: 'Oven Xpress Core Node API is fully operational',
  });
});

// 3. Modular Feature Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/catalog', catalogRouter);

app.use('/api/v1/tables', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tables module foundation active',
  });
});

// 4. Fallback Catch-All Route
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
