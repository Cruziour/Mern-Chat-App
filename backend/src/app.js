import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Config CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Common Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// import routes
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';

// routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/message', messageRoutes);

// Import Error Middleware
import errorHandler from './middlewares/error.middleware.js';

// Error Handling Middleware
app.use(errorHandler);

export default app;
