import React from 'react';
import { usePermission } from '../hooks/usePermission';

/**
 * 权限守卫组件（通用）
 *  - 路由级: <PermissionGuard permission={P.X} fallback={<Navigate to="/403" replace/>}><Page/></PermissionGuard>
 *  - 按钮级: <PermissionGuard permission={P.X}><button>删除</button></PermissionGuard>  (无权限则隐藏)
 */
const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { can } = usePermission();
  if (!can(permission)) {
    return fallback;
  }
  return children;
};

export default PermissionGuard;