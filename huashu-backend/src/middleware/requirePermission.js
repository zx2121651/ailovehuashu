const { hasPermission } = require('../utils/permissionHelper');

// 权限点校验中间件
// 用法: requirePermission('content:edit')
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    if (!hasPermission(req.admin, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: 缺少权限 ' + permission
      });
    }
    next();
  };
};

module.exports = requirePermission;