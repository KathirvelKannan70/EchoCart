const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopifyService');
const contextBuilder = require('../services/contextBuilder');
const db = require('../database/db');

// GET /api/shopify/abandoned-checkouts
router.get('/abandoned-checkouts', async (req, res) => {
  try {
    const checkouts = await shopifyService.getAbandonedCheckouts();
    res.json({ success: true, count: checkouts.length, checkouts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shopify/simulate-checkout
router.post('/simulate-checkout', async (req, res) => {
  try {
    const newCheckout = await shopifyService.createSimulatedCheckout(req.body);
    res.json({ success: true, checkout: newCheckout });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shopify/context-preview
router.post('/context-preview', async (req, res) => {
  try {
    const { checkoutId, merchantId } = req.body;
    const checkout = await shopifyService.getCheckoutById(checkoutId);
    if (!checkout) return res.status(404).json({ success: false, error: 'Checkout not found' });
    
    const merchant = db.getMerchantById(merchantId || checkout.merchantId);
    const context = contextBuilder.buildCallContext(checkout, merchant);

    res.json({ success: true, context });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
