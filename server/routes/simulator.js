const express = require('express');
const router = express.Router();
const voicePipeline = require('../services/voicePipeline');

// POST /api/simulator/start
router.post('/start', async (req, res) => {
  try {
    const { checkoutId, merchantId } = req.body;
    const session = await voicePipeline.startCallSession(checkoutId || 'chk_98214', merchantId);
    res.json({
      success: true,
      callId: session.id,
      customerName: session.customerName,
      initialGreeting: session.turns[0].text,
      call: session
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/simulator/turn
router.post('/turn', async (req, res) => {
  try {
    const { callId, userSpeechText } = req.body;
    if (!callId || !userSpeechText) {
      return res.status(400).json({ success: false, error: 'callId and userSpeechText are required' });
    }

    const result = await voicePipeline.processCustomerTurn(callId, userSpeechText);
    res.json({
      success: true,
      agentResponse: result.agentResponse,
      callStatus: result.callStatus,
      turns: result.turns
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
