import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Search, Eye, Flag, User, Bot, Play } from 'lucide-react';
import { flagCall } from '../services/api';

export default function CallLogsViewer({ calls, onRefreshCalls }) {
  const [selectedCall, setSelectedCall] = useState(null);
  const [filterMerchant, setFilterMerchant] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterFlagged, setFilterFlagged] = useState(false);
  
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState('');
  const [callToFlag, setCallToFlag] = useState(null);

  const filteredCalls = calls.filter(call => {
    if (filterMerchant !== 'all' && call.merchantId !== filterMerchant) return false;
    if (filterOutcome !== 'all' && call.outcome !== filterOutcome) return false;
    if (filterFlagged && !call.flagged) return false;
    return true;
  });

  const handleOpenFlagModal = (call) => {
    setCallToFlag(call);
    setFlagReasonInput(call.flagReason || '');
    setFlagModalOpen(true);
  };

  const handleSaveFlag = async () => {
    if (!callToFlag) return;
    try {
      await flagCall(callToFlag.id, flagReasonInput);
      setFlagModalOpen(false);
      if (selectedCall && selectedCall.id === callToFlag.id) {
        setSelectedCall(prev => ({ ...prev, flagged: true, flagReason: flagReasonInput, outcome: 'flagged_issue' }));
      }
      onRefreshCalls();
    } catch (err) {
      alert('Error flagging call: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Filter Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" />
            Voice Call Audit Logs & Transcripts
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review full conversation turns, speech timing, and flag TTS mispronunciations or prompt bugs
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <select
              value={filterOutcome}
              onChange={e => setFilterOutcome(e.target.value)}
              style={{ padding: '8px 12px', background: 'rgba(18,25,41,0.9)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="all">All Outcomes</option>
              <option value="recovered">Recovered</option>
              <option value="declined">Declined</option>
              <option value="flagged_issue">Flagged Issue</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={filterFlagged}
              onChange={e => setFilterFlagged(e.target.checked)}
            />
            Show Flagged Only
          </label>
        </div>
      </div>

      {/* Calls Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Call ID</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Merchant</th>
                <th style={{ padding: '12px' }}>Duration</th>
                <th style={{ padding: '12px' }}>Order Value</th>
                <th style={{ padding: '12px' }}>Outcome</th>
                <th style={{ padding: '12px' }}>Flag Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map(call => (
                <tr key={call.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{call.id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                    {call.customerName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{call.phone}</div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.85rem' }}>{call.merchantId}</td>
                  <td style={{ padding: '14px 12px' }}>{call.durationSeconds}s</td>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#34d399' }}>₹{call.orderValue}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={`badge ${call.outcome === 'recovered' ? 'badge-success' : call.outcome === 'declined' ? 'badge-danger' : 'badge-warning'}`}>
                      {call.outcome}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {call.flagged ? (
                      <span className="badge badge-danger" title={call.flagReason}>
                        <AlertTriangle size={12} /> Flagged
                      </span>
                    ) : (
                      <span className="badge badge-success">Clean</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="btn btn-outline"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <Eye size={14} /> View Transcript
                      </button>
                      <button
                        onClick={() => handleOpenFlagModal(call)}
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <Flag size={14} /> Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Viewer Modal */}
      {selectedCall && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '640px', padding: '28px', maxWidth: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Call Transcript: {selectedCall.customerName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedCall.id} | Duration: {selectedCall.durationSeconds}s</span>
              </div>
              <button onClick={() => setSelectedCall(null)} className="btn btn-outline" style={{ padding: '4px 10px' }}>Close</button>
            </div>

            {selectedCall.flagged && (
              <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                <strong>Quality Issue Flagged:</strong> {selectedCall.flagReason}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
              {selectedCall.turns?.map((turn, idx) => {
                const isAgent = turn.speaker === 'agent';
                return (
                  <div key={idx} style={{ display: 'flex', gap: '10px', flexDirection: isAgent ? 'row' : 'row-reverse' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAgent ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {isAgent ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div style={{ maxWidth: '80%', background: isAgent ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {isAgent ? 'Agent Turn' : 'Customer Speech'} • {turn.timestamp}
                      </div>
                      {turn.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button onClick={() => handleOpenFlagModal(selectedCall)} className="btn btn-danger">
                <Flag size={14} /> Flag as Broken Turn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {flagModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }}>
          <div className="glass-panel" style={{ width: '440px', padding: '24px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Flag Call for Quality Review</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Document failure pattern (e.g. price symbol mispronunciation, character break, pacing defect)
            </p>
            <textarea
              rows={4}
              value={flagReasonInput}
              onChange={e => setFlagReasonInput(e.target.value)}
              placeholder="e.g. TTS engine mispronounced ₹1,699 as raw string symbol..."
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setFlagModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleSaveFlag} className="btn btn-danger">Save Quality Flag</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
