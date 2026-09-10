// 前端权限点与判断辅助

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  UGC_REVIEW: 'ugc:review',
  UGC_DELETE: 'ugc:delete',
  COURSE_CREATE: 'course:create',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',
  STORY_CREATE: 'story:create',
  STORY_EDIT: 'story:edit',
  STORY_DELETE: 'story:delete',
  OPS_MANAGE: 'ops:manage',
  CONTENT_MODERATE: 'content:moderate',
  ORDER_VIEW: 'order:view',
  COMMISSION_REVIEW: 'commission:review',
  SYSTEM_MANAGE: 'system:manage'
};

// 管理员对象可能来自 login 或 /me，权限存储于 admin.permissions
export const getAdminPermissions = (admin) => {
  if (!admin) return [];
  if (Array.isArray(admin.permissions)) return admin.permissions;
  if (typeof admin.permissions === 'string') {
    try {
      const parsed = JSON.parse(admin.permissions);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { /* ignore */ }
  }
  return [];
};

// 判断当前管理员是否拥有某权限
// SUPER_ADMIN 角色默认拥有全部权限
export const hasPermission = (admin, permission) => {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin') return true;
  return getAdminPermissions(admin).includes(permission);
};