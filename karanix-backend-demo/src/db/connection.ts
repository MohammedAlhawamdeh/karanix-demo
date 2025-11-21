import mongoose from 'mongoose';
import { config } from '../config';

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(config.mongoUri);
};

export const disconnectDb = async () => mongoose.connection.close();
