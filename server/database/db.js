const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  merchants: [
    {
      id: 'merchant_streetwear',
      name: 'UrbanKicks & Apparel',
      domain: 'urbankicks-india.myshopify.com',
      industry: 'Fashion & Streetwear',
      defaultLanguage: 'Hinglish',
      currency: 'INR',
      systemPromptTemplate: `You are Aanya, a friendly and energetic voice customer specialist for {{merchant_name}}. 
Your goal is to call {{customer_name}} to confirm their order or help them complete their abandoned checkout for {{items}}.

Context:
- Customer Name: {{customer_name}}
- Items in cart: {{items}}
- Subtotal: {{subtotal}}
- Discount applied: {{discount_code}} (Saved {{discount_amount}})
- Final Payable Price: {{final_price}}
- Payment Method: {{payment_method}}
- Language preference: {{language}}

Rules for Voice Speech:
1. Keep sentences short and conversational (max 15 words per turn).
2. DO NOT use markdown, bullet points, or special characters like #, *, or symbols like ₹ (say "rupees" explicitly).
3. Insert natural pauses using commas and ellipses.
4. If Hinglish is preferred, use natural conversational Hinglish (e.g., "Aapka order complete karne ke liye bas ek final confirmation chahiye").
5. Offer discount code {{discount_code}} if the customer hesitates due to price.
6. Always end with a clear question (e.g. "Kya main aapka Cash on Delivery order confirm kar doon?").`,
      activeDiscountCode: 'GO100',
      discountValue: '₹100 OFF',
      codAvailable: true
    },
    {
      id: 'merchant_electronics',
      name: 'VoltGear Tech Solutions',
      domain: 'voltgear-store.myshopify.com',
      industry: 'Consumer Electronics',
      defaultLanguage: 'English',
      currency: 'INR',
      systemPromptTemplate: `You are Alex, an expert product assistant from {{merchant_name}}.
You are reaching out to {{customer_name}} regarding their checkout for {{items}}.

Context:
- Customer Name: {{customer_name}}
- Items: {{items}}
- Final Payable Price: {{final_price}}
- Discount Code: {{discount_code}}
- Payment Mode: {{payment_method}}

Rules for Voice Speech:
1. Maintain a professional, crisp, and helpful tone.
2. Address warranty or shipping questions concisely.
3. Pronounce prices clearly in words (e.g. "three thousand four hundred and ninety-nine rupees").
4. Confirm shipping address and preferred delivery time window.`,
      activeDiscountCode: 'TECH10',
      discountValue: '10% OFF',
      codAvailable: false
    },
    {
      id: 'merchant_wellness',
      name: 'Aura Ayurveda & Glow',
      domain: 'aura-ayurveda.myshopify.com',
      industry: 'Beauty & Wellness',
      defaultLanguage: 'Hinglish',
      currency: 'INR',
      systemPromptTemplate: `You are Priya from {{merchant_name}}. Call {{customer_name}} warmly to assist with their skincare routine purchase of {{items}}.

Context:
- Customer: {{customer_name}}
- Products: {{items}}
- Total Price: {{final_price}}
- Special Offer: {{discount_code}}

Voice Rules:
1. Warm, empathetic tone.
2. Highlight natural organic ingredients briefly.
3. Keep turns under 2 sentences.`,
      activeDiscountCode: 'GLOW15',
      discountValue: '15% OFF',
      codAvailable: true
    }
  ],
  abandonedCheckouts: [
    {
      id: 'chk_98214',
      shopifyId: 'gid://shopify/Checkout/98214',
      customerName: 'Rohan Sharma',
      phone: '+919876543210',
      email: 'rohan.sharma@example.com',
      language: 'Hinglish',
      city: 'Mumbai',
      items: [
        { title: 'Oversized Anime Hoodie - Midnight Black', quantity: 1, price: 1799 }
      ],
      subtotal: 1799,
      discountCode: 'GO100',
      discountAmount: 100,
      tax: 0,
      shipping: 0,
      totalPrice: 1699,
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 mins ago
      merchantId: 'merchant_streetwear',
      status: 'abandoned',
      callStatus: 'pending'
    },
    {
      id: 'chk_98215',
      shopifyId: 'gid://shopify/Checkout/98215',
      customerName: 'Ananya Verma',
      phone: '+919812345678',
      email: 'ananya.v@example.com',
      language: 'English',
      city: 'Bengaluru',
      items: [
        { title: 'ANC Wireless Noise Cancelling Earbuds', quantity: 1, price: 3499 }
      ],
      subtotal: 3499,
      discountCode: 'TECH10',
      discountAmount: 350,
      tax: 0,
      shipping: 0,
      totalPrice: 3149,
      paymentMethod: 'Prepaid (UPI / Card)',
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      merchantId: 'merchant_electronics',
      status: 'abandoned',
      callStatus: 'completed'
    },
    {
      id: 'chk_98216',
      shopifyId: 'gid://shopify/Checkout/98216',
      customerName: 'Pooja Hegde',
      phone: '+919988776655',
      email: 'pooja.hegde@example.com',
      language: 'Hinglish',
      city: 'Delhi',
      items: [
        { title: 'Kumkumadi Radiance Face Serum (30ml)', quantity: 2, price: 899 }
      ],
      subtotal: 1798,
      discountCode: 'GLOW15',
      discountAmount: 270,
      tax: 0,
      shipping: 0,
      totalPrice: 1528,
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      merchantId: 'merchant_wellness',
      status: 'abandoned',
      callStatus: 'pending'
    }
  ],
  calls: [
    {
      id: 'call_101',
      checkoutId: 'chk_98215',
      merchantId: 'merchant_electronics',
      customerName: 'Ananya Verma',
      phone: '+919812345678',
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      durationSeconds: 74,
      outcome: 'recovered',
      outcomeReason: 'Customer confirmed order after 10% discount code explanation',
      orderValue: 3149,
      flagged: false,
      flagReason: null,
      turns: [
        {
          speaker: 'agent',
          text: 'Hi Ananya! I noticed you left the ANC Wireless Earbuds in your cart at VoltGear. Is there anything I can help you with to complete your order?',
          timestamp: '00:03'
        },
        {
          speaker: 'customer',
          text: 'Yeah, I was wondering if the 10 percent discount code is still valid for UPI payments?',
          timestamp: '00:15'
        },
        {
          speaker: 'agent',
          text: 'Yes! Code TECH10 gives you ten percent off, making your total three thousand one hundred and forty-nine rupees with free delivery.',
          timestamp: '00:24'
        },
        {
          speaker: 'customer',
          text: 'Awesome, can you place the order for me or send a quick payment link?',
          timestamp: '00:45'
        },
        {
          speaker: 'agent',
          text: 'I have sent the instant payment link directly to your phone via SMS. Thank you for choosing VoltGear!',
          timestamp: '00:58'
        }
      ]
    },
    {
      id: 'call_102',
      checkoutId: 'chk_98214',
      merchantId: 'merchant_streetwear',
      customerName: 'Rohan Sharma',
      phone: '+919876543210',
      startTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      durationSeconds: 52,
      outcome: 'flagged_issue',
      outcomeReason: 'TTS misread price symbol symbol as raw string',
      orderValue: 1699,
      flagged: true,
      flagReason: 'TTS Engine pronounced ₹1,699 as "question mark one comma six nine nine". Need phonetic rule update.',
      turns: [
        {
          speaker: 'agent',
          text: 'Namaste Rohan! Main UrbanKicks se Aanya bol rahi hoon. Aapka Oversized Anime Hoodie cart mein ruka hua hai.',
          timestamp: '00:02'
        },
        {
          speaker: 'customer',
          text: 'Haan wo final kitne ka padega COD pe?',
          timestamp: '00:12'
        },
        {
          speaker: 'agent',
          text: 'Aapka final price ₹1,699 hai aur 100 rupees discount already applied hai.',
          timestamp: '00:22'
        },
        {
          speaker: 'customer',
          text: 'Samjh nahi aaya, kitna bole aap?',
          timestamp: '00:30'
        }
      ]
    }
  ],
  ttsComparisons: [
    {
      id: 'tts_1',
      title: 'Currency Symbol & Price Phonetics',
      before: 'Your total amount is ₹1,499 with free COD delivery.',
      after: 'Your total amount is one thousand four hundred and ninety-nine rupees, with free cash on delivery.',
      explanation: 'TTS mispronounced raw currency symbol ₹ as punctuation or "Rupees one four nine nine". Fixed by converting digits to natural spelled-out numbers and explicit spoken words.'
    },
    {
      id: 'tts_2',
      title: 'Speech Pacing & Breath Markers',
      before: 'Hi Rohan your cart with Oversized Hoodie for rupees 1699 is pending do you want to confirm Cash on delivery now?',
      after: 'Hi Rohan... I saw your cart with the Oversized Hoodie for sixteen ninety-nine rupees is waiting... Should I confirm your cash on delivery order now?',
      explanation: 'Continuous unpunctuated text caused TTS to sound robotic and out of breath. Adding ellipses (...) and short clause breaks gives the neural voice natural pause intervals.'
    },
    {
      id: 'tts_3',
      title: 'Hinglish Code-Switching Accent Tuning',
      before: 'Aapka order confirmation total rupee 1200 COD confirm karein.',
      after: 'Aapka order confirmation total... twelve hundred rupees hai. Kya COD order confirm kar doon?',
      explanation: 'Mixed language without clear English phonetic boundaries confused the Indian accent TTS model. Restructuring sentence order improved intelligibility by 85%.'
    }
  ]
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      this.saveData(defaultData);
    }
  }

  getData() {
    try {
      const dataStr = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(dataStr);
    } catch (err) {
      console.error('Error reading DB, re-initializing:', err);
      this.saveData(defaultData);
      return defaultData;
    }
  }

  saveData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  // Merchant methods
  getMerchants() {
    return this.getData().merchants;
  }

  getMerchantById(id) {
    return this.getMerchants().find(m => m.id === id);
  }

  updateMerchantPrompt(id, template) {
    const db = this.getData();
    const idx = db.merchants.findIndex(m => m.id === id);
    if (idx !== -1) {
      db.merchants[idx].systemPromptTemplate = template;
      this.saveData(db);
      return db.merchants[idx];
    }
    return null;
  }

  // Checkout methods
  getAbandonedCheckouts() {
    return this.getData().abandonedCheckouts;
  }

  getCheckoutById(id) {
    return this.getAbandonedCheckouts().find(c => c.id === id);
  }

  addCheckout(checkout) {
    const db = this.getData();
    db.abandonedCheckouts.unshift(checkout);
    this.saveData(db);
    return checkout;
  }

  updateCheckoutStatus(id, status, callStatus) {
    const db = this.getData();
    const idx = db.abandonedCheckouts.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (status) db.abandonedCheckouts[idx].status = status;
      if (callStatus) db.abandonedCheckouts[idx].callStatus = callStatus;
      this.saveData(db);
      return db.abandonedCheckouts[idx];
    }
    return null;
  }

  // Call methods
  getCalls() {
    return this.getData().calls;
  }

  getCallById(id) {
    return this.getCalls().find(c => c.id === id);
  }

  addCall(call) {
    const db = this.getData();
    db.calls.unshift(call);
    this.saveData(db);
    return call;
  }

  flagCall(id, reason) {
    const db = this.getData();
    const idx = db.calls.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.calls[idx].flagged = true;
      db.calls[idx].flagReason = reason || 'Flagged by merchant for review';
      db.calls[idx].outcome = 'flagged_issue';
      this.saveData(db);
      return db.calls[idx];
    }
    return null;
  }

  // TTS Comparisons
  getTTSComparisons() {
    return this.getData().ttsComparisons;
  }
}

module.exports = new Database();
