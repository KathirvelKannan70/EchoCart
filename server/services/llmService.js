const axios = require('axios');
const ttsOptimizer = require('./ttsOptimizer');

class LLMService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Generate conversational turn response using OpenAI, Gemini, or Offline Intelligent Dialog Fallback
   */
  async generateTurnResponse(systemPrompt, conversationHistory, latestUserUtterance, callContext) {
    // Clean user input
    const text = (latestUserUtterance || '').trim();

    // 1. Try OpenAI if key is present
    if (this.openaiApiKey && !this.openaiApiKey.includes('xxxx')) {
      try {
        return await this.callOpenAI(systemPrompt, conversationHistory, text);
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to Intelligent Offline Engine:', err.message);
      }
    }

    // 2. Try Gemini if key is present
    if (this.geminiApiKey && !this.geminiApiKey.includes('xxxx')) {
      try {
        return await this.callGemini(systemPrompt, conversationHistory, text);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Intelligent Offline Engine:', err.message);
      }
    }

    // 3. Intelligent Offline Dialog Engine (Pre-built state machine matching real GoKwik call flows)
    return this.generateOfflineTurn(systemPrompt, conversationHistory, text, callContext);
  }

  /**
   * OpenAI GPT-4o-mini completion handler
   */
  async callOpenAI(systemPrompt, history, userUtterance) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(turn => ({
        role: turn.speaker === 'agent' ? 'assistant' : 'user',
        content: turn.text
      })),
      { role: 'user', content: userUtterance }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rawText = response.data.choices[0].message.content;
    return ttsOptimizer.optimize(rawText);
  }

  /**
   * Gemini API completion handler
   */
  async callGemini(systemPrompt, history, userUtterance) {
    const contents = [
      { role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}` }] },
      ...history.map(turn => ({
        role: turn.speaker === 'agent' ? 'model' : 'user',
        parts: [{ text: turn.text }]
      })),
      { role: 'user', parts: [{ text: userUtterance }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    const response = await axios.post(url, { contents });
    const rawText = response.data.candidates[0].content.parts[0].text;
    return ttsOptimizer.optimize(rawText);
  }

  /**
   * Intelligent Offline Dialog Engine
   * Simulates real-time voice response based on intent classification & state context
   */
  generateOfflineTurn(systemPrompt, history, userUtterance, context) {
    const text = userUtterance.toLowerCase();
    const isHinglish = context && (context.language === 'Hinglish' || context.language === 'Hindi');
    const customer = context ? context.customerName : 'there';
    const items = context ? context.items : 'your item';
    const priceSpoken = context ? context.finalPriceSpoken : 'the total amount';
    const discountCode = context ? context.discountCode : 'GO100';
    const discountAmount = context ? context.discountAmountSpoken : 'one hundred rupees';

    // First turn / Initial call greeting if history is empty
    if (!history || history.length === 0) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Namaste ${customer}... Main ${context ? context.merchantName : 'store'} se bol rahi hoon. Aapka ${items} cart mein ruka hua hai. Kya main aapka Cash on Delivery order confirm kar doon?`);
      }
      return ttsOptimizer.optimize(`Hi ${customer}... I am calling from ${context ? context.merchantName : 'our store'} regarding your order for ${items}. Would you like to confirm your Cash on Delivery order today?`);
    }

    // Intent: Price inquiry / How much / Kitne ka hai
    if (text.includes('price') || text.includes('kitna') || text.includes('cost') || text.includes('total') || text.includes('amount')) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Aapka final price ${priceSpoken} hai... Isme code ${discountCode} apply hone par ${discountAmount} ka discount shaamil hai. Kya main order confirm kar doon?`);
      }
      return ttsOptimizer.optimize(`Your final price is ${priceSpoken}... which includes your discount of ${discountAmount} using code ${discountCode}. Shall I confirm your order now?`);
    }

    // Intent: Discount request / Mehnga hai / Any offer / Coupon
    if (text.includes('discount') || text.includes('coupon') || text.includes('offer') || text.includes('mehnga') || text.includes('expensive') || text.includes('kam karo')) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Main aapke liye exclusive code ${discountCode} apply kar sakti hoon jisse aapko ${discountAmount} ka extra discount milega. Ab aapka payable amount ${priceSpoken} ho gaya hai. Cash on Delivery confirm karein?`);
      }
      return ttsOptimizer.optimize(`I can apply an extra discount code ${discountCode} for you right now, saving you ${discountAmount}. Your new total is ${priceSpoken}. Would you like me to book it?`);
    }

    // Intent: Confirmation / Yes / Haan / Confirm / Okay / Sure / Book it
    if (text.includes('yes') || text.includes('haan') || text.includes('ha') || text.includes('confirm') || text.includes('ok') || text.includes('sure') || text.includes('book') || text.includes('kar do')) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Bahut badiya ${customer}! Aapka order confirm ho gaya hai aur delivery 3 se 4 dino mein aapke address par pahunch jayegi. Thank you for shopping with us!`);
      }
      return ttsOptimizer.optimize(`Wonderful ${customer}! Your order has been successfully confirmed. You will receive an SMS with tracking details shortly. Thank you!`);
    }

    // Intent: Cancellation / No / Cancel / Nahi / Don't want / Late
    if (text.includes('no') || text.includes('nahi') || text.includes('cancel') || text.includes('dont want') || text.includes('don\'t want') || text.includes('not interested')) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Koi baat nahi ${customer}! Main aapka cart save kar deti hoon. Jab bhi aap ready ho, aap website se order complete kar sakte hain. Have a great day!`);
      }
      return ttsOptimizer.optimize(`No problem at all ${customer}! I will keep your cart saved. Feel free to visit our website whenever you are ready. Have a great day!`);
    }

    // Intent: Delivery time / Shipping / Kab aayega
    if (text.includes('delivery') || text.includes('shipping') || text.includes('kab') || text.includes('days') || text.includes('time')) {
      if (isHinglish) {
        return ttsOptimizer.optimize(`Hamari standard delivery 3 se 5 working days mein ho jaati hai... Kya main aapka ${items} order place kar doon?`);
      }
      return ttsOptimizer.optimize(`Our standard delivery takes 3 to 5 business days with full tracking... Would you like me to place your order now?`);
    }

    // Default conversational fallback
    if (isHinglish) {
      return ttsOptimizer.optimize(`Ji bilkul, main aapki poori help karungi. Aapka total amount ${priceSpoken} hai. Kya aap Cash on Delivery se order confirm karna chahenge?`);
    }
    return ttsOptimizer.optimize(`Certainly! I am here to help. Your final total is ${priceSpoken}. Would you like me to proceed with your order confirmation?`);
  }
}

module.exports = new LLMService();
