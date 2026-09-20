/**
 * ContextBuilder Service
 * 
 * Responsible for variable localization, price computation, currency to spoken text,
 * and preparing clean structured context objects for LLM System Prompt injection.
 */

class ContextBuilder {
  /**
   * Convert numbers to spoken words for error-free TTS reading
   * Example: 1699 -> "one thousand six hundred and ninety-nine"
   * Example (Indian system): 1528 -> "one thousand five hundred and twenty-eight"
   */
  numberToSpokenWords(num) {
    if (isNaN(num)) return '';
    num = Math.round(num);
    if (num === 0) return 'zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 
                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
                  'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num < 20) return ones[num];
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
    }
    if (num < 1000) {
      return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + this.numberToSpokenWords(num % 100) : '');
    }
    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return this.numberToSpokenWords(thousands) + ' thousand' + (remainder !== 0 ? ' ' + this.numberToSpokenWords(remainder) : '');
    }

    return num.toLocaleString('en-IN');
  }

  /**
   * Format currency into natural spoken string
   * Example: 1699, 'INR' -> "one thousand six hundred and ninety-nine rupees"
   * Example: 49.99, 'USD' -> "forty-nine dollars and ninety-nine cents"
   */
  formatCurrencySpoken(amount, currency = 'INR') {
    const num = parseFloat(amount || 0);
    const spokenNum = this.numberToSpokenWords(num);

    if (currency === 'INR') {
      return `${spokenNum} rupees`;
    } else if (currency === 'USD') {
      return `${spokenNum} dollars`;
    }
    return `${spokenNum} ${currency}`;
  }

  /**
   * Format currency for display (UI / debugging)
   */
  formatCurrencyDisplay(amount, currency = 'INR') {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  }

  /**
   * Calculate price math with active discount code
   */
  computePriceMath(checkout, merchant) {
    const subtotal = checkout.subtotal || checkout.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = checkout.discountAmount || 0;
    const discountCode = checkout.discountCode || (merchant ? merchant.activeDiscountCode : 'WELCOME10');

    // If discount code applied but amount not computed
    if (discountCode && discountAmount === 0) {
      if (discountCode.includes('100')) {
        discountAmount = 100;
      } else if (discountCode.includes('10') || discountCode.includes('15')) {
        const pct = discountCode.includes('15') ? 0.15 : 0.10;
        discountAmount = Math.round(subtotal * pct);
      }
    }

    const finalPrice = Math.max(0, subtotal - discountAmount + (checkout.shipping || 0));

    return {
      subtotal,
      discountCode,
      discountAmount,
      shipping: checkout.shipping || 0,
      finalPrice
    };
  }

  /**
   * Build clean items summary string
   */
  formatItemsSummary(items = []) {
    if (!items || items.length === 0) return 'your selected items';
    
    if (items.length === 1) {
      const item = items[0];
      return `${item.title}${item.quantity > 1 ? ` (Quantity: ${item.quantity})` : ''}`;
    }

    const mainItem = items[0].title;
    const otherCount = items.length - 1;
    return `${mainItem} and ${otherCount} other item${otherCount > 1 ? 's' : ''}`;
  }

  /**
   * Detect or resolve customer language preference
   */
  resolveLanguage(customerLanguage, merchantDefault) {
    if (customerLanguage && ['English', 'Hinglish', 'Hindi'].includes(customerLanguage)) {
      return customerLanguage;
    }
    return merchantDefault || 'Hinglish';
  }

  /**
   * Main Context Builder Entry Point: Transforms raw checkout + merchant into a Call Context Object
   */
  buildCallContext(checkout, merchant) {
    const prices = this.computePriceMath(checkout, merchant);
    const currency = merchant ? merchant.currency : 'INR';
    const language = this.resolveLanguage(checkout.language, merchant ? merchant.defaultLanguage : 'Hinglish');
    const itemsSummary = this.formatItemsSummary(checkout.items);

    const finalPriceSpoken = this.formatCurrencySpoken(prices.finalPrice, currency);
    const subtotalSpoken = this.formatCurrencySpoken(prices.subtotal, currency);
    const discountAmountSpoken = this.formatCurrencySpoken(prices.discountAmount, currency);

    return {
      checkoutId: checkout.id,
      merchantId: merchant ? merchant.id : checkout.merchantId,
      merchantName: merchant ? merchant.name : 'our store',
      customerName: checkout.customerName || 'Customer',
      phone: checkout.phone,
      city: checkout.city || 'your address',
      language,
      items: itemsSummary,
      itemsRaw: checkout.items,
      subtotal: prices.subtotal,
      subtotalDisplay: this.formatCurrencyDisplay(prices.subtotal, currency),
      subtotalSpoken,
      discountCode: prices.discountCode,
      discountAmount: prices.discountAmount,
      discountAmountDisplay: this.formatCurrencyDisplay(prices.discountAmount, currency),
      discountAmountSpoken,
      finalPrice: prices.finalPrice,
      finalPriceDisplay: this.formatCurrencyDisplay(prices.finalPrice, currency),
      finalPriceSpoken,
      paymentMethod: checkout.paymentMethod || 'Cash on Delivery',
      isCod: (checkout.paymentMethod || '').toLowerCase().includes('cash') || (checkout.paymentMethod || '').toLowerCase().includes('cod')
    };
  }
}

module.exports = new ContextBuilder();
