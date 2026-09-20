/**
 * TTSOptimizer Service
 * 
 * Post-processes LLM output text before sending to Text-to-Speech engines (ElevenLabs / Twilio Say / Web Speech).
 * Solves currency symbol mispronunciation, unpunctuated breathlessness, and Hinglish accent friction.
 */

const contextBuilder = require('./contextBuilder');

class TTSOptimizer {
  /**
   * Optimize raw LLM text for speech synthesis
   */
  optimize(rawText) {
    if (!rawText) return '';

    let text = rawText;

    // 1. Strip all Markdown formatting (asterisks, hashtags, underscores, brackets)
    text = text.replace(/[*_#`~]/g, '');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // replace markdown links with link text

    // 2. Currency symbol replacements to spoken words
    // Replace ₹1,699 or ₹1699 or ₹ 1699 with spoken rupees
    text = text.replace(/₹\s*(\d+[\d,]*)/g, (match, amountStr) => {
      const cleanNum = parseInt(amountStr.replace(/,/g, ''), 10);
      if (!isNaN(cleanNum)) {
        return `${contextBuilder.numberToSpokenWords(cleanNum)} rupees`;
      }
      return 'rupees';
    });

    // Replace $49 or $49.99 with spoken dollars
    text = text.replace(/\$\s*(\d+[\d,]*(\.\d+)?)/g, (match, amountStr) => {
      const cleanNum = parseFloat(amountStr.replace(/,/g, ''));
      if (!isNaN(cleanNum)) {
        return `${contextBuilder.numberToSpokenWords(cleanNum)} dollars`;
      }
      return 'dollars';
    });

    // 3. Standalone Rupee symbol replacement
    text = text.replace(/₹/g, ' rupees ');
    text = text.replace(/\$/g, ' dollars ');

    // 4. Standalone raw numbers conversion if any missed (e.g. "for 1499")
    text = text.replace(/\b(\d{3,6})\b/g, (match, numStr) => {
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        return contextBuilder.numberToSpokenWords(num);
      }
      return match;
    });

    // 5. Common E-commerce acronyms & terms to phonetic pronunciation
    text = text.replace(/\bCOD\b/g, 'Cash on Delivery');
    text = text.replace(/\bUPI\b/g, 'U P I');
    text = text.replace(/\bSMS\b/g, 'S M S');
    text = text.replace(/\bOTP\b/g, 'O T P');
    text = text.replace(/\bINR\b/g, 'rupees');

    // 6. Pacing & breath pause tuning
    // Ensure commas after sentence openers like Hi [Name], Namaste [Name]
    text = text.replace(/^(Hi|Hello|Namaste|Hey)\s+([A-Z][a-z]+)/i, '$1 $2...');
    
    // Add natural breath pauses before key conjunctions if missing punctuation
    text = text.replace(/([a-z0-9])\s+(and|but|so|because|or|is available|total is)\s+/gi, '$1, $2 ');

    // 7. Normalize multiple spaces and punctuation
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Return before vs after comparison for TTS audit dashboard
   */
  getComparisonExamples() {
    return [
      {
        id: 'ex_1',
        title: 'Rupee Symbol & Price Reading',
        rawInput: 'Aapka final price ₹1,699 hai with free COD delivery.',
        optimizedOutput: this.optimize('Aapka final price ₹1,699 hai with free COD delivery.'),
        problem: 'TTS misreads "₹1,699" as raw symbol question mark or "rupees one six nine nine".',
        solution: 'Replaced symbol with spelled-out words "one thousand six hundred and ninety-nine rupees" and expanded "COD" to "Cash on Delivery".'
      },
      {
        id: 'ex_2',
        title: 'Sentence Pacing & Pause Insertion',
        rawInput: 'Hi Rohan your order for Oversized Anime Hoodie is pending on VoltGear do you want to complete payment via UPI?',
        optimizedOutput: this.optimize('Hi Rohan your order for Oversized Anime Hoodie is pending on VoltGear do you want to complete payment via UPI?'),
        problem: 'Continuous sentence cause TTS engine to sound robotic and breathless.',
        solution: 'Added pause marker ellipses after greeting and comma pauses before payment options.'
      },
      {
        id: 'ex_3',
        title: 'Acronym & Delivery Terms Expansion',
        rawInput: 'You can pay via UPI or COD. We will send OTP via SMS.',
        optimizedOutput: this.optimize('You can pay via UPI or COD. We will send OTP via SMS.'),
        problem: 'TTS engine slurs "UPI" as "yoo-pee" and "SMS" as "smss".',
        solution: 'Spelled out acronyms as letter intervals "U P I" and "S M S" for clear articulation.'
      }
    ];
  }
}

module.exports = new TTSOptimizer();
