const express = require('express');
const router = express.Router();
const { uploadFiles } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload sales CSV/XLSX files for AI analysis
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: CSV or XLSX files (max 5, each max 10MB)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to receive the insight report
 *     responses:
 *       202:
 *         description: Processing started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file or bad request
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  authenticate,
  uploadLimiter,
  upload.array('files', 5),
  uploadFiles
);

module.exports = router;
