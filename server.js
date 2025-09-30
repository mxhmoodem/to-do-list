const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// API Routes (must come before static files)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/todos', require('./routes/todos'));

// HTML page routes (must come before static files)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Block direct access to HTML files
app.get('/index.html', (req, res) => {
  res.redirect('/app');
});

app.get('/login.html', (req, res) => {
  res.redirect('/');
});

app.get('/register.html', (req, res) => {
  res.redirect('/register');
});

// Serve static files (CSS, JS, images) - must come AFTER routes
app.use(express.static(__dirname, {
  index: false // Prevent serving index.html automatically
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
});

