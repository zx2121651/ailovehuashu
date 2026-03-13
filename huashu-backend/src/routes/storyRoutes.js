const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huashu_user_secret_key_2026';

// 获取剧本列表 (可不登录查看列表)
router.get('/stories', (req, res, next) => {
    // 尝试解析用户以附加进度信息
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch(e) {}
    }
    next();
}, storyController.getStories);

// 获取剧本详情、当前所在节点与选项
router.get('/stories/:storyId/progress', auth, storyController.getStoryProgress);

// 提交选项，获取下一节点
router.post('/stories/:storyId/choice', auth, storyController.makeChoice);

// 重玩剧本
router.post('/stories/:storyId/reset', auth, storyController.resetStory);

module.exports = router;
