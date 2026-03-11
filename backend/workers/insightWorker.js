require('dotenv').config();
const { Worker } = require('bullmq');
const { connection, setJobContext } = require('../config/redis');
const { parseFile, analyzeData } = require('../utils/fileParser');
const { generateInsights } = require('../services/groqService');
const { generateAllCharts } = require('../services/chartService');
const { sendInsightReport } = require('../services/emailService');
const { deleteFiles } = require('../utils/cleanup');
const logger = require('../utils/logger');

logger.info('🔧 Insight Worker starting...');

const insightWorker = new Worker('insight-processing', async (job) => {
  const { filePaths, fileNames, userEmail, jobId } = job.data;

  logger.info(`🔄 Processing job ${jobId} | Files: ${fileNames.join(', ')}`);

  try {
    // Step 1: Parse all files
    await job.updateProgress(10);
    logger.info(`[${jobId}] Step 1/5: Parsing files...`);

    const allRows = [];
    for (const filePath of filePaths) {
      try {
        const rows = parseFile(filePath);
        allRows.push(...rows);
      } catch (err) {
        logger.warn(`[${jobId}] Failed to parse ${filePath}: ${err.message}`);
      }
    }

    if (allRows.length === 0) {
      throw new Error('No valid data found in uploaded files');
    }

    logger.info(`[${jobId}] Total rows parsed: ${allRows.length}`);

    // Step 2: Analyze data
    await job.updateProgress(25);
    logger.info(`[${jobId}] Step 2/5: Analyzing data patterns...`);
    const analysis = analyzeData(allRows);

    // Step 3: Generate AI insights via Groq
    await job.updateProgress(45);
    logger.info(`[${jobId}] Step 3/5: Generating AI insights via Groq...`);
    const combinedFileName = fileNames.join(' + ');
    const insights = await generateInsights(analysis, combinedFileName);

    // Step 4: Generate charts
    await job.updateProgress(65);
    logger.info(`[${jobId}] Step 4/5: Generating charts...`);
    const charts = await generateAllCharts(analysis);

    // Step 5: Send email report
    await job.updateProgress(80);
    logger.info(`[${jobId}] Step 5/5: Sending email report to ${userEmail}...`);

    if (userEmail) {
      await sendInsightReport({
        to: userEmail,
        insights,
        analysis,
        fileNames,
        charts
      });
    }

    // Store context for chat feature
    await setJobContext(jobId, { analysis, insights, fileNames });
    // Cleanup temp files
   await job.updateProgress(95);
// Cleanup after small delay
setTimeout(() => {
  deleteFiles(charts.map(c => c.path));
}, 3000);

    await job.updateProgress(100);

   const result = {
  jobId,
  status: 'completed',
  summary: {
    filesProcessed: filePaths.length,
    rowsAnalyzed: allRows.length,
    emailSent: !!userEmail,
    chartsGenerated: charts.length,
    healthScore: insights.overallHealthScore?.score,
    healthLabel: insights.overallHealthScore?.label,
    topRegion: analysis.summary?.topRegion,
    totalRevenue: analysis.summary?.totalRevenue
  },
  insights: {
    executiveSummary:        insights.executiveSummary,
    topPerformingRegion:     insights.topPerformingRegion,
    worstPerformingCategory: insights.worstPerformingCategory,
    cancellationAnalysis:    insights.cancellationAnalysis,
    revenueTrend:            insights.revenueTrend,
    riskAlerts:              insights.riskAlerts,
    recommendations:         insights.recommendations,
    predictedNextTrend:      insights.predictedNextTrend,
    overallHealthScore:      insights.overallHealthScore
  }
};
    logger.info(`✅ Job ${jobId} completed successfully`);
    return result;

  } catch (err) {
    logger.error(`❌ Job ${jobId} failed: ${err.message}`);
    // Cleanup on failure
    try { deleteFiles(filePaths); } catch (e) {}
    throw err;
  }

}, {
  connection,
  concurrency: 3,
  limiter: { max: 10, duration: 60000 }
});

insightWorker.on('completed', (job, result) => {
  logger.info(`✅ Worker completed job ${job.id}`);
});

insightWorker.on('failed', (job, err) => {
  logger.error(`❌ Worker failed job ${job.id}: ${err.message}`);
});

insightWorker.on('progress', (job, progress) => {
  logger.info(`📈 Job ${job.id} progress: ${progress}%`);
});

insightWorker.on('error', (err) => {
  logger.error(`Worker error: ${err.message}`);
});

logger.info('✅ Insight Worker running and listening for jobs...');

module.exports = insightWorker;
