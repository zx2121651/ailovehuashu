const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 路由: POST /api/v1/auth/wx-login
router.post('/auth/wx-login', userController.wxLogin);

// 路由: GET /api/v1/user/profile
router.get('/user/profile', auth, userController.getProfile);

// 路由: GET /api/v1/auth/me (为了兼容现有的 auth 体系验证当前登录者信息)
router.get('/auth/me', auth, userController.getProfile);

// 路由: PUT /api/v1/user/profile
router.put('/user/profile', auth, userController.updateProfile);

// 管理员专用：修改前台用户角色
const adminAuth = require('../middleware/adminAuth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
router.put('/user/role', adminAuth, requireSuperAdmin, userController.updateUserRole);

module.exports = router;

// 每日签到
router.post('/user/daily-signin', auth, userController.dailySignIn);

// 积分兑换 VIP
router.post('/user/exchange-vip', auth, userController.exchangeVip);
