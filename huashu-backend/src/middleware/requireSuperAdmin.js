const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role === 'MENTOR') {
    return res.status(403).json({ success: false, message: 'Access denied: Requires superadmin privileges' });
  }
  next();
};

module.exports = requireSuperAdmin;
