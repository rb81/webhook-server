const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'your-secret-token';
const DATA_DIR = '/app/data';

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' }));

// Bearer token authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (token !== BEARER_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
};

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Webhook endpoint
app.post('/webhook', authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    const timestamp = new Date().toISOString();
    const filename = `webhook-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.json`;
    const filepath = path.join(DATA_DIR, filename);

    // Add metadata to the payload
    const dataToSave = {
      timestamp,
      headers: req.headers,
      payload
    };

    // Save to file
    await fs.writeFile(filepath, JSON.stringify(dataToSave, null, 2));

    console.log(`Webhook received and saved to: ${filename}`);
    
    res.json({ 
      success: true, 
      message: 'Webhook received and saved',
      filename,
      timestamp
    });
  } catch (error) {
    console.error('Error saving webhook data:', error);
    res.status(500).json({ error: 'Failed to save webhook data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  await ensureDataDir();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook server running on port ${PORT}`);
    console.log(`Bearer token: ${BEARER_TOKEN}`);
    console.log(`Data will be saved to: ${DATA_DIR}`);
  });
};

startServer();