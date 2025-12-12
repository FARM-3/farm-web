const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Mock user data (in production, this would be from a database)
const users = [
  {
    id: '1',
    email: 'admin@farmmanagement.com',
    password: '$2a$10$rOK6.T7KwH8ZB8XWjYvZ2uX4q2B5zK8A6L3C9F2E1D7B8A9C8D7E6', // 'admin123'
    name: 'Farm Administrator',
    role: 'admin',
    is_email_verified: true
  },
  {
    id: '2',
    email: 'manager@farmmanagement.com',
    password: '$2a$10$rOK6.T7KwH8ZB8XWjYvZ2uX4q2B5zK8A6L3C9F2E1D7B8A9C8D7E6', // 'manager123'
    name: 'Farm Manager',
    role: 'manager',
    is_email_verified: true
  },
  {
    id: '3',
    email: 'worker@farmmanagement.com',
    password: '$2a$10$rOK6.T7KwH8ZB8XWjYvZ2uX4q2B5zK8A6L3C9F2E1D7B8A9C8D7E6', // 'worker123'
    name: 'Farm Worker',
    role: 'worker',
    is_email_verified: true
  }
];

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password (in this mock, we'll use a simple comparison for demo)
    // In production, use: const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === 'admin123' || password === 'manager123' || password === 'worker123';

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET || 'farm-management-secret-key-2024',
      { expiresIn: '24h' }
    );

    // Return user data and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

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
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User associated with token not found'
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);

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
    
    console.error('Get user info error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user info'
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const token = authHeader.startsWith('Token ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token format'
      });
    }

    // Verify token (even if expired, we want to refresh)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'farm-management-secret-key-2024');
    } catch (error) {
      if (error.name !== 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Access denied',
          message: 'Invalid token'
        });
      }
      // If token is expired, we can still decode it to get user info
      decoded = jwt.decode(token);
    }
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User associated with token not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET || 'farm-management-secret-key-2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: newToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Token refresh failed'
    });
  }
});

// POST /api/auth/logout - User logout (client-side token removal)
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is typically handled client-side
  // by removing the token. This endpoint can be used for logging purposes
  // or to invalidate tokens on the server side if you maintain a blacklist
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;