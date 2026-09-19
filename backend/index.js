const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const app = express();
const PORT = process.env.PORT || 3000;


if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    statusCode: 429,
    keyGenerator: (req) => {
      return req.ip;
    },
    handler: (req, res) => {
      console.log(`[RATE LIMIT] IP: ${req.ip} exceeded rate limit`);
      res.status(429).json({
        error: "Too Many Requests",
        message: "Hey cool down ! You can only make 100 requests every 15 minutes."
      });
    }
  });
  
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, 
    delayAfter: 50,
    delayMs: () => 500, 
  });
  
  app.use(speedLimiter);
  app.use(limiter);
  console.log('Rate limiting enabled (Production mode)');
} else {
  console.log('Rate limiting disabled (Development mode)');
}

connectDB();

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? envOrigins
  : [...new Set([...envOrigins, ...devOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip} - Status: ${res.statusCode} - ${duration}ms`);
    });
    next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/contact', require('./routes/contact'));

app.get('/', (req, res) => {
    res.json({ message: 'Blog App Backend API' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
