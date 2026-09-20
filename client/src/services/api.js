const API_BASE = '/api';

export async function fetchAbandonedCheckouts() {
  const res = await fetch(`${API_BASE}/shopify/abandoned-checkouts`);
  return res.json();
}

export async function simulateCheckout(payload) {
  const res = await fetch(`${API_BASE}/shopify/simulate-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchMerchants() {
  const res = await fetch(`${API_BASE}/merchants`);
  return res.json();
}

export async function updateMerchantPrompt(merchantId, systemPromptTemplate) {
  const res = await fetch(`${API_BASE}/merchants/${merchantId}/prompt`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPromptTemplate })
  });
  return res.json();
}

export async function previewMerchantPrompt(merchantId, checkoutId, customTemplate) {
  const res = await fetch(`${API_BASE}/merchants/${merchantId}/preview-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkoutId, customTemplate })
  });
  return res.json();
}

export async function fetchCalls(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/calls${query ? `?${query}` : ''}`);
  return res.json();
}

export async function fetchCallById(callId) {
  const res = await fetch(`${API_BASE}/calls/${callId}`);
  return res.json();
}

export async function flagCall(callId, reason) {
  const res = await fetch(`${API_BASE}/calls/${callId}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function fetchTTSComparisons() {
  const res = await fetch(`${API_BASE}/calls/tts/comparisons`);
  return res.json();
}

export async function fetchFailurePatternsDoc() {
  const res = await fetch(`${API_BASE}/calls/docs/failure-patterns`);
  return res.json();
}

export async function startSimulatorSession(checkoutId, merchantId) {
  const res = await fetch(`${API_BASE}/simulator/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkoutId, merchantId })
  });
  return res.json();
}

export async function sendSimulatorTurn(callId, userSpeechText) {
  const res = await fetch(`${API_BASE}/simulator/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId, userSpeechText })
  });
  return res.json();
}
