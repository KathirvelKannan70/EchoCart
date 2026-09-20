const express = require('express');
const router = express.Router();
const db = require('../database/db');
const promptEngine = require('../services/promptEngine');
const shopifyService = require('../services/shopifyService');

// GET /api/merchants
router.get('/', (req, res) => {
  const merchants = db.getMerchants();
  res.json({ success: true, merchants });
});

// GET /api/merchants/:id
router.get('/:id', (req, res) => {
  const merchant = db.getMerchantById(req.params.id);
  if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });
  res.json({ success: true, merchant });
});

// PUT /api/merchants/:id/prompt
router.put('/:id/prompt', (req, res) => {
  const { systemPromptTemplate } = req.body;
  if (!systemPromptTemplate) {
    return res.status(400).json({ success: false, error: 'systemPromptTemplate is required' });
  }

  const updated = db.updateMerchantPrompt(req.params.id, systemPromptTemplate);
  if (!updated) return res.status(404).json({ success: false, error: 'Merchant not found' });

  res.json({ success: true, merchant: updated });
});

// POST /api/merchants/:id/preview-prompt
router.post('/:id/preview-prompt', async (req, res) => {
  try {
    const merchant = db.getMerchantById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    const { checkoutId, customTemplate } = req.body;
    let checkout;
    if (checkoutId) {
      checkout = await shopifyService.getCheckoutById(checkoutId);
    }
    if (!checkout) {
      const allCheckouts = await shopifyService.getAbandonedCheckouts();
      checkout = allCheckouts[0];
    }

    const templateToUse = customTemplate || merchant.systemPromptTemplate;
    const { context, systemPrompt } = promptEngine.generateForCheckout(
      checkout,
      { ...merchant, systemPromptTemplate: templateToUse }
    );

    res.json({ success: true, context, renderedSystemPrompt: systemPrompt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
