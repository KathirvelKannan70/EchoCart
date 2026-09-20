const axios = require('axios');
const db = require('../database/db');

class ShopifyService {
  constructor() {
    this.storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    this.apiToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
    this.apiVersion = '2024-01';
  }

  isLiveConfigured() {
    return !!(this.storeDomain && this.apiToken);
  }

  /**
   * Fetch abandoned checkouts from Shopify Admin API or local Mock database
   */
  async getAbandonedCheckouts() {
    if (this.isLiveConfigured()) {
      try {
        const url = `https://${this.storeDomain}/admin/api/${this.apiVersion}/checkouts.json?status=open`;
        const response = await axios.get(url, {
          headers: {
            'X-Shopify-Access-Token': this.apiToken,
            'Content-Type': 'application/json'
          }
        });
        
        // Transform Shopify REST checkouts to EcoCart normalized format
        return response.data.checkouts.map(c => this.normalizeShopifyCheckout(c));
      } catch (err) {
        console.warn('Shopify Live API call failed, falling back to local DB:', err.message);
        return db.getAbandonedCheckouts();
      }
    }

    return db.getAbandonedCheckouts();
  }

  /**
   * Fetch a specific checkout details by ID
   */
  async getCheckoutById(checkoutId) {
    const all = await this.getAbandonedCheckouts();
    return all.find(c => c.id === checkoutId || c.shopifyId === checkoutId) || db.getCheckoutById(checkoutId);
  }

  /**
   * Create a new simulated checkout (for live testing in the UI)
   */
  async createSimulatedCheckout(payload) {
    const newCheckout = {
      id: `chk_${Date.now().toString().slice(-5)}`,
      shopifyId: `gid://shopify/Checkout/${Date.now()}`,
      customerName: payload.customerName || 'Rahul Malhotra',
      phone: payload.phone || '+919876500000',
      email: payload.email || 'rahul.m@example.com',
      language: payload.language || 'Hinglish',
      city: payload.city || 'Mumbai',
      items: payload.items || [
        { title: 'Classic Denim Jacket - Vintage Blue', quantity: 1, price: 2499 }
      ],
      subtotal: payload.subtotal || 2499,
      discountCode: payload.discountCode || 'GO100',
      discountAmount: payload.discountAmount || 100,
      tax: 0,
      shipping: 0,
      totalPrice: payload.totalPrice || 2399,
      paymentMethod: payload.paymentMethod || 'Cash on Delivery',
      createdAt: new Date().toISOString(),
      merchantId: payload.merchantId || 'merchant_streetwear',
      status: 'abandoned',
      callStatus: 'pending'
    };

    return db.addCheckout(newCheckout);
  }

  /**
   * Normalize Shopify REST checkout object to EcoCart format
   */
  normalizeShopifyCheckout(shopifyCheckout) {
    const lineItems = (shopifyCheckout.line_items || []).map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }));

    const customerName = shopifyCheckout.shipping_address
      ? `${shopifyCheckout.shipping_address.first_name} ${shopifyCheckout.shipping_address.last_name}`
      : shopifyCheckout.customer
      ? `${shopifyCheckout.customer.first_name} ${shopifyCheckout.customer.last_name}`
      : 'Valued Customer';

    return {
      id: `chk_${shopifyCheckout.id}`,
      shopifyId: `gid://shopify/Checkout/${shopifyCheckout.id}`,
      customerName,
      phone: shopifyCheckout.phone || (shopifyCheckout.shipping_address && shopifyCheckout.shipping_address.phone) || '',
      email: shopifyCheckout.email || '',
      language: 'Hinglish',
      city: (shopifyCheckout.shipping_address && shopifyCheckout.shipping_address.city) || 'Delhi',
      items: lineItems,
      subtotal: parseFloat(shopifyCheckout.subtotal_price || 0),
      discountCode: shopifyCheckout.discount_codes?.[0]?.code || 'WELCOME10',
      discountAmount: parseFloat(shopifyCheckout.total_discounts || 0),
      tax: parseFloat(shopifyCheckout.total_tax || 0),
      shipping: parseFloat(shopifyCheckout.shipping_lines?.[0]?.price || 0),
      totalPrice: parseFloat(shopifyCheckout.total_price || 0),
      paymentMethod: 'Cash on Delivery',
      createdAt: shopifyCheckout.created_at || new Date().toISOString(),
      merchantId: 'merchant_streetwear',
      status: 'abandoned',
      callStatus: 'pending'
    };
  }
}

module.exports = new ShopifyService();
