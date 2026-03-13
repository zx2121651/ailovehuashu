const prisma = require('../../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }
        role = admin.role;
        finalId = admin.id;
        finalUsername = admin.username;
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
          res.json({
            success: true,
            data: {
              token,
              admin: {
                id: finalId,
                username: finalUsername,
                role: role
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
        return res.json({
          success: true,
          data: {
            id: user.id,
            username: user.name || '导师',
            role: 'MENTOR',
            createdAt: new Date() // Fallback since User might not have createdAt mapped
          }
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: { id: true, username: true, role: true, createdAt: true }
      });
      res.json({ success: true, data: admin });
    } catch (err) {
      console.error('Admin getMe error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = authController;
