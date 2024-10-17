import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import config from './configs/config.js';
import dotenv from 'dotenv';
import { connectDB } from './configs/db.config.js';

import errorHandlerMiddleware from './middlewares/errorHandler.js';
import userRoutes from './routes/user.routes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/users', userRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Connect to MongoDB
connectDB();

// Error handler middleware
app.use(errorHandlerMiddleware);

// Start the server
const port = config.port;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;