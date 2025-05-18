const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    console.log('Received token:', token);
    if (!token) throw new Error('Please authenticate');

    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.userId || decoded.id; // Sesuaikan dengan struktur payload token
    console.log('Decoded user ID:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;