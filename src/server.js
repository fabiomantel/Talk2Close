const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const fileUploadRoutes = require('./routes/fileUpload');
const analysisRoutes = require('./routes/analysis');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
const audioRoutes = require('./routes/audio');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Backend configuration
const getServerUrl = () => {
  const hostname = process.env.HOSTNAME || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${hostname}:${PORT}`;
};

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audio file serving for MVP (static file serving)
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Set proper MIME types for audio files
    const ext = path.toLowerCase().substr(path.lastIndexOf('.'));
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav', 
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.ogg': 'audio/ogg'
    };
    
    if (mimeTypes[ext]) {
      res.set('Content-Type', mimeTypes[ext]);
    }
    
    // Enable seeking support for audio players
    res.set('Accept-Ranges', 'bytes');
    
    // MVP: Simple caching for development
    res.set('Cache-Control', 'public, max-age=3600');
    
    // CORS headers for audio requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
  }
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Hebrew Sales Call Analysis System',
    version: '1.0.0',
    description: 'AI-powered platform for analyzing Hebrew sales calls and prioritizing customers',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      upload: '/api/upload',
      analyze: '/api/analyze',
      customers: '/api/customers',
      dashboard: '/api/dashboard',
      audio: '/api/audio'
    },
    features: [
      'Hebrew speech-to-text transcription',
      'AI-powered customer scoring',
      'Sales call analysis',
      'Customer prioritization',
      'Real-time dashboard'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health check endpoint for Fly.io
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/upload', fileUploadRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audio', audioRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server only if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    const serverUrl = getServerUrl();
    console.log(`🚀 Hebrew Sales Call Analysis Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: ${serverUrl}/health`);
  });
}

module.exports = app; 