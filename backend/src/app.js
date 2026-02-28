require("dotenv").config();
require('./config/db');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ message: "Backend is running! Use /auth/login and /api/workflows" });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: "Server is working!" });
});

app.use('/api/workflows', workflowRoutes);
app.use('/auth', authRoutes);

module.exports = app;