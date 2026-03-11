const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });
};

/**
 * Generate HTML email body for insight report
 */
const buildEmailHTML = (insights, analysis, fileNames, charts = []) => {
  const { summary } = analysis;
  const healthScore = insights.overallHealthScore;
  const scoreColor = healthScore?.label === 'GOOD' ? '#10b981' :
                     healthScore?.label === 'FAIR' ? '#f59e0b' :
                     healthScore?.label === 'AT RISK' ? '#ef4444' : '#7f1d1d';

  const riskAlertsHTML = (insights.riskAlerts || [])
    .map(alert => `<li style="padding:8px 0; border-bottom:1px solid #334155; color:#e2e8f0;">${alert}</li>`)
    .join('');

  const recommendationsHTML = (insights.recommendations || [])
    .map((rec, i) => `
      <tr>
        <td style="padding:10px; background:${i % 2 === 0 ? '#1e293b' : '#0f172a'}; color:#e2e8f0; border-bottom:1px solid #334155;">
          <span style="color:#6366f1; font-weight:bold;">${i + 1}.</span> ${rec}
        </td>
      </tr>`)
    .join('');

  const chartsHTML = charts.length > 0
    ? charts.map((chart, i) => `
        <div style="margin:20px 0; text-align:center;">
          <p style="color:#94a3b8; font-size:13px; margin-bottom:8px; font-style:italic;">${chart.title}</p>
          <img src="cid:chart${i}" alt="${chart.title}" style="max-width:100%; border-radius:8px; border:1px solid #334155;" />
        </div>`).join('')
    : '<p style="color:#64748b; text-align:center;">Charts not available</p>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Insight Report</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Arial, sans-serif;">
  <div style="max-width:720px; margin:0 auto; padding:20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); border-radius:12px 12px 0 0; padding:32px; text-align:center; border-bottom:2px solid #6366f1;">
      <div style="font-size:13px; color:#a5b4fc; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px;">Sales Insight Automator Pro</div>
      <h1 style="margin:0; color:#f8fafc; font-size:28px; font-weight:700;">Executive Sales Report</h1>
      <p style="margin:8px 0 0; color:#94a3b8; font-size:14px;">Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <div style="margin-top:12px; font-size:12px; color:#64748b;">Files analyzed: ${fileNames.join(', ')}</div>
    </div>

    <!-- Health Score Banner -->
    <div style="background:#1e293b; padding:20px 32px; border-left:4px solid ${scoreColor};">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:2px;">Business Health Score</div>
          <div style="color:${scoreColor}; font-size:36px; font-weight:900; line-height:1;">${healthScore?.score || '--'}<span style="font-size:18px;">/100</span></div>
          <div style="color:${scoreColor}; font-size:14px; font-weight:700; letter-spacing:2px;">${healthScore?.label || 'N/A'}</div>
        </div>
        <div style="text-align:right; color:#94a3b8; font-size:13px; max-width:300px;">
          ${healthScore?.rationale || ''}
        </div>
      </div>
    </div>

    <!-- Executive Summary -->
    <div style="background:#1a1a2e; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px;">Executive Summary</h2>
      <p style="color:#e2e8f0; font-size:15px; line-height:1.7; margin:0;">${insights.executiveSummary || 'No summary available.'}</p>
    </div>

    <!-- Key Metrics -->
    <div style="background:#0f172a; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 20px;">Key Performance Metrics</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          ${summary.totalRevenue !== undefined ? `
          <td style="padding:16px; background:#1e293b; border-radius:8px; text-align:center; width:25%;">
            <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Total Revenue</div>
            <div style="color:#10b981; font-size:20px; font-weight:900; margin-top:4px;">$${Number(summary.totalRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </td>` : ''}
          ${summary.totalRows ? `
          <td style="padding:16px; background:#1e293b; border-radius:8px; text-align:center; width:25%;">
            <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Total Records</div>
            <div style="color:#6366f1; font-size:20px; font-weight:900; margin-top:4px;">${analysis.totalRows.toLocaleString()}</div>
          </td>` : ''}
          ${summary.cancellationRate !== undefined ? `
          <td style="padding:16px; background:#1e293b; border-radius:8px; text-align:center; width:25%;">
            <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Cancellation Rate</div>
            <div style="color:${parseFloat(summary.cancellationRate) > 10 ? '#ef4444' : '#f59e0b'}; font-size:20px; font-weight:900; margin-top:4px;">${summary.cancellationRate}%</div>
          </td>` : ''}
          ${summary.topRegion ? `
          <td style="padding:16px; background:#1e293b; border-radius:8px; text-align:center; width:25%;">
            <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Top Region</div>
            <div style="color:#a78bfa; font-size:14px; font-weight:900; margin-top:4px;">${summary.topRegion}</div>
          </td>` : ''}
        </tr>
      </table>
    </div>

    <!-- Regional Performance -->
    ${insights.topPerformingRegion ? `
    <div style="background:#1a1a2e; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px;">🏆 Top Performing Region</h2>
      <div style="background:#0f172a; border-left:3px solid #10b981; padding:16px; border-radius:0 8px 8px 0;">
        <div style="color:#10b981; font-size:18px; font-weight:700;">${insights.topPerformingRegion.region}</div>
        <div style="color:#6366f1; font-size:22px; font-weight:900;">${insights.topPerformingRegion.revenue}</div>
        <p style="color:#94a3b8; font-size:14px; margin:8px 0 0; line-height:1.6;">${insights.topPerformingRegion.analysis}</p>
      </div>
    </div>` : ''}

    <!-- Worst Category -->
    ${insights.worstPerformingCategory ? `
    <div style="background:#0f172a; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px;">⚠️ Needs Attention: Category</h2>
      <div style="background:#1a1a2e; border-left:3px solid #ef4444; padding:16px; border-radius:0 8px 8px 0;">
        <div style="color:#ef4444; font-size:18px; font-weight:700;">${insights.worstPerformingCategory.category}</div>
        <div style="color:#f97316; font-size:22px; font-weight:900;">${insights.worstPerformingCategory.revenue}</div>
        <p style="color:#94a3b8; font-size:14px; margin:8px 0 0; line-height:1.6;">${insights.worstPerformingCategory.analysis}</p>
      </div>
    </div>` : ''}

    <!-- Risk Alerts -->
    ${riskAlertsHTML ? `
    <div style="background:#1a1a2e; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#ef4444; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px;">🚨 Risk Alerts</h2>
      <ul style="margin:0; padding:0; list-style:none;">
        ${riskAlertsHTML}
      </ul>
    </div>` : ''}

    <!-- Charts Section -->
    <div style="background:#0f172a; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 20px;">📊 Visual Analytics</h2>
      ${chartsHTML}
    </div>

    <!-- Recommendations -->
    ${recommendationsHTML ? `
    <div style="background:#1a1a2e; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px;">💡 Strategic Recommendations</h2>
      <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden;">
        ${recommendationsHTML}
      </table>
    </div>` : ''}

    <!-- Predicted Trend -->
    ${insights.predictedNextTrend ? `
    <div style="background:#0f172a; padding:28px 32px; border-top:1px solid #334155;">
      <h2 style="color:#6366f1; font-size:16px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px;">🔮 Predicted Trend</h2>
      <p style="color:#e2e8f0; font-size:15px; line-height:1.7; margin:0; font-style:italic;">"${insights.predictedNextTrend}"</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="background:#1e293b; padding:20px 32px; border-radius:0 0 12px 12px; border-top:2px solid #334155; text-align:center;">
      <p style="color:#475569; font-size:12px; margin:0;">Generated by Sales Insight Automator Pro • ${new Date().toISOString()}</p>
      <p style="color:#334155; font-size:11px; margin:4px 0 0;">This report is AI-generated and intended for strategic reference only.</p>
    </div>

  </div>
</body>
</html>`;
};

/**
 * Send insight report email
 */
const sendInsightReport = async ({ to, insights, analysis, fileNames, charts = [] }) => {
  const transporter = createTransporter();

  const attachments = charts.map((chart, i) => ({
    filename: path.basename(chart.path),
    path: chart.path,
    cid: `chart${i}`
  }));

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Sales Insight Automator" <${process.env.SMTP_USER}>`,
    to,
    subject: `📊 Sales Insight Report — ${new Date().toLocaleDateString()} | Score: ${insights.overallHealthScore?.score || '--'}/100`,
    html: buildEmailHTML(insights, analysis, fileNames, charts),
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent to ${to} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw new Error(`Failed to send email: ${err.message}`);
  }
};

module.exports = { sendInsightReport };
