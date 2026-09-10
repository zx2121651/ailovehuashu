const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huashu_admin_super_secret_key_2026';

const adminAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { prisma } = require('../utils/prisma');
    const { getAdminPermissions } = require('../utils/permissionHelper');

    // 从数据库加载管理员完整信息（含权限），以便权限中间件做细粒度判断
    const dbAdmin = await prisma.admin.findUnique({
      where: { id: decoded.admin.id },
      select: { id: true, username: true, name: true, role: true, permissions: true, status: true }
    });

    if (!dbAdmin || dbAdmin.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: '账户不可用或已禁用' });
    }

    req.admin = {
      id: dbAdmin.id,
      username: dbAdmin.username,
      name: dbAdmin.name,
      role: dbAdmin.role,
      permissions: dbAdmin.permissions,
      permissionsResolved: getAdminPermissions(dbAdmin)
    };
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
