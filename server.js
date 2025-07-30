require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
origin: 'http://localhost:3000', // Ganti dengan origin client Anda
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Sample data untuk quiz partikel dialog
// (tetap pertahankan data yang sudah ada)

// Routes yang sudah ada
app.get('/api/quiz', (req, res) => {
  const filePath = path.join(__dirname, 'dialog', 'data.json');
  fs.readFile(filePath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Gagal membaca file JSON:', err);
      return res.status(500).json({ error: 'Gagal membaca data' });
    }

    try {
      const quizData = JSON.parse(jsonData);
      res.json(quizData);
    } catch (parseErr) {
      console.error('Format JSON tidak valid:', parseErr);
      res.status(500).json({ error: 'Format data tidak valid' });
    }
  });
});

app.get('/api/quiz/chapter/:id', (req, res) => {
  const chapterId = parseInt(req.params.id);
  const chapter = quizData.chapters.find(ch => ch.id === chapterId);
  
  if (!chapter) {
    return res.status(404).json({ error: 'Chapter not found' });
  }
  
  res.json(chapter);
});

// ======================================
// IMPLEMENTASI AUTHENTIKASI
// ======================================

// Endpoint Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validasi credential dari environment variable
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Set cookie HTTP Only
    res.cookie('auth_token', process.env.AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Hanya HTTPS di production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 hari
    });
    
    return res.json({ success: true, message: 'Login berhasil' });
  }
  
  res.status(401).json({ success: false, message: 'Username atau password salah' });
});

// Endpoint Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logout berhasil' });
});

// Middleware Authentikasi
function authenticate(req, res, next) {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  // Verifikasi token sederhana
  if (token === process.env.AUTH_TOKEN) {
    return next();
  }

  res.status(401).json({ error: 'Token tidak valid' });
}

// Contoh route yang diproteksi


// ======================================
// ROUTE UNTUK CLIENT-SIDE
// ======================================

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quizgame.html'));
});

app.get('/statistic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'statistic.html'));
});

app.get('/login-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/dashboard', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/editor', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// Client-side handling form login
app.post('/client-login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Set cookie untuk client-side
    res.cookie('auth_token', process.env.AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    return res.json({ success: true, redirect: '/dashboard' });
  }
  
  res.status(401).json({ success: false, message: 'Login gagal' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});