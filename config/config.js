import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongodb_uri: process.env.MONGODB_URI || '',
}