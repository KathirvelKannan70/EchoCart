const express = require('express');
const router = express.Router();
const db = require('../database/db');
const ttsOptimizer = require('../services/ttsOptimizer');
const fs = require('fs');
const path = require('path');

// GET /api/calls - Get all call logs with filters
router.get('/', (req, res) => {
  const calls = db.getCalls();
  const { merchantId, outcome, flagged } = req.query;

  let filtered = [...calls];
  if (merchantId) filtered = filtered.filter(c => c.merchantId === merchantId);
  if (outcome) filtered = filtered.filter(c => c.outcome === outcome);
  if (flagged === 'true') filtered = filtered.filter(c => c.flagged === true);

  // Summary stats
  const totalCalls = calls.length;
  const recoveredCalls = calls.filter(c => c.outcome === 'recovered').length;
  const flaggedCalls = calls.filter(c => c.flagged).length;
  const totalRecoveredValue = calls
    .filter(c => c.outcome === 'recovered')
    .reduce((sum, c) => sum + (c.orderValue || 0), 0);
  const conversionRate = totalCalls > 0 ? Math.round((recoveredCalls / totalCalls) * 100) : 0;

  res.json({
    success: true,
    stats: {
      totalCalls,
      recoveredCalls,
      flaggedCalls,
      totalRecoveredValue,
      conversionRate
    },
    calls: filtered
  });
});

// GET /api/calls/:id - Get specific call transcript and metadata
router.get('/:id', (req, res) => {
  const call = db.getCallById(req.params.id);
  if (!call) return res.status(404).json({ success: false, error: 'Call log not found' });
  res.json({ success: true, call });
});

// POST /api/calls/:id/flag - Flag call for quality review
router.post('/:id/flag', (req, res) => {
  const { reason } = req.body;
  const updated = db.flagCall(req.params.id, reason);
  if (!updated) return res.status(404).json({ success: false, error: 'Call log not found' });
  res.json({ success: true, call: updated });
});

// GET /api/calls/tts/comparisons - Get before/after TTS optimization cases
router.get('/tts/comparisons', (req, res) => {
  const staticComparisons = db.getTTSComparisons();
  const dynamicComparisons = ttsOptimizer.getComparisonExamples();
  res.json({ success: true, comparisons: [...staticComparisons, ...dynamicComparisons] });
});

// GET /api/calls/docs/failure-patterns - Serve internal documentation markdown
router.get('/docs/failure-patterns', (req, res) => {
  const docPath = path.join(__dirname, '../docs/failure_patterns.md');
  if (fs.existsSync(docPath)) {
    const content = fs.readFileSync(docPath, 'utf8');
    res.json({ success: true, content });
  } else {
    res.status(404).json({ success: false, error: 'Documentation file not found' });
  }
});

module.exports = router;
