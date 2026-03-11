const { insightQueue } = require('../config/redis');
const logger = require('../utils/logger');

const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Bad Request', message: 'jobId is required' });
    }

    const job = await insightQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Job ${jobId} not found. It may have expired or never existed.`
      });
    }

    const state = await job.getState();
    const progress = job.progress;

    const response = {
      jobId,
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      createdAt: new Date(job.timestamp).toISOString(),
      processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    };

    if (state === 'completed') {
      response.result = job.returnvalue;
    }

    if (state === 'failed') {
      response.error = job.failedReason;
      response.attemptsMade = job.attemptsMade;
    }

    if (state === 'active') {
      response.message = 'AI is analyzing your data...';
    }

    if (state === 'waiting' || state === 'delayed') {
      response.message = 'Job is queued and will begin processing shortly';
    }

    return res.json(response);

  } catch (err) {
    logger.error(`Status check error: ${err.message}`);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve job status' });
  }
};

module.exports = { getJobStatus };
