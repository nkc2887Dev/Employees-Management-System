import express, { Application } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';
import { notFound } from './middlewares/notFound.middleware';
import Routes from './routes/index.routes';

config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', Routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
