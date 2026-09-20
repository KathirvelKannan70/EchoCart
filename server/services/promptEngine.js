const db = require('../database/db');
const contextBuilder = require('./contextBuilder');

class PromptEngine {
  /**
   * Render system prompt for a call given a template and call context
   */
  renderPrompt(template, context) {
    if (!template) {
      template = this.getDefaultTemplate();
    }

    let prompt = template;

    // Substitute placeholders
    const replacements = {
      '{{customer_name}}': context.customerName,
      '{{merchant_name}}': context.merchantName,
      '{{items}}': context.items,
      '{{subtotal}}': context.subtotalSpoken || context.subtotalDisplay,
      '{{discount_code}}': context.discountCode || 'GO100',
      '{{discount_amount}}': context.discountAmountSpoken || context.discountAmountDisplay,
      '{{final_price}}': context.finalPriceSpoken || context.finalPriceDisplay,
      '{{payment_method}}': context.paymentMethod,
      '{{language}}': context.language,
      '{{city}}': context.city
    };

    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key.replace(/[{()}]/g, '\\$&'), 'g');
      prompt = prompt.replace(regex, value || '');
    }

    // Append Voice Quality & TTS Pacing Mandates
    prompt += `\n\n--- CRITICAL VOICE & TTS PACING MANDATES ---
1. You are speaking over a live voice phone call. Write EXACTLY as spoken speech.
2. STRICTLY NO MARKDOWN (no asterisks *, no bullet points, no bold, no # headers).
3. Do NOT use raw currency symbols like ₹ or $. Always write out words like "rupees" or "dollars".
4. Write numbers as words or phonetically clear digits (e.g. write "fifteen hundred" or "one thousand five hundred", NOT "1500").
5. Keep turns short: maximum 1 to 2 sentences per speech turn.
6. Insert natural pause markers using commas (,) and ellipses (...) to allow natural neural TTS breathing.
7. Language preference: ${context.language}. If Hinglish, switch seamlessly between natural Hindi and English without awkward formal translations.`;

    return prompt;
  }

  /**
   * Generate system prompt for a checkout call
   */
  generateForCheckout(checkout, merchant) {
    const context = contextBuilder.buildCallContext(checkout, merchant);
    const template = merchant ? merchant.systemPromptTemplate : this.getDefaultTemplate();
    const systemPrompt = this.renderPrompt(template, context);

    return {
      context,
      systemPrompt
    };
  }

  getDefaultTemplate() {
    return `You are an AI customer specialist calling {{customer_name}} from {{merchant_name}} regarding their abandoned checkout for {{items}}.

Context:
- Customer: {{customer_name}}
- Items: {{items}}
- Final Payable Price: {{final_price}}
- Discount Applied: {{discount_code}}
- Payment Method: {{payment_method}}

Voice Rules:
1. Short, polite, conversational turns.
2. Confirm order details and address any hesitations warmly.`;
  }
}

module.exports = new PromptEngine();
