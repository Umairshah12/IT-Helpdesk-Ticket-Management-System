import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/apiResponse';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static File Uploads
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  ApiResponse.error(res, `Route [${req.method}] ${req.originalUrl} not found`, 'NOT_FOUND', undefined, 404);
});

// Centralized Error Handling
app.use(errorHandler);

export default app;

