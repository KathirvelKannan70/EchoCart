import React, { useState } from 'react';
import { ShoppingBag, PhoneCall, TrendingUp, AlertTriangle, Plus, Play, Sparkles } from 'lucide-react';

export default function DashboardOverview({ checkouts, stats, onTriggerCall, onSimulateNewCheckout }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: 'Kabir Mehta',
    phone: '+919811223344',
    language: 'Hinglish',
    itemTitle: 'Oversized Streetwear Hoodie - Off White',
    price: 1899,
    merchantId: 'merchant_streetwear',
    paymentMethod: 'Cash on Delivery'
  });

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    onSimulateNewCheckout({
      customerName: formData.customerName,
      phone: formData.phone,
      language: formData.language,
      items: [{ title: formData.itemTitle, quantity: 1, price: Number(formData.price) }],
      subtotal: Number(formData.price),
      discountCode: 'GO100',
      discountAmount: 100,
      totalPrice: Number(formData.price) - 100,
      merchantId: formData.merchantId,
      paymentMethod: formData.paymentMethod
    });
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recovered Cart Revenue</span>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '10px' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            ₹{(stats.totalRecoveredValue || 4848).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+24% from AI Voice recovery</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Calls Initiated</span>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '10px' }}>
              <PhoneCall size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {stats.totalCalls || 12}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated outbound calls</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Voice Conversion Rate</span>
            <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderRadius: '10px' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#38bdf8' }}>
            {stats.conversionRate || 68}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COD Order Confirmations</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Quality Review Flags</span>
            <div style={{ padding: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#f87171', borderRadius: '10px' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {stats.flaggedCalls || 1}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TTS & Prompt tuning reviews</span>
        </div>

      </div>

      {/* Abandoned Checkouts Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Shopify Abandoned Checkouts</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Real-time checkout stream synced from Shopify Admin REST API
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Simulate New Checkout</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Phone / Lang</th>
                <th style={{ padding: '12px' }}>Cart Items</th>
                <th style={{ padding: '12px' }}>Payable Price</th>
                <th style={{ padding: '12px' }}>Payment Mode</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map(chk => (
                <tr key={chk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                    {chk.customerName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{chk.city}</div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontSize: '0.85rem' }}>{chk.phone}</div>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{chk.language}</span>
                  </td>
                  <td style={{ padding: '14px 12px', maxWidth: '240px' }}>
                    {chk.items.map((i, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem' }}>{i.title}</div>
                    ))}
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#34d399' }}>
                    ₹{chk.totalPrice.toLocaleString('en-IN')}
                    {chk.discountCode && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {chk.discountCode}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{chk.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={`badge ${chk.status === 'recovered' ? 'badge-success' : chk.status === 'declined' ? 'badge-danger' : 'badge-warning'}`}>
                      {chk.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onTriggerCall(chk)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Play size={14} />
                      <span>Trigger Voice Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Simulating New Checkout */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '28px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Simulate New Abandoned Checkout</h3>
            <form onSubmit={handleSimulateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Language</label>
                  <select
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(18,25,41,0.9)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                  >
                    <option value="Hinglish">Hinglish</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Item Title</label>
                <input
                  type="text"
                  value={formData.itemTitle}
                  onChange={e => setFormData({ ...formData, itemTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Merchant Persona</label>
                  <select
                    value={formData.merchantId}
                    onChange={e => setFormData({ ...formData, merchantId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(18,25,41,0.9)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                  >
                    <option value="merchant_streetwear">UrbanKicks Streetwear</option>
                    <option value="merchant_electronics">VoltGear Tech</option>
                    <option value="merchant_wellness">Aura Wellness</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
