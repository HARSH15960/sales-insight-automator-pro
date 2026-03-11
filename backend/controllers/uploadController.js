const { v4: uuidv4 } = require('uuid');
const { insightQueue } = require('../config/redis');
const logger = require('../utils/logger');

const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No files provided. Upload CSV or XLSX files using the "files" field.'
      });
    }

    const { email } = req.body;
    const userEmail = email || req.user?.email;

    const jobId = `job_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const filePaths = files.map(f => f.path);
    const fileNames = files.map(f => f.originalname);

    logger.info(`📤 Upload received: ${fileNames.join(', ')} | JobId: ${jobId} | User: ${req.user?.email}`);

    // Queue the job
    const job = await insightQueue.add(
      'process-insight',
      {
        jobId,
        filePaths,
        fileNames,
        userEmail,
        uploadedBy: req.user?.id,
        uploadedAt: new Date().toISOString()
      },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 24 * 3600 },
        removeOnFail: { age: 48 * 3600 }
      }
    );

    logger.info(`✅ Job ${jobId} queued successfully`);

    return res.status(202).json({
      message: 'Processing started',
      jobId,
      filesQueued: files.length,
      fileNames,
      status: 'waiting',
      emailNotification: userEmail ? `Report will be sent to ${userEmail}` : 'No email notification (no email provided)',
      statusUrl: `/api/status/${jobId}`,
      estimatedTime: `${files.length * 30}-${files.length * 60} seconds`
    });

  } catch (err) {
    logger.error(`Upload controller error: ${err.message}`);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to queue processing job' });
  }
};

module.exports = { uploadFiles };
