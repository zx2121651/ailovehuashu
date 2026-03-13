const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 路由: POST /api/v1/ai/chat
router.post('/ai/chat', aiController.generateReply);

module.exports = router;
