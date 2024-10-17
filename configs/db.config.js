// Set up a Mongoose connection

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
dotenv.config();

let mongoServer;
const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      // mongoServer = await MongoMemoryServer.create();
      // const mongoUri = mongoServer.getUri();
      // await mongoose.connect(mongoUri);

      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);

      console.log('In-Memory MongoDB connected');
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    if (process.env.NODE_ENV === 'test' && mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection failed:', error.message);
  }
};

export { connectDB, disconnectDB };
