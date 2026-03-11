const Groq = require('groq-sdk');
const logger = require('../utils/logger');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Generate comprehensive executive insights from analyzed data
 */
const generateInsights = async (analysis, fileName) => {
  logger.info(`🧠 Generating AI insights for: ${fileName}`);

  const { summary, totalRows, detectedFields } = analysis;

  const dataContext = JSON.stringify({
    fileName,
    totalRecords: totalRows,
    totalRevenue: summary.totalRevenue?.toFixed(2),
    avgRevenue: summary.avgRevenue?.toFixed(2),
    topRegion: summary.topRegion,
    worstRegion: summary.worstRegion,
    topCategory: summary.topCategory,
    worstCategory: summary.worstCategory,
    cancellationRate: summary.cancellationRate,
    cancellationCount: summary.cancellationCount,
    regionBreakdown: summary.regionBreakdown
      ? Object.entries(summary.regionBreakdown).slice(0, 5).map(([k, v]) => `${k}: $${v.toFixed(2)}`)
      : [],
    categoryBreakdown: summary.categoryBreakdown
      ? Object.entries(summary.categoryBreakdown).slice(0, 5).map(([k, v]) => `${k}: $${v.toFixed(2)}`)
      : [],
    revenueTrend: summary.dateTrend
      ? Object.entries(summary.dateTrend).slice(0, 12).map(([k, v]) => `${k}: $${v.toFixed(2)}`)
      : []
  }, null, 2);

  const prompt = `You are a Senior Business Intelligence Analyst generating an executive-level sales performance report.

SALES DATA SUMMARY:
${dataContext}

Generate a comprehensive insight report with the following EXACT sections. Be specific with numbers, be direct, and use professional business language.

Return a JSON object with these exact keys:

{
  "executiveSummary": "2-3 sentence high-level overview of overall performance with specific revenue figures",
  "topPerformingRegion": {
    "region": "region name",
    "revenue": "formatted revenue",
    "analysis": "2 sentences on why this region is leading and what is driving performance"
  },
  "worstPerformingCategory": {
    "category": "category name",
    "revenue": "formatted revenue",
    "analysis": "2 sentences on underperformance causes and what needs attention"
  },
  "cancellationAnalysis": {
    "rate": "percentage",
    "risk": "LOW | MEDIUM | HIGH",
    "analysis": "2 sentences on cancellation patterns and impact on revenue"
  },
  "revenueTrend": {
    "direction": "UPWARD | DOWNWARD | STABLE | VOLATILE",
    "analysis": "2 sentences describing the trend pattern observed in the data"
  },
  "riskAlerts": [
    "Specific risk alert with numbers",
    "Another specific risk alert",
    "Third risk if applicable"
  ],
  "recommendations": [
    "Actionable recommendation 1 with specific target",
    "Actionable recommendation 2 with specific target",
    "Actionable recommendation 3 with specific target",
    "Actionable recommendation 4 with specific target"
  ],
  "predictedNextTrend": "1-2 sentences on what business trajectory looks like based on current data patterns",
  "overallHealthScore": {
    "score": 75,
    "label": "GOOD | FAIR | AT RISK | CRITICAL",
    "rationale": "One sentence explaining the score"
  }
}

Return ONLY valid JSON. No markdown, no explanation, no extra text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2500
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    logger.info(`Raw Groq response: ${raw.substring(0, 200)}`);

    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let insights = {};

    try {
      insights = JSON.parse(cleaned);
      logger.info(`Groq fields received: ${Object.keys(insights).join(', ')}`);
    } catch (parseErr) {
      logger.error(`JSON parse failed: ${parseErr.message}`);
      logger.error(`Raw was: ${cleaned.substring(0, 500)}`);
      return getFallbackInsights(summary, fileName);
    }

    const fallback = getFallbackInsights(summary, fileName);

    const mergeRegion = (groqVal, fallbackVal) => {
      if (!groqVal) return fallbackVal;
      return {
        region:   groqVal.region   || fallbackVal.region,
        revenue:  groqVal.revenue  || fallbackVal.revenue,
        analysis: groqVal.analysis || fallbackVal.analysis,
      };
    };

    const mergeCategory = (groqVal, fallbackVal) => {
      if (!groqVal) return fallbackVal;
      return {
        category: groqVal.category || fallbackVal.category,
        revenue:  groqVal.revenue  || fallbackVal.revenue,
        analysis: groqVal.analysis || fallbackVal.analysis,
      };
    };

    const mergeCancellation = (groqVal, fallbackVal) => {
      if (!groqVal) return fallbackVal;
      return {
        rate:     groqVal.rate     || fallbackVal.rate,
        risk:     groqVal.risk     || fallbackVal.risk,
        analysis: groqVal.analysis || fallbackVal.analysis,
      };
    };

    const mergeTrend = (groqVal, fallbackVal) => {
      if (!groqVal) return fallbackVal;
      return {
        direction: groqVal.direction || fallbackVal.direction,
        analysis:  groqVal.analysis  || fallbackVal.analysis,
      };
    };

    const mergeHealthScore = (groqVal, fallbackVal) => {
      if (!groqVal) return fallbackVal;
      return {
        score:     groqVal.score     || fallbackVal.score,
        label:     groqVal.label     || fallbackVal.label,
        rationale: groqVal.rationale || fallbackVal.rationale,
      };
    };

    const merged = {
      executiveSummary:        insights.executiveSummary || fallback.executiveSummary,
      topPerformingRegion:     mergeRegion(insights.topPerformingRegion, fallback.topPerformingRegion),
      worstPerformingCategory: mergeCategory(insights.worstPerformingCategory, fallback.worstPerformingCategory),
      cancellationAnalysis:    mergeCancellation(insights.cancellationAnalysis, fallback.cancellationAnalysis),
      revenueTrend:            mergeTrend(insights.revenueTrend, fallback.revenueTrend),
      riskAlerts:              (insights.riskAlerts?.length > 0 ? insights.riskAlerts : fallback.riskAlerts),
      recommendations:         (insights.recommendations?.length > 0 ? insights.recommendations : fallback.recommendations),
      predictedNextTrend:      insights.predictedNextTrend || fallback.predictedNextTrend,
      overallHealthScore:      mergeHealthScore(insights.overallHealthScore, fallback.overallHealthScore),
    };

    logger.info(`✅ topRegion: ${merged.topPerformingRegion?.region}`);
    logger.info(`✅ worstCategory: ${merged.worstPerformingCategory?.category}`);
    logger.info(`✅ trend: ${merged.revenueTrend?.direction}`);
    logger.info(`✅ cancellation: ${merged.cancellationAnalysis?.rate}`);

    return merged;

  } catch (err) {
    logger.error(`Groq insight generation failed: ${err.message}`);
    return getFallbackInsights(summary, fileName);
  }
}; // ← CLOSING BRACE JO PEHLE MISSING THI

/**
 * Handle conversational queries about the data
 */
const answerChatQuery = async (message, context) => {
  logger.info(`💬 Chat query: "${message}"`);

  const contextStr = JSON.stringify(context.analysis?.summary || context, null, 2);

  const prompt = `You are an AI business analyst assistant. A user has uploaded sales data and is asking questions about it.

SALES DATA CONTEXT:
${contextStr}

PREVIOUS INSIGHTS:
${JSON.stringify(context.insights || {}, null, 2)}

USER QUESTION: "${message}"

Instructions:
- Answer DIRECTLY and CONCISELY (2-4 sentences max)
- Use specific numbers from the data
- If predicting trends, base it on actual patterns in the data
- If comparing categories/regions, give precise figures
- Be confident and professional
- If data does not support the question, say what you CAN determine from the data`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.4,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || 'Unable to generate a response. Please try again.';
  } catch (err) {
    logger.error(`Groq chat failed: ${err.message}`);
    throw new Error('AI chat service temporarily unavailable');
  }
};

// Fallback if Groq fails or returns incomplete data
const getFallbackInsights = (summary, fileName) => ({
  executiveSummary: `Analysis of ${fileName} complete. Total revenue: $${(summary.totalRevenue || 0).toFixed(2)} across ${summary.regionBreakdown ? Object.keys(summary.regionBreakdown).length : 'multiple'} regions.`,
  topPerformingRegion: {
    region: summary.topRegion || 'N/A',
    revenue: `$${(summary.regionBreakdown?.[summary.topRegion] || 0).toFixed(2)}`,
    analysis: 'This region shows the strongest revenue contribution in the dataset. Focus here to maximize ROI.'
  },
  worstPerformingCategory: {
    category: summary.worstCategory || 'N/A',
    revenue: `$${(summary.categoryBreakdown?.[summary.worstCategory] || 0).toFixed(2)}`,
    analysis: 'This category requires immediate attention and strategic review. Investigate root causes of underperformance.'
  },
  cancellationAnalysis: {
    rate: `${summary.cancellationRate || 0}%`,
    risk: parseFloat(summary.cancellationRate || 0) > 15 ? 'HIGH'
        : parseFloat(summary.cancellationRate || 0) > 8  ? 'MEDIUM'
        : 'LOW',
    analysis: `Cancellation rate of ${summary.cancellationRate || 0}% detected. Review customer feedback and fulfillment processes to reduce churn.`
  },
  revenueTrend: {
    direction: 'VOLATILE',
    analysis: 'Revenue shows fluctuation across time periods. A consistent growth strategy and demand forecasting are recommended.'
  },
  riskAlerts: [
    `⚠️ Cancellation rate at ${summary.cancellationRate || 0}% — revenue at risk`,
    `📉 Underperforming category: ${summary.worstCategory || 'N/A'} needs urgent review`,
    `🔻 Weakest region: ${summary.worstRegion || 'N/A'} requires targeted strategy`
  ],
  recommendations: [
    `Double down on ${summary.topRegion || 'top region'} — highest ROI opportunity`,
    `Launch recovery plan for ${summary.worstCategory || 'worst category'} within 30 days`,
    'Implement customer retention program to cut cancellation rate by 5%',
    'Run monthly performance reviews on bottom 20% of segments'
  ],
  predictedNextTrend: `Based on current patterns, ${summary.topRegion || 'leading region'} will continue to outperform. Immediate action on ${summary.worstCategory || 'underperforming category'} is critical to sustain overall growth.`,
  overallHealthScore: {
    score: 65,
    label: 'FAIR',
    rationale: 'Strong top performers but concerning cancellation rate and category imbalance require attention.'
  }
});

module.exports = { generateInsights, answerChatQuery };