const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const QUICKCHART_URL = process.env.QUICKCHART_URL || 'https://quickchart.io/chart';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Generate a chart image via QuickChart API and save locally
 * Returns file path
 */
const generateChart = async (chartConfig, prefix = 'chart') => {
  try {
    const response = await axios.post(QUICKCHART_URL, {
      chart: chartConfig,
      width: 700,
      height: 400,
      backgroundColor: '#1a1a2e',
      format: 'png'
    }, {
      responseType: 'arraybuffer',
      timeout: 15000
    });

    const fileName = `${prefix}-${uuidv4()}.png`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, response.data);
    logger.info(`📊 Chart generated: ${fileName}`);
    return filePath;
  } catch (err) {
    logger.error(`Chart generation failed: ${err.message}`);
    return null;
  }
};

/**
 * Generate revenue bar chart by region/category
 */
const generateRevenueBarChart = async (breakdown, title = 'Revenue by Region') => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  const entries = Object.entries(breakdown).slice(0, 8);
  const labels = entries.map(([k]) => k.length > 15 ? k.substring(0, 15) + '...' : k);
  const values = entries.map(([, v]) => parseFloat(v.toFixed(2)));

  const colors = [
    '#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed',
    '#4f46e5', '#818cf8', '#c4b5fd', '#ddd6fe'
  ];

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length).map(c => c + 'cc'),
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#e2e8f0',
          font: { size: 16, weight: 'bold' }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        }
      }
    }
  };

  return generateChart(config, 'revenue-bar');
};

/**
 * Generate units/revenue trend line chart
 */
const generateTrendLineChart = async (trendData, title = 'Revenue Trend Over Time') => {
  if (!trendData || Object.keys(trendData).length === 0) return null;

  const entries = Object.entries(trendData).slice(0, 12);
  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => parseFloat(v.toFixed(2)));

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#e2e8f0',
          font: { size: 16, weight: 'bold' }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        }
      }
    }
  };

  return generateChart(config, 'trend-line');
};

/**
 * Generate category donut chart
 */
const generateCategoryDonutChart = async (breakdown, title = 'Revenue by Category') => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  const entries = Object.entries(breakdown).slice(0, 6);
  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => parseFloat(v.toFixed(2)));

  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#ec4899', '#f59e0b', '#10b981'];

  const config = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: '#1a1a2e',
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#e2e8f0',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'right',
          labels: { color: '#94a3b8', padding: 15 }
        }
      }
    }
  };

  return generateChart(config, 'category-donut');
};

/**
 * Generate all charts for a report
 * Returns array of image paths
 */
const generateAllCharts = async (analysis) => {
  const { summary } = analysis;
  const charts = [];

  logger.info('📊 Generating all charts...');

  const [barChart, lineChart, donutChart] = await Promise.all([
    summary.regionBreakdown
      ? generateRevenueBarChart(summary.regionBreakdown, 'Revenue by Region')
      : summary.categoryBreakdown
        ? generateRevenueBarChart(summary.categoryBreakdown, 'Revenue by Category')
        : Promise.resolve(null),

    summary.dateTrend
      ? generateTrendLineChart(summary.dateTrend, 'Revenue Trend Over Time')
      : Promise.resolve(null),

    summary.categoryBreakdown
      ? generateCategoryDonutChart(summary.categoryBreakdown, 'Category Revenue Share')
      : Promise.resolve(null)
  ]);

  if (barChart) charts.push({ path: barChart, title: 'Revenue Distribution' });
  if (lineChart) charts.push({ path: lineChart, title: 'Revenue Trend' });
  if (donutChart) charts.push({ path: donutChart, title: 'Category Breakdown' });

  logger.info(`✅ Generated ${charts.length} charts`);
  return charts;
};

module.exports = {
  generateRevenueBarChart,
  generateTrendLineChart,
  generateCategoryDonutChart,
  generateAllCharts
};
