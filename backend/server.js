require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const taskRoutes = require('./routes/tasks');
const exceptionRoutes = require('./routes/exceptions');
const farmBlockRoutes = require('./routes/farmBlocks');
const sopTemplateRoutes = require('./routes/sopTemplates');
const authRoutes = require('./routes/auth');

// Import middleware
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://142.93.94.236:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Farm Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/exceptions', authMiddleware, exceptionRoutes);
app.use('/api/farm-blocks', authMiddleware, farmBlockRoutes);
app.use('/api/sop-templates', authMiddleware, sopTemplateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Farm Management API server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;