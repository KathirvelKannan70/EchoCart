import React, { useState } from 'react';
import { Sliders, Save, Eye, RefreshCw, CheckCircle } from 'lucide-react';
import { updateMerchantPrompt, previewMerchantPrompt } from '../services/api';

export default function MerchantPromptManager({ merchants, onRefreshMerchants }) {
  const [selectedMerchantId, setSelectedMerchantId] = useState('merchant_streetwear');
  const [promptTemplate, setPromptTemplate] = useState(
    merchants?.find(m => m.id === 'merchant_streetwear')?.systemPromptTemplate || ''
  );
  const [previewResult, setPreviewResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedMerchant = merchants?.find(m => m.id === selectedMerchantId);

  const handleMerchantChange = (mId) => {
    setSelectedMerchantId(mId);
    const m = merchants?.find(item => item.id === mId);
    if (m) {
      setPromptTemplate(m.systemPromptTemplate);
    }
    setPreviewResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMerchantPrompt(selectedMerchantId, promptTemplate);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefreshMerchants();
    } catch (err) {
      alert('Error saving prompt: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await previewMerchantPrompt(selectedMerchantId, 'chk_98214', promptTemplate);
      if (res.success) {
        setPreviewResult(res.renderedSystemPrompt);
      }
    } catch (err) {
      alert('Error rendering preview: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
      
      {/* Merchant Persona Selector */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--primary)" />
          Merchant Brand Personas
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {merchants?.map(m => (
            <div
              key={m.id}
              onClick={() => handleMerchantChange(m.id)}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: selectedMerchantId === m.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: selectedMerchantId === m.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 600, color: selectedMerchantId === m.id ? '#818cf8' : '#fff' }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.industry} • {m.defaultLanguage}</div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#34d399' }}>Discount Code: {m.activeDiscountCode}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>Available Template Variables:</strong>
          <ul style={{ paddingLeft: '16px', marginTop: '6px', lineHeight: '1.5' }}>
            <li><code>&#123;&#123;customer_name&#125;&#125;</code></li>
            <li><code>&#123;&#123;merchant_name&#125;&#125;</code></li>
            <li><code>&#123;&#123;items&#125;&#125;</code></li>
            <li><code>&#123;&#123;final_price&#125;&#125;</code></li>
            <li><code>&#123;&#123;discount_code&#125;&#125;</code></li>
            <li><code>&#123;&#123;language&#125;&#125;</code></li>
          </ul>
        </div>
      </div>

      {/* Main Editor & Live Preview Panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Prompt Engineering Sandbox</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configure voice persona, tone rules, Hinglish boundaries, and pricing speech format for {selectedMerchant?.name}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePreview} className="btn btn-outline">
              <Eye size={16} /> Live Preview Rendering
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {savedSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'Saved!' : 'Save System Prompt'}</span>
            </button>
          </div>
        </div>

        {/* Prompt Template Textarea */}
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
            System Prompt Template Markdown
          </label>
          <textarea
            rows={14}
            value={promptTemplate}
            onChange={e => setPromptTemplate(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              background: 'rgba(9,13,22,0.9)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: '#f3f4f6',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Live Preview Render Box */}
        {previewResult && (
          <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '8px' }}>
              Injected System Prompt Result (Sample Checkout context: Rohan Sharma - Oversized Anime Hoodie):
            </h4>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.82rem', color: '#e0f2fe', margin: 0, maxHeight: '240px', overflowY: 'auto' }}>
              {previewResult}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
