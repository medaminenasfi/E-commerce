import { createClient } from 'redis';

const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    console.log('💡 Make sure Redis is running on localhost:6379');
    console.log('💡 You can start Redis with: docker run -d -p 6379:6379 redis:7-alpine');
    // Don't exit process, let the app continue without Redis for now
    console.log('⚠️ Continuing without Redis (some features may not work)');
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      console.log('✅ Redis disconnected successfully');
    }
  } catch (error) {
    console.error('❌ Redis disconnection error:', error);
  }
};
