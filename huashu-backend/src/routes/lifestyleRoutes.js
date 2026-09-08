const express = require('express');
const router = express.Router();
const lifestyle = require('../controllers/lifestyleController');
const auth = require('../middleware/auth');

// 恋爱人格测评（问卷源 / 提交结果）
router.get('/assessment/questions', lifestyle.getAssessmentQuestions);
router.post('/assessment/submit', auth, lifestyle.submitAssessment);

// 装扮中心（头像框/徽章 / 皮肤）
router.get('/skins', auth, lifestyle.getSkins);
router.post('/skins/purchase', auth, lifestyle.purchaseSkin);
router.post('/skins/apply', auth, lifestyle.applySkin);

// 虚拟礼物
router.post('/gifts/send', auth, lifestyle.sendGift);

// 纪念日 / 恋爱天数
router.get('/memorial', auth, lifestyle.getMemorial);
router.post('/memorial/save', auth, lifestyle.saveMemorial);

module.exports = router;