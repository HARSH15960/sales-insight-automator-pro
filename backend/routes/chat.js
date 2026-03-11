const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with AI about your sales data
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *           examples:
 *             regionQuery:
 *               summary: Ask about regions
 *               value:
 *                 message: Which region sold the most?
 *                 jobId: job_abc123
 *             trendQuery:
 *               summary: Predict trend
 *               value:
 *                 message: What does the next quarter look like based on current trends?
 *                 jobId: job_abc123
 *             compareQuery:
 *               summary: Compare categories
 *               value:
 *                 message: Compare performance of Electronics vs Clothing categories
 *                 jobId: job_abc123
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Job context not found
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/', authenticate, chatLimiter, chat);

module.exports = router;
