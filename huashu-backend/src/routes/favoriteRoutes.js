const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// 添加收藏
router.post('/favorites', auth, favoriteController.addFavorite);

// 取消收藏
router.delete('/favorites', auth, favoriteController.removeFavorite);

// 检查是否已收藏
router.get('/favorites/check', auth, favoriteController.checkFavoriteStatus);

// 获取我的收藏列表
router.get('/favorites/my', auth, favoriteController.getMyFavorites);

module.exports = router;
