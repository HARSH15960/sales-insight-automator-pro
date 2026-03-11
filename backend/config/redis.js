const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

const getRedisConnection = () => {
  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return new IORedis(redisConfig);
};

const connection = getRedisConnection();

// Separate Redis client for context storage (shared via Redis itself)
const contextRedis = getRedisConnection();

connection.on('connect', () => logger.info('✅ Redis connected'));
connection.on('error', (err) => logger.error('❌ Redis error:', err.message));

// Queues
const insightQueue = new Queue('insight-processing', { connection });
const emailQueue = new Queue('email-delivery', { connection });

// Store job context IN REDIS (not in-memory Map)
const setJobContext = async (jobId, context) => {
  try {
    await contextRedis.set(
      `job_context:${jobId}`,
      JSON.stringify({ ...context, createdAt: Date.now() }),
      'EX', 86400 // 24 hour TTL
    );
    logger.info(`💾 Context saved to Redis for job: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to save context: ${err.message}`);
  }
};

const getJobContext = async (jobId) => {
  try {
    const data = await contextRedis.get(`job_context:${jobId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    logger.error(`Failed to get context: ${err.message}`);
    return null;
  }
};

module.exports = {
  connection,
  insightQueue,
  emailQueue,
  setJobContext,
  getJobContext
};