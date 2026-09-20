const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const shopifyRoutes = require('./routes/shopify');
const merchantRoutes = require('./routes/merchants');
const callRoutes = require('./routes/calls');
const twilioRoutes = require('./routes/twilio');
const simulatorRoutes = require('./routes/simulator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/shopify', shopifyRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/simulator', simulatorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'EchoCart Voice AI Platform',
    timestamp: new Date().toISOString(),
    mode: process.env.DEFAULT_MODE || 'mock'
  });
});

// Serve Vite production build if present
const clientBuildPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EchoCart AI Voice Agent Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎙️ Web Simulator API: http://localhost:${PORT}/api/simulator`);
  console.log(`📞 Twilio Voice Webhook: http://localhost:${PORT}/api/twilio/voice`);
  console.log(`====================================================`);
});
