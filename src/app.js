const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Compteur de visites (en mémoire pour la démo)
let visitCount = 0;

// Routes
app.get('/', (req, res) => {
  visitCount++;
  res.json({
    message: 'Bienvenue sur mon API Node.js!',
    version: '1.0.0',
    visits: visitCount,
    hostname: process.env.HOSTNAME || 'unknown',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;
  res.json({
    username,
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

app.post('/api/calculate', (req, res) => {
  const { a, b } = req.body;

  if (a === undefined || b === undefined) {
    return res.status(400).json({
      error: 'Missing parameters',
      message: 'Both a and b are required'
    });
  }

  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({
      error: 'Invalid parameters',
      message: 'Both a and b must be numbers'
    });
  }

  res.json({
    sum: a + b,
    product: a * b,
    difference: a - b,
    quotient: b !== 0 ? a / b : null
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

module.exports = app;
