const express = require('express');
const router = express.Router();
const { getJobStatus } = require('../controllers/statusController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/status/{jobId}:
 *   get:
 *     summary: Get job processing status
 *     tags: [Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID returned from upload endpoint
 *         example: job_abc123def456
 *     responses:
 *       200:
 *         description: Job status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobStatus'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:jobId', authenticate, getJobStatus);

module.exports = router;
