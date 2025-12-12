const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Check if token starts with 'Token '
    const token = authHeader.startsWith('Token ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token format'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'farm-management-secret-key-2024');
    
    // Add user info to request
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;