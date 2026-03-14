const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// 获取帖子分类列表 (支持访客)
router.get('/categories', postController.getCategories);

// 获取帖子排序标签配置 (支持访客)
router.get('/sort-tabs', postController.getSortTabs);

// 获取帖子列表 (支持访客)
router.get('/', optionalAuth, postController.getPosts);

// 发布新帖子 (需登录)
router.post('/', auth, postController.createPost);

// 点赞/取消点赞 (需登录)
router.post('/:id/like', auth, postController.toggleLikePost);

// 举报帖子 (需登录)
router.post('/:id/report', auth, postController.reportPost);
router.post('/:id/accept', auth, postController.acceptUrgentAnswer);

module.exports = router;