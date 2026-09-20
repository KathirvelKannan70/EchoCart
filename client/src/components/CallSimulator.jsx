import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, PhoneOff, Mic, Send, Volume2, User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { startSimulatorSession, sendSimulatorTurn } from '../services/api';

export default function CallSimulator({ selectedCheckout, checkouts, merchants }) {
  const [activeCheckoutId, setActiveCheckoutId] = useState(selectedCheckout ? selectedCheckout.id : 'chk_98214');
  const [activeMerchantId, setActiveMerchantId] = useState('merchant_streetwear');
  
  const [callSession, setCallSession] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [userText, setUserText] = useState('');
  const [loadingTurn, setLoadingTurn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (selectedCheckout) {
      setActiveCheckoutId(selectedCheckout.id);
      setActiveMerchantId(selectedCheckout.merchantId || 'merchant_streetwear');
    }
  }, [selectedCheckout]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [callSession?.turns]);

  // Web Speech Synthesis (Text-to-Speech)
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop previous

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Natural conversational rate
    utterance.pitch = 1.0;
    
    // Pick an English or Indian accent voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.includes('Google') || v.name.includes('Aditi'));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition (Speech-to-Text)
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or type your message.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserText(transcript);
      setIsListening(false);
      handleSendTurn(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleStartCall = async () => {
    try {
      setIsCalling(true);
      const res = await startSimulatorSession(activeCheckoutId, activeMerchantId);
      if (res.success) {
        setCallSession(res.call);
        speakText(res.initialGreeting);
      }
    } catch (err) {
      alert('Error starting call: ' + err.message);
      setIsCalling(false);
    }
  };

  const handleEndCall = () => {
    setIsCalling(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const handleSendTurn = async (customText = null) => {
    const textToSend = customText || userText;
    if (!textToSend.trim() || !callSession || loadingTurn) return;

    setUserText('');
    setLoadingTurn(true);

    try {
      const res = await sendSimulatorTurn(callSession.id, textToSend);
      if (res.success) {
        setCallSession(prev => ({
          ...prev,
          turns: res.turns,
          outcome: res.callStatus
        }));
        speakText(res.agentResponse);

        if (res.callStatus === 'recovered' || res.callStatus === 'declined') {
          setTimeout(() => setIsCalling(false), 4000);
        }
      }
    } catch (err) {
      console.error('Error processing turn:', err);
    } finally {
      setLoadingTurn(false);
    }
  };

  const currentCheckoutObj = checkouts?.find(c => c.id === activeCheckoutId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
      
      {/* Left Sidebar: Call Configuration */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" />
          Call Setup Configuration
        </h3>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Checkout Record</label>
          <select
            value={activeCheckoutId}
            onChange={e => setActiveCheckoutId(e.target.value)}
            disabled={isCalling}
            style={{ width: '100%', padding: '10px', background: 'rgba(18,25,41,0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', marginTop: '6px' }}
          >
            {checkouts?.map(c => (
              <option key={c.id} value={c.id}>
                {c.customerName} - {c.items[0]?.title.slice(0, 22)}... (₹{c.totalPrice})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Merchant Persona & Tone</label>
          <select
            value={activeMerchantId}
            onChange={e => setActiveMerchantId(e.target.value)}
            disabled={isCalling}
            style={{ width: '100%', padding: '10px', background: 'rgba(18,25,41,0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', marginTop: '6px' }}
          >
            {merchants?.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.industry})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Checkout Card Info */}
        {currentCheckoutObj && (
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.83rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
              Customer: {currentCheckoutObj.customerName}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>Phone: {currentCheckoutObj.phone}</div>
            <div style={{ color: 'var(--text-muted)' }}>Language: {currentCheckoutObj.language}</div>
            <div style={{ marginTop: '8px', fontWeight: 600 }}>
              Payable: <span style={{ color: '#34d399' }}>₹{currentCheckoutObj.totalPrice}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            id="voiceEnable"
            checked={voiceEnabled}
            onChange={e => setVoiceEnabled(e.target.checked)}
          />
          <label htmlFor="voiceEnable" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
            Enable Web Speech Synthesis (TTS Audio)
          </label>
        </div>

        {/* Start / Stop Call Buttons */}
        {!isCalling ? (
          <button onClick={handleStartCall} className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <PhoneCall size={20} />
            <span>Start Voice Call Session</span>
          </button>
        ) : (
          <button onClick={handleEndCall} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <PhoneOff size={20} />
            <span>End Call Session</span>
          </button>
        )}
      </div>

      {/* Right Column: Live Telephony Call Screen */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '620px' }}>
        
        {/* Call Screen Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isCalling ? 'var(--accent-emerald)' : 'var(--text-dim)',
              boxShadow: isCalling ? '0 0 12px var(--accent-emerald)' : 'none'
            }}></div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                {isCalling ? `Live Call in Progress with ${currentCheckoutObj?.customerName}` : 'Voice Call Idle'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isCalling ? 'Audio Stream: Web Speech / Twilio TwiML Gather' : 'Click Start Voice Call to test real-time AI conversation'}
              </span>
            </div>
          </div>

          {callSession && (
            <span className={`badge ${callSession.outcome === 'recovered' ? 'badge-success' : callSession.outcome === 'declined' ? 'badge-danger' : 'badge-info'}`}>
              Outcome: {callSession.outcome}
            </span>
          )}
        </div>

        {/* Call Turns Transcript Screen */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!callSession ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '12px' }}>
              <PhoneCall size={48} opacity={0.3} />
              <p>No active call session. Select a checkout and click Start Voice Call.</p>
            </div>
          ) : (
            callSession.turns.map((turn, idx) => {
              const isAgent = turn.speaker === 'agent';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: isAgent ? 'row' : 'row-reverse',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isAgent ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    {isAgent ? <Bot size={18} /> : <User size={18} />}
                  </div>

                  <div style={{
                    maxWidth: '75%',
                    background: isAgent ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    border: isAgent ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <span>{isAgent ? 'EchoCart AI Specialist' : currentCheckoutObj?.customerName}</span>
                      <span>{turn.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0, color: '#f3f4f6' }}>
                      {turn.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Reply Chips & Customer Input Controls */}
        {isCalling && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                'Kitne ka padega final price?',
                'Any discount coupon code?',
                'Haan Cash on Delivery confirm kar do',
                'Delivery kitne dino mein aayegi?',
                'Nahi abhi cancel kar do'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTurn(chip)}
                  disabled={loadingTurn}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '99px',
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input & Mic Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={startSpeechRecognition}
                className={`btn ${isListening ? 'btn-danger' : 'btn-outline'}`}
                title="Speak into Microphone (Speech-to-Text)"
                style={{ padding: '12px' }}
              >
                <Mic size={18} className={isListening ? 'pulse-dot' : ''} />
              </button>

              <input
                type="text"
                placeholder={isListening ? 'Listening... Speak now...' : 'Type customer speech turn or click mic...'}
                value={userText}
                onChange={e => setUserText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTurn()}
                disabled={loadingTurn}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />

              <button
                onClick={() => handleSendTurn()}
                disabled={loadingTurn || !userText.trim()}
                className="btn btn-primary"
                style={{ padding: '12px 18px' }}
              >
                <Send size={16} />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
