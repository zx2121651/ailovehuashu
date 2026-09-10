const prisma = require('../../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAdminPermissions } = require('../../utils/permissionHelper');
const auditLog = require('../../utils/auditLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'huashu_admin_super_secret_key_2026';

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password' });
      }

      let admin = await prisma.admin.findUnique({
        where: { username }
      });

      let role = null;
      let finalId = null;
      let finalUsername = null;

      let finalPermissions = [];
      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          auditLog({ admin: { username }, action: 'LOGIN', module: 'AUTH', status: 'fail', detail: '密码错误', req });
          return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }
        role = admin.role;
        finalId = admin.id;
        finalUsername = admin.username;
        finalPermissions = getAdminPermissions(admin);
      } else {
        // Fallback: check if it's a MENTOR from User table
        const mentorUser = await prisma.user.findFirst({
          where: {
             OR: [
               { id: username },
               { wxOpenId: username }
             ],
             role: 'MENTOR'
          }
        });

        if (!mentorUser) {
          return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        if (!mentorUser.password) {
           return res.status(400).json({ success: false, message: '账户未设置密码，无法登录' });
        }

        const isMatch = await bcrypt.compare(password, mentorUser.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        role = 'MENTOR';
        finalId = mentorUser.id;
        finalUsername = mentorUser.name || '导师';
        finalPermissions = getAdminPermissions({ role: 'MENTOR' });
      }

      const payload = {
        admin: {
          id: finalId,
          role: role
        }
      };

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          auditLog({ admin: { username: finalUsername }, action: 'LOGIN', module: 'AUTH', detail: `管理员登录成功 (${role})`, req });
          res.json({
            success: true,
            data: {
              token,
              admin: {
                id: finalId,
                username: finalUsername,
                role: role,
                permissions: finalPermissions
              }
            }
          });
        }
      );
    } catch (err) {
      console.error('Admin login error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getMe: async (req, res) => {
    try {
      if (req.admin.role === 'MENTOR') {
        const user = await prisma.user.findUnique({
          where: { id: req.admin.id }
        });
        if (!user) {
          return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        const { getAdminPermissions } = require('../../utils/permissionHelper');
        return res.json({
          success: true,
          data: {
            id: user.id,
            username: user.name || '导师',
            role: 'MENTOR',
            permissions: getAdminPermissions({ role: 'MENTOR' }),
            createdAt: new Date() // Fallback since User might not have createdAt mapped
          }
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: { id: true, username: true, role: true, permissions: true, createdAt: true }
      });
      const { getAdminPermissions } = require('../../utils/permissionHelper');
      const permissions = getAdminPermissions(admin);
      res.json({ success: true, data: { ...admin, permissions } });
    } catch (err) {
      console.error('Admin getMe error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = authController;
