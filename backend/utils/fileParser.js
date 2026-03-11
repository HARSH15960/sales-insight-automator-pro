const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Parse CSV or XLSX file into JSON array
 * @param {string} filePath - path to file
 * @returns {Array} parsed rows
 */
const parseFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.csv') {
    return parseCSV(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseXLSX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
};

const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: (value, context) => {
      if (context.column && !isNaN(value) && value !== '') {
        return parseFloat(value);
      }
      return value;
    }
  });
  logger.info(`Parsed CSV: ${records.length} rows from ${path.basename(filePath)}`);
  return records;
};

const parseXLSX = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const records = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  logger.info(`Parsed XLSX: ${records.length} rows from ${path.basename(filePath)}`);
  return records;
};

/**
 * Analyze raw data and extract key metrics
 */
const analyzeData = (rows) => {
  if (!rows || rows.length === 0) {
    return { error: 'No data found in file' };
  }

  const columns = Object.keys(rows[0]);
  logger.info(`Columns detected: ${columns.join(', ')}`);

  // Smart column detection
  const revenueCol = findColumn(columns, ['revenue', 'sales', 'amount', 'total', 'value', 'price', 'income', 'turnover']);
  const regionCol = findColumn(columns, ['region', 'area', 'territory', 'zone', 'location', 'country', 'state', 'city']);
  const categoryCol = findColumn(columns, ['category', 'product', 'type', 'segment', 'department', 'item', 'sku', 'name']);
  const dateCol = findColumn(columns, ['date', 'month', 'year', 'period', 'time', 'quarter', 'week']);
  const unitsCol = findColumn(columns, ['units', 'quantity', 'qty', 'count', 'sold', 'volume', 'orders']);
  const statusCol = findColumn(columns, ['status', 'state', 'result', 'outcome', 'disposition']);

  const analysis = {
    totalRows: rows.length,
    columns,
    detectedFields: { revenueCol, regionCol, categoryCol, dateCol, unitsCol, statusCol },
    summary: {}
  };

  // Revenue analysis
  if (revenueCol) {
    const revenues = rows.map(r => parseFloat(r[revenueCol]) || 0);
    analysis.summary.totalRevenue = revenues.reduce((a, b) => a + b, 0);
    analysis.summary.avgRevenue = analysis.summary.totalRevenue / rows.length;
    analysis.summary.maxRevenue = Math.max(...revenues);
    analysis.summary.minRevenue = Math.min(...revenues);
  }

  // Region analysis
  if (regionCol) {
    analysis.summary.regionBreakdown = groupAndSum(rows, regionCol, revenueCol);
    analysis.summary.topRegion = getTopKey(analysis.summary.regionBreakdown);
    analysis.summary.worstRegion = getBottomKey(analysis.summary.regionBreakdown);
  }

  // Category analysis
  if (categoryCol) {
    analysis.summary.categoryBreakdown = groupAndSum(rows, categoryCol, revenueCol);
    analysis.summary.topCategory = getTopKey(analysis.summary.categoryBreakdown);
    analysis.summary.worstCategory = getBottomKey(analysis.summary.categoryBreakdown);
  }

  // Cancellation analysis
  if (statusCol) {
    const statuses = rows.map(r => String(r[statusCol] || '').toLowerCase());
    const cancelled = statuses.filter(s =>
      s.includes('cancel') || s.includes('refund') || s.includes('return') || s.includes('lost')
    );
    analysis.summary.cancellationCount = cancelled.length;
    analysis.summary.cancellationRate = ((cancelled.length / rows.length) * 100).toFixed(1);
    analysis.summary.statusBreakdown = groupCount(statuses);
  }

  // Units analysis
  if (unitsCol) {
    const units = rows.map(r => parseFloat(r[unitsCol]) || 0);
    analysis.summary.totalUnits = units.reduce((a, b) => a + b, 0);
    if (categoryCol) {
      analysis.summary.unitsByCategory = groupAndSum(rows, categoryCol, unitsCol);
    }
  }

  // Date/trend analysis
  if (dateCol) {
    analysis.summary.dateTrend = groupAndSum(rows, dateCol, revenueCol);
  }

  return analysis;
};

// Helper: find best column match from list of candidates
const findColumn = (columns, candidates) => {
  const lower = columns.map(c => c.toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.findIndex(c => c.includes(candidate));
    if (idx !== -1) return columns[idx];
  }
  return null;
};

// Helper: group by key and sum value column
const groupAndSum = (rows, groupCol, valueCol) => {
  const result = {};
  rows.forEach(row => {
    const key = String(row[groupCol] || 'Unknown').trim();
    const val = parseFloat(row[valueCol]) || 0;
    result[key] = (result[key] || 0) + val;
  });
  // Sort by value desc
  return Object.fromEntries(
    Object.entries(result).sort(([, a], [, b]) => b - a)
  );
};

// Helper: group and count
const groupCount = (values) => {
  const result = {};
  values.forEach(v => {
    result[v] = (result[v] || 0) + 1;
  });
  return result;
};

const getTopKey = (obj) => Object.keys(obj)[0] || null;
const getBottomKey = (obj) => Object.keys(obj).at(-1) || null;

module.exports = { parseFile, analyzeData };
