const contextBuilder = require('../server/services/contextBuilder');
const promptEngine = require('../server/services/promptEngine');
const ttsOptimizer = require('../server/services/ttsOptimizer');
const voicePipeline = require('../server/services/voicePipeline');
const db = require('../server/database/db');

async function runTests() {
  console.log('=== TEST 1: ContextBuilder Price Math & Number to Spoken Words ===');
  const spokenNum = contextBuilder.numberToSpokenWords(1699);
  console.log('1699 -> Spoken words:', spokenNum);
  if (spokenNum !== 'one thousand six hundred and ninety-nine') {
    throw new Error('Number to spoken words failed');
  }

  const spokenCurrency = contextBuilder.formatCurrencySpoken(1699, 'INR');
  console.log('1699 INR -> Spoken currency:', spokenCurrency);

  const mockCheckout = {
    id: 'chk_test',
    customerName: 'Aarav Patel',
    items: [{ title: 'Anime Oversized Hoodie', quantity: 1, price: 1799 }],
    subtotal: 1799,
    discountCode: 'GO100',
    discountAmount: 100,
    shipping: 0,
    language: 'Hinglish'
  };
  const merchant = db.getMerchantById('merchant_streetwear');
  const context = contextBuilder.buildCallContext(mockCheckout, merchant);
  console.log('Calculated Context Final Price Spoken:', context.finalPriceSpoken);
  console.log('Calculated Context Final Price Display:', context.finalPriceDisplay);

  console.log('\n=== TEST 2: PromptEngine Variable Substitution & Voice Rules ===');
  const { systemPrompt } = promptEngine.generateForCheckout(mockCheckout, merchant);
  console.log('Generated System Prompt Snippet:\n', systemPrompt.slice(0, 300) + '...');
  if (!systemPrompt.includes('Aarav Patel') || !systemPrompt.includes('one thousand six hundred and ninety-nine rupees')) {
    throw new Error('Prompt Engine variable substitution failed');
  }

  console.log('\n=== TEST 3: TTSOptimizer Pre-processing ===');
  const rawText = 'Aapka final price ₹1,699 hai with free COD delivery via UPI.';
  const optimized = ttsOptimizer.optimize(rawText);
  console.log('Raw Text:', rawText);
  console.log('Optimized Text:', optimized);
  if (optimized.includes('₹') || optimized.includes('COD') || optimized.includes('1,699')) {
    throw new Error('TTS Optimizer failed to replace symbol or acronym');
  }

  console.log('\n=== TEST 4: Voice Pipeline Simulated Session ===');
  const session = await voicePipeline.startCallSession('chk_98214');
  console.log('Started Call Session ID:', session.id);
  console.log('Initial Agent Greeting:', session.turns[0].text);

  const turnResult = await voicePipeline.processCustomerTurn(session.id, 'Kitna discount milega code se?');
  console.log('User Speech: Kitna discount milega code se?');
  console.log('Agent Response:', turnResult.agentResponse);

  console.log('\n✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
