const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const TTL_HOURS = parseInt(process.env.TEMP_FILE_TTL_HOURS) || 24;

/**
 * Delete a specific file safely
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`🗑️  Deleted file: ${path.basename(filePath)}`);
    }
  } catch (err) {
    logger.warn(`Failed to delete file ${filePath}: ${err.message}`);
  }
};

/**
 * Delete array of files
 */
const deleteFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) return;
  filePaths.forEach(deleteFile);
};

/**
 * Cleanup files older than TTL
 */
const cleanupOldFiles = () => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return;

    const files = fs.readdirSync(UPLOAD_DIR);
    const now = Date.now();
    const ttlMs = TTL_HOURS * 60 * 60 * 1000;
    let cleaned = 0;

    files.forEach(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      try {
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > ttlMs) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      } catch (err) {
        logger.warn(`Error checking file ${file}: ${err.message}`);
      }
    });

    if (cleaned > 0) {
      logger.info(`🧹 Cleanup: removed ${cleaned} old files from ${UPLOAD_DIR}`);
    }
  } catch (err) {
    logger.error(`Cleanup error: ${err.message}`);
  }
};

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    logger.info(`📁 Created upload directory: ${UPLOAD_DIR}`);
  }
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

module.exports = { deleteFile, deleteFiles, cleanupOldFiles, ensureUploadDir };
