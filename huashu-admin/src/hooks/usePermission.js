import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

/**
 * 权限判断 Hook
 * 用法: const { can } = usePermission(); can(PERMISSIONS.USER_EDIT)
 */
export const usePermission = () => {
  const { admin } = useAuth();
  return {
    can: (permission) => hasPermission(admin, permission)
  };
};