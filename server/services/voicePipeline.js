const db = require('../database/db');
const shopifyService = require('./shopifyService');
const contextBuilder = require('./contextBuilder');
const promptEngine = require('./promptEngine');
const llmService = require('./llmService');
const ttsOptimizer = require('./ttsOptimizer');

class VoicePipeline {
  /**
   * Start a new voice call session for an abandoned checkout
   */
  async startCallSession(checkoutId, customMerchantId = null) {
    const checkout = await shopifyService.getCheckoutById(checkoutId);
    if (!checkout) {
      throw new Error(`Checkout ${checkoutId} not found`);
    }

    const merchantId = customMerchantId || checkout.merchantId || 'merchant_streetwear';
    const merchant = db.getMerchantById(merchantId);

    // Build call context and system prompt
    const { context, systemPrompt } = promptEngine.generateForCheckout(checkout, merchant);

    // Initial greeting generation
    const initialGreetingRaw = await llmService.generateTurnResponse(systemPrompt, [], '', context);
    const initialGreeting = ttsOptimizer.optimize(initialGreetingRaw);

    const newCall = {
      id: `call_${Date.now().toString().slice(-6)}`,
      checkoutId: checkout.id,
      merchantId,
      customerName: context.customerName,
      phone: context.phone,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      outcome: 'in_progress',
      outcomeReason: 'Call initiated',
      orderValue: context.finalPrice,
      flagged: false,
      flagReason: null,
      context,
      systemPrompt,
      turns: [
        {
          speaker: 'agent',
          text: initialGreeting,
          timestamp: '00:02'
        }
      ]
    };

    // Update checkout status to calling
    db.updateCheckoutStatus(checkout.id, null, 'in_progress');

    // Save initial call record
    db.addCall(newCall);

    return newCall;
  }

  /**
   * Process a customer speech turn (from Web Simulator or Twilio Webhook)
   */
  async processCustomerTurn(callId, customerSpeechText) {
    const call = db.getCallById(callId);
    if (!call) {
      throw new Error(`Call session ${callId} not found`);
    }

    const timestampStr = this.formatTimestamp(call.turns.length * 12);

    // Add customer turn
    call.turns.push({
      speaker: 'customer',
      text: customerSpeechText,
      timestamp: timestampStr
    });

    // Generate agent response turn
    const agentResponseRaw = await llmService.generateTurnResponse(
      call.systemPrompt,
      call.turns.slice(0, -1),
      customerSpeechText,
      call.context
    );

    const agentResponse = ttsOptimizer.optimize(agentResponseRaw);

    call.turns.push({
      speaker: 'agent',
      text: agentResponse,
      timestamp: this.formatTimestamp((call.turns.length + 1) * 12)
    });

    // Update call duration & check call outcome
    call.durationSeconds = call.turns.length * 12;
    this.evaluateOutcome(call, customerSpeechText, agentResponse);

    // Save updated call back to database
    db.saveData(db.getData());

    return {
      agentResponse,
      callStatus: call.outcome,
      turns: call.turns
    };
  }

  evaluateOutcome(call, customerInput, agentResponse) {
    const custText = (customerInput || '').toLowerCase();
    const agentText = (agentResponse || '').toLowerCase();

    if (custText.includes('yes') || custText.includes('haan') || custText.includes('confirm') || custText.includes('book') || custText.includes('kar do')) {
      call.outcome = 'recovered';
      call.outcomeReason = 'Order confirmed by customer over voice call';
      db.updateCheckoutStatus(call.checkoutId, 'recovered', 'completed');
    } else if (custText.includes('no') || custText.includes('nahi') || custText.includes('cancel') || custText.includes('don\'t want')) {
      call.outcome = 'declined';
      call.outcomeReason = 'Customer declined recovery offer';
      db.updateCheckoutStatus(call.checkoutId, 'declined', 'completed');
    } else {
      call.outcome = 'in_progress';
    }
  }

  formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

module.exports = new VoicePipeline();
