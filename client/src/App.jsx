import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import CallSimulator from './components/CallSimulator';
import CallLogsViewer from './components/CallLogsViewer';
import MerchantPromptManager from './components/MerchantPromptManager';
import TTSOptimizationSandbox from './components/TTSOptimizationSandbox';
import FailurePatternsDocViewer from './components/FailurePatternsDocViewer';

import { fetchAbandonedCheckouts, fetchMerchants, fetchCalls, simulateCheckout } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [checkouts, setCheckouts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 12,
    recoveredCalls: 8,
    flaggedCalls: 1,
    totalRecoveredValue: 4848,
    conversionRate: 68
  });

  const [selectedCheckoutForCall, setSelectedCheckoutForCall] = useState(null);

  const loadData = async () => {
    try {
      const chkRes = await fetchAbandonedCheckouts();
      if (chkRes.success) setCheckouts(chkRes.checkouts);

      const merchRes = await fetchMerchants();
      if (merchRes.success) setMerchants(merchRes.merchants);

      const callRes = await fetchCalls();
      if (callRes.success) {
        setCalls(callRes.calls);
        setStats(callRes.stats);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerCallFromDashboard = (checkout) => {
    setSelectedCheckoutForCall(checkout);
    setActiveTab('simulator');
  };

  const handleSimulateNewCheckout = async (payload) => {
    try {
      const res = await simulateCheckout(payload);
      if (res.success) {
        setCheckouts(prev => [res.checkout, ...prev]);
      }
    } catch (err) {
      alert('Error creating checkout: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'overview' && (
          <DashboardOverview
            checkouts={checkouts}
            stats={stats}
            onTriggerCall={handleTriggerCallFromDashboard}
            onSimulateNewCheckout={handleSimulateNewCheckout}
          />
        )}

        {activeTab === 'simulator' && (
          <CallSimulator
            selectedCheckout={selectedCheckoutForCall}
            checkouts={checkouts}
            merchants={merchants}
          />
        )}

        {activeTab === 'logs' && (
          <CallLogsViewer
            calls={calls}
            onRefreshCalls={loadData}
          />
        )}

        {activeTab === 'prompts' && (
          <MerchantPromptManager
            merchants={merchants}
            onRefreshMerchants={loadData}
          />
        )}

        {activeTab === 'tts' && (
          <TTSOptimizationSandbox />
        )}

        {activeTab === 'doc' && (
          <FailurePatternsDocViewer />
        )}
      </main>
    </div>
  );
}
