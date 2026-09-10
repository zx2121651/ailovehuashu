const { hasPermission } = require('../utils/permissionHelper');
const { PERMISSIONS } = require('../constants/permissions');

// 系统管理权限中间件（原 requireSuperAdmin）
// 具备 system:manage 权限点即可通过（超级管理员默认拥有全部权限）
const requireSystemManage = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: '未登录' });
  }
  if (!hasPermission(req.admin, PERMISSIONS.SYSTEM_MANAGE)) {
    return res.status(403).json({ success: false, message: 'Access denied: Requires system management privileges' });
  }
  next();
};

module.exports = requireSystemManage;