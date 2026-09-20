import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertOctagon } from 'lucide-react';
import { fetchFailurePatternsDoc } from '../services/api';

export default function FailurePatternsDocViewer() {
  const [docContent, setDocContent] = useState('');

  useEffect(() => {
    fetchFailurePatternsDoc().then(res => {
      if (res.success) setDocContent(res.content);
    });
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <FileText size={28} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Internal Engineering Document</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Post-mortem breakdown of voice AI failure patterns and system prompt & pre-processing fixes applied
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(9,13,22,0.8)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#e5e7eb', lineHeight: '1.7', fontSize: '0.92rem' }}>
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}>
          {docContent}
        </div>
      </div>
    </div>
  );
}
