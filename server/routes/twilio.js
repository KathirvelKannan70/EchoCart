const express = require('express');
const router = express.Router();
const voicePipeline = require('../services/voicePipeline');
const shopifyService = require('../services/shopifyService');

/**
 * POST /api/twilio/voice
 * Twilio webhook for initiating or answering phone calls
 */
router.post('/voice', async (req, res) => {
  const checkoutId = req.query.checkoutId || req.body.checkoutId || 'chk_98214';
  const serverBaseUrl = process.env.SERVER_BASE_URL || `http://${req.headers.host}`;

  try {
    const callSession = await voicePipeline.startCallSession(checkoutId);
    const initialGreeting = callSession.turns[0].text;

    // Build Twilio TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">${escapeXml(initialGreeting)}</Say>
    <Gather input="speech" action="${serverBaseUrl}/api/twilio/gather?callId=${callSession.id}" method="POST" speechTimeout="auto" timeout="4">
    </Gather>
    <Say voice="Polly.Aditi">I did not catch that. Please visit our website to complete your order. Goodbye!</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (err) {
    console.error('Twilio Voice error:', err);
    res.type('text/xml');
    res.send(`<Response><Say>Thank you for calling. Have a great day!</Say></Response>`);
  }
});

/**
 * POST /api/twilio/gather
 * Twilio webhook receiving customer Speech-to-Text transcription result
 */
router.post('/gather', async (req, res) => {
  const callId = req.query.callId;
  const userSpeech = req.body.SpeechResult || req.body.Digits || '';
  const serverBaseUrl = process.env.SERVER_BASE_URL || `http://${req.headers.host}`;

  try {
    const { agentResponse, callStatus } = await voicePipeline.processCustomerTurn(callId, userSpeech);

    if (callStatus === 'recovered' || callStatus === 'declined') {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">${escapeXml(agentResponse)}</Say>
    <Hangup/>
</Response>`;
      res.type('text/xml');
      return res.send(twiml);
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">${escapeXml(agentResponse)}</Say>
    <Gather input="speech" action="${serverBaseUrl}/api/twilio/gather?callId=${callId}" method="POST" speechTimeout="auto" timeout="4">
    </Gather>
    <Say voice="Polly.Aditi">Thank you for your time. Goodbye!</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (err) {
    console.error('Twilio Gather error:', err);
    res.type('text/xml');
    res.send(`<Response><Say>Thank you. Goodbye!</Say></Response>`);
  }
});

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = router;
