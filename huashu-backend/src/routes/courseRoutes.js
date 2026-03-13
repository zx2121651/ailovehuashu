const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/recommended', courseController.getRecommendedCourses);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseDetail);

module.exports = router;
