# EchoCart Voice AI — Common Failure Patterns & System Fixes

*Internal Product & Prompt Engineering Post-Mortem Log*

---

## Pattern 1: Raw Currency Symbol Mispronunciation (TTS Engine Artifact)

### Symptom
The TTS engine pronounced `₹1,499` as *"question mark one comma four nine nine"* or *"Rupees one thousand four nine nine"*, sounding unnatural to Indian consumers.

### Root Cause
Neural voice synthesis engines (e.g. ElevenLabs / Twilio `<Say>`) struggle to parse unicode currency symbols like `₹` inline without explicit language hints.

### Fix Implemented (`server/services/ttsOptimizer.js`)
Added an automated text pre-processing step prior to TTS synthesis:
- Regex transformer replaces `₹1,499` -> `"one thousand four hundred and ninety-nine rupees"`.
- Expands raw numbers to spelled-out words for clean neural voice inflection.

---

## Pattern 2: Breathless & Robotic Speech Turns

### Symptom
When the LLM generated long paragraphs like *"Hi Ananya your order for ANC Wireless Earbuds total three thousand one hundred rupees is waiting in your cart should I confirm cash on delivery?"*, the voice sounded robotic and unnaturally fast.

### Root Cause
Lack of punctuation markers prevented the TTS model from generating natural pause intervals (breathing pauses).

### Fix Implemented (`server/services/promptEngine.js`)
- Enforced a hard sentence length rule: **Maximum 15 words per turn**.
- Automated insertion of pause markers (`...` and `,`) before clause connectors and greetings.

---

## Pattern 3: Hinglish Code-Switching Confusion

### Symptom
When switching between English and Hindi, the agent used over-formal translated phrases like *"Aapka kray mulya chudaalein"* instead of natural conversational Hinglish.

### Root Cause
Standard LLM system prompts defaulted to formal Hindi translations when prompted with "Hindi".

### Fix Implemented (`server/services/promptEngine.js`)
Refactored prompt template rules for Hinglish:
> *"Use natural urban Hinglish (e.g., 'Aapka order complete karne ke liye bas ek final confirmation chahiye'). Keep product names in original English."*

---

## Pattern 4: Slurred Payment Acronyms (COD, UPI, SMS)

### Symptom
TTS model slurred "UPI" as *"yoo-pee"* and "COD" as a single garbled word *"cod"*.

### Root Cause
Default phonetic dictionaries treat all-caps acronyms as lowercase words unless letter-spaced.

### Fix Implemented (`server/services/ttsOptimizer.js`)
Applied explicit phonetic expansion:
- `COD` -> `"Cash on Delivery"`
- `UPI` -> `"U P I"`
- `SMS` -> `"S M S"`

---

## Pattern 5: Customer Objection Handling & Infinite Loops

### Symptom
When customers hesitated or asked about delivery timelines, the agent repeatedly asked *"Kya main order confirm kar doon?"* after every sentence without answering the question first.

### Root Cause
System prompt prioritized closing over answering customer inquiries.

### Fix Implemented (`server/services/llmService.js`)
Added intent-specific dialog branches:
1. **Price Objection**: Apply active merchant discount code first, then state final price.
2. **Delivery Inquiry**: Quote 3-5 days delivery timeline first, then ask confirmation.
3. **Decline**: Thank customer gracefully, save cart, and terminate call cleanly.
