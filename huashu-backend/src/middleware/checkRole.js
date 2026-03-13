const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'huashu_user_secret_key_2026';

const checkRole = (roles) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { userId: 'xxx', role: 'MENTOR' }

      if (!roles.includes(req.user.role)) {
         return res.status(403).json({ code: 403, message: '您的账号权限不足' });
      }

      next();
    } catch (err) {
      res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
    }
  };
};

module.exports = checkRole;