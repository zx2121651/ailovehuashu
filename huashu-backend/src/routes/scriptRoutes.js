const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/scriptController');

// 路由: GET /api/v1/categories
router.get('/categories', scriptController.getCategories);

// 路由: GET /api/v1/categories/:categoryId/tags
// 注意：这个路由必须放在 /scripts/:id 之前，否则会被 /scripts/:id 拦截
router.get('/categories/:categoryId/tags', scriptController.getCategoryTags);

// 路由: GET /api/v1/scripts/hot-searches
router.get('/scripts/hot-searches', scriptController.getHotSearches);

// 路由: GET /api/v1/scripts/sort-tabs
router.get('/scripts/sort-tabs', scriptController.getScriptSortTabs);

// 路由: GET /api/v1/scripts
router.get('/scripts', scriptController.getScripts);

// 路由: GET /api/v1/scripts/:id
// 注意：这个路由会匹配任何 /scripts/xxx 的路径，所以具体路径要放在它之前
router.get('/scripts/:id', scriptController.getScriptById);

module.exports = router;
