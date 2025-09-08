import mongoose from 'mongoose';
import { redisClient } from '../src/config/redis';

// Set test environment
process.env['NODE_ENV'] = 'test';

beforeAll(async () => {
  // Connect to test database
  const testMongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/shop-backend-test';
  
  try {
    await mongoose.connect(testMongoUri);
    await redisClient.connect();
    console.log('✅ Test databases connected');
  } catch (error) {
    console.error('❌ Failed to connect to test databases:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Disconnect from test database
  try {
    await mongoose.disconnect();
    await redisClient.disconnect();
    console.log('✅ Test databases disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from test databases:', error);
  }
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Clear Redis cache
  await redisClient.flushDb();
});

// Mock console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
