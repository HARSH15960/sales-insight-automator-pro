const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Demo users (in production, use database)
const DEMO_USERS = [
  {
    id: 'user_001',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'admin',
    password: 'demo123'
  },
  {
    id: 'user_002',
    email: 'analyst@demo.com',
    name: 'Sales Analyst',
    role: 'analyst',
    password: 'demo123'
  }
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      logger.warn(`Login attempt for unknown email: ${email}`);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

const validPassword = (password === user.password);    if (!validPassword) {
      logger.warn(`Invalid password for: ${email}`);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`✅ Login successful: ${email}`);

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return res.status(500).json({ error: 'Server Error', message: 'Authentication failed' });
  }
};

const refresh = async (req, res) => {
  try {
    const { id, email, name, role } = req.user;
    const token = jwt.sign(
      { id, email, name, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    return res.json({ token, user: { id, email, name, role } });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error', message: 'Token refresh failed' });
  }
};

const me = (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { login, refresh, me };
