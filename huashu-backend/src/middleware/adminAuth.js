const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huashu_admin_super_secret_key_2026';

const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded.admin;
    return next();
  } catch (err) {
    // If it's not a valid admin token, check if it's a valid user token with MENTOR role
    try {
      const userTokenSecret = process.env.JWT_SECRET || 'huashu_user_secret_key_2026';
      const userDecoded = jwt.verify(token, userTokenSecret);

      if (userDecoded.role === 'MENTOR') {
        req.user = userDecoded; // Make user info available
        // Create an admin context for the Mentor
        req.admin = { id: userDecoded.userId, username: userDecoded.name || '导师', role: 'MENTOR' };
        return next();
      }
    } catch (userErr) {
      // Ignored, proceed to fail
    }

    return res.status(401).json({ success: false, message: 'Token is not valid or unauthorized' });
  }
};

module.exports = adminAuth;
