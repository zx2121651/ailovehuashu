const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// 路由: GET /api/v1/articles
router.get('/articles', serviceController.getArticles);

// 路由: GET /api/v1/articles/:id
router.get('/articles/:id', serviceController.getArticleById);

// 路由: GET /api/v1/courses/featured
router.get('/courses/featured', serviceController.getFeaturedCourse);

module.exports = router;
