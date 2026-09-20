import React, { useState, useEffect } from 'react';
import { Volume2, Play, CheckCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { fetchTTSComparisons } from '../services/api';

export default function TTSOptimizationSandbox() {
  const [comparisons, setComparisons] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchTTSComparisons().then(res => {
      if (res.success) setComparisons(res.comparisons);
    });
  }, []);

  const playAudio = (id, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser does not support speech synthesis.');
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.onend = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Volume2 size={24} color="var(--accent-cyan)" />
          Text-To-Speech (TTS) Pacing & Phonetic Optimization Lab
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Concrete before & after examples showing how prompt rules and pre-processing eliminate currency mispronunciations, robotic breathlessness, and Hinglish accent friction.
        </p>
      </div>

      {/* Comparisons Showcase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comparisons.map((c, idx) => (
          <div key={c.id || idx} className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              Case #{idx + 1}: {c.title}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              
              {/* BEFORE Box */}
              <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                    ❌ Raw LLM Output (Before Optimization)
                  </span>
                  <button
                    onClick={() => playAudio(`before_${idx}`, c.before || c.rawInput)}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    <Play size={12} /> {playingId === `before_${idx}` ? 'Playing...' : 'Test Listen'}
                  </button>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fecdd3', margin: 0 }}>
                  "{c.before || c.rawInput}"
                </p>
              </div>

              {/* AFTER Box */}
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                    ✅ EchoCart Voice Optimized (After Pre-processing)
                  </span>
                  <button
                    onClick={() => playAudio(`after_${idx}`, c.after || c.optimizedOutput)}
                    className="btn btn-success"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    <Play size={12} /> {playingId === `after_${idx}` ? 'Playing...' : 'Test Listen'}
                  </button>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#a7f3d0', margin: 0 }}>
                  "{c.after || c.optimizedOutput}"
                </p>
              </div>

            </div>

            {/* Explanation & Technical Fix */}
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.83rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Engineering Insight: </span>
              <span style={{ color: 'var(--text-muted)' }}>{c.explanation || c.solution}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
