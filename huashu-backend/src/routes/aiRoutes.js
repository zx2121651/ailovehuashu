const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 路由: POST /api/v1/ai/chat
router.post('/ai/chat', aiController.generateReply);

// 路由: POST /api/v1/ai/context-reply (语境粘贴生成·多风格)
router.post('/ai/context-reply', aiController.generateContextReply);

module.exports = router;
