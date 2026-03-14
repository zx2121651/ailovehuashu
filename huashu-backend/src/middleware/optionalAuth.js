const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'huashu_user_secret_key_2026';

const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Optional, might be { userId: 'xxx' }
    } catch (err) {
      // Token is invalid or expired, but it's optional, so we just ignore
    }
  }

  next();
};

module.exports = optionalAuth;