import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import config from './config/config.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Connect to MongoDB
mongoose.connect(config.mongodb_uri)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const port = config.port;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;