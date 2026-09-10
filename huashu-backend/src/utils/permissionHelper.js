const { PERMISSIONS, ROLE_PERMISSIONS } = require('../constants/permissions');

// 获取管理员的有效权限点集合
// 优先级：管理员单独设置的 permissions（JSON 字符串） > 角色默认权限
const getAdminPermissions = (admin) => {
  if (!admin) return [];

  // MENTOR 角色特殊处理，透传其角色默认权限
  if (admin.role === 'MENTOR') {
    return ROLE_PERMISSIONS.MENTOR || [];
  }

  // adminAuth 中间件已解析好的权限可直接使用
  if (Array.isArray(admin.permissionsResolved)) {
    return admin.permissionsResolved;
  }

  // 数据库中可能已有 admin 记录（含 permissions 字段），尝试解析
  if (admin.permissions) {
    try {
      if (Array.isArray(admin.permissions)) {
        return admin.permissions;
      }
      const parsed = JSON.parse(admin.permissions);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // 解析失败则回退角色默认权限
    }
  }

  return ROLE_PERMISSIONS[admin.role] || ROLE_PERMISSIONS.GUEST || [];
};

// 判断管理员是否拥有指定权限（超管始终拥有全部）
const hasPermission = (admin, permission) => {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin') return true;
  const perms = getAdminPermissions(admin);
  return perms.includes(permission);
};

module.exports = { getAdminPermissions, hasPermission };