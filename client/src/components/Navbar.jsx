import React from 'react';
import { PhoneCall, ShoppingCart, Sliders, Volume2, FileText, Activity, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Dashboard & Carts', icon: ShoppingCart },
    { id: 'simulator', label: 'Live Voice Simulator', icon: PhoneCall, badge: 'Interactive' },
    { id: 'logs', label: 'Call Logs & Transcripts', icon: Activity },
    { id: 'prompts', label: 'Merchant System Prompts', icon: Sliders },
    { id: 'tts', label: 'TTS Optimization Lab', icon: Volume2 },
    { id: 'doc', label: 'Failure Patterns Doc', icon: FileText }
  ];

  return (
    <header className="glass-panel" style={{ marginBottom: '24px', padding: '16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              EchoCart
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Voice Agent for Shopify Cart Recovery & Confirmation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  position: 'relative'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="badge badge-success" style={{ padding: '6px 12px' }}>
            <span className="pulse-dot"></span>
            <span>Mock Engine & Twilio API Ready</span>
          </div>
        </div>

      </div>
    </header>
  );
}
