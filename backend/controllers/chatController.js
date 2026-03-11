const { getJobContext } = require('../config/redis');
const { answerChatQuery } = require('../services/groqService');
const logger = require('../utils/logger');

const chat = async (req, res) => {
  try {
    const { message, jobId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Message is required' });
    }

    if (!jobId) {
      return res.status(400).json({ error: 'Bad Request', message: 'jobId is required' });
    }

    // Now async — reads from Redis
    const context = await getJobContext(jobId);
    
    if (!context) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No analysis context found for job ${jobId}. Please upload a file first.`
      });
    }

    logger.info(`💬 Chat query from ${req.user?.email}: "${message}" for job ${jobId}`);

    const reply = await answerChatQuery(message, context);

    return res.json({
      reply,
      jobId,
      timestamp: new Date().toISOString(),
      query: message
    });

  } catch (err) {
    logger.error(`Chat controller error: ${err.message}`);
    return res.status(500).json({
      error: 'AI Service Error',
      message: err.message || 'Failed to process chat query'
    });
  }
};

module.exports = { chat };
