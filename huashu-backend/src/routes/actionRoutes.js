const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');

// 路由: POST /api/v1/contributions
router.post('/contributions', actionController.submitContribution);

// 路由: GET /api/v1/contributions/my
router.get('/contributions/my', actionController.getMyContributions);

module.exports = router;
