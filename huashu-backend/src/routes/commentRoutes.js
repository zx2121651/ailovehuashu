const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// 获取评论 (公开接口或带 token 均可，但不强制)
router.get('/:targetType/:targetId', optionalAuth, commentController.getComments);

// 需登录的接口
router.post('/', auth, commentController.createComment);
router.post('/:id/like', auth, commentController.toggleLikeComment);

module.exports = router;