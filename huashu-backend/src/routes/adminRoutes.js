const express = require('express');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const authController = require('../controllers/admin/authController');
const statController = require('../controllers/admin/statController');
const userController = require('../controllers/admin/userController');
const contentController = require('../controllers/admin/contentController');
const ugcController = require('../controllers/admin/ugcController');
const orderController = require('../controllers/admin/orderController');
const notificationController = require('../controllers/admin/notificationController');
const bannerController = require('../controllers/admin/bannerController');
const feedbackController = require('../controllers/admin/feedbackController');
const adminManagementController = require('../controllers/admin/adminManagementController');
const logController = require('../controllers/admin/logController');
const settingController = require('../controllers/admin/settingController');
const courseController = require('../controllers/admin/courseController');
const commentAdminController = require('../controllers/admin/commentAdminController');
const postAdminController = require('../controllers/admin/postAdminController');
const floatScriptController = require('../controllers/floatScriptController');

// --- Auth Routes ---
router.post('/login', authController.login);
router.get('/me', adminAuth, authController.getMe);

// --- Dashboard Stats ---
router.get('/stats', adminAuth, statController.getDashboardStats);

// --- User Management ---
router.get('/users', adminAuth, requireSuperAdmin, userController.getUsers);
router.put('/users/:id', adminAuth, requireSuperAdmin, userController.updateUser);
router.delete('/users/:id', adminAuth, requireSuperAdmin, userController.deleteUser);

// --- Content Management ---
// Categories
router.get('/categories', adminAuth, contentController.getCategories);
router.post('/categories', adminAuth, requireSuperAdmin, contentController.createCategory);
router.put('/categories/:id', adminAuth, requireSuperAdmin, contentController.updateCategory);
router.delete('/categories/:id', adminAuth, requireSuperAdmin, contentController.deleteCategory);

// Scripts
router.get('/scripts', adminAuth, contentController.getScripts);
router.post('/scripts', adminAuth, contentController.createScript);
router.put('/scripts/:id', adminAuth, contentController.updateScript);
router.delete('/scripts/:id', adminAuth, requireSuperAdmin, contentController.deleteScript);

// --- UGC Management ---
router.get('/contributions', adminAuth, ugcController.getContributions);
router.post('/contributions/:id/review', adminAuth, ugcController.reviewContribution);

// --- Orders Management ---
router.get('/orders', adminAuth, requireSuperAdmin, orderController.getOrders);

// --- Notifications Management ---
router.get('/notifications', adminAuth, notificationController.getNotifications);
router.post('/notifications', adminAuth, requireSuperAdmin, notificationController.createNotification);
router.delete('/notifications/:id', adminAuth, requireSuperAdmin, notificationController.deleteNotification);

// --- Banners Management ---
router.get('/banners', adminAuth, requireSuperAdmin, bannerController.getBanners);
router.post('/banners', adminAuth, requireSuperAdmin, bannerController.createBanner);
router.put('/banners/:id', adminAuth, requireSuperAdmin, bannerController.updateBanner);
router.delete('/banners/:id', adminAuth, requireSuperAdmin, bannerController.deleteBanner);

// --- Feedbacks Management ---
router.get('/feedbacks', adminAuth, feedbackController.getFeedbacks);
router.put('/feedbacks/:id/reply', adminAuth, feedbackController.replyFeedback);
router.delete('/feedbacks/:id', adminAuth, requireSuperAdmin, feedbackController.deleteFeedback);

// --- Admins Management ---
router.get('/admins', adminAuth, requireSuperAdmin, adminManagementController.getAdmins);
router.post('/admins', adminAuth, requireSuperAdmin, adminManagementController.createAdmin);
router.put('/admins/:id', adminAuth, requireSuperAdmin, adminManagementController.updateAdmin);
router.delete('/admins/:id', adminAuth, requireSuperAdmin, adminManagementController.deleteAdmin);

// --- System Logs ---
router.get('/logs', adminAuth, requireSuperAdmin, logController.getLogs);

// --- System Settings ---
router.get('/settings', adminAuth, requireSuperAdmin, settingController.getSettings);
router.put('/settings', adminAuth, requireSuperAdmin, settingController.updateSettings);

// --- Course Management ---
router.get('/courses', adminAuth, courseController.getCourses);
router.get('/courses/:id', adminAuth, courseController.getCourseById);
router.post('/courses', adminAuth, courseController.createCourse);
router.put('/courses/:id', adminAuth, courseController.updateCourse);
router.delete('/courses/:id', adminAuth, requireSuperAdmin, courseController.deleteCourse);
router.patch('/courses/:id/recommend', adminAuth, requireSuperAdmin, courseController.toggleRecommended);

// 分销管理
const commissionController = require('../controllers/admin/commissionController');
router.get('/withdrawals', adminAuth, requireSuperAdmin, commissionController.getWithdrawals);
router.post('/withdrawals/:id/review', adminAuth, requireSuperAdmin, commissionController.reviewWithdrawal);
router.get('/commissions', adminAuth, requireSuperAdmin, commissionController.getAllCommissionLogs);
router.get('/distributors', adminAuth, requireSuperAdmin, commissionController.getDistributors);

// --- Comments Management ---
router.get('/comments', adminAuth, commentAdminController.getComments);
router.patch('/comments/:id/status', adminAuth, commentAdminController.updateCommentStatus);
router.delete('/comments/:id', adminAuth, requireSuperAdmin, commentAdminController.deleteComment);

// --- Posts (Community) Management ---
router.get('/posts', adminAuth, postAdminController.getPosts);
router.post('/posts', adminAuth, postAdminController.createPost);
router.put('/posts/:id', adminAuth, postAdminController.updatePost);
router.patch('/posts/:id/status', adminAuth, postAdminController.updatePostStatus);
router.delete('/posts/:id', adminAuth, requireSuperAdmin, postAdminController.deletePost);

// 每日盲盒管理
const blindBoxController = require('../controllers/admin/blindBoxController');
router.get('/blind-box', adminAuth, blindBoxController.getAll);
router.post('/blind-box', adminAuth, requireSuperAdmin, blindBoxController.create);
router.put('/blind-box/:id', adminAuth, requireSuperAdmin, blindBoxController.update);
router.delete('/blind-box/:id', adminAuth, requireSuperAdmin, blindBoxController.delete);

// --- Float Scripts ---
router.get('/float-scripts', adminAuth, requireSuperAdmin, floatScriptController.adminGetFloatScripts);
router.post('/float-scripts', adminAuth, requireSuperAdmin, floatScriptController.adminCreateFloatScript);
router.put('/float-scripts/:id', adminAuth, requireSuperAdmin, floatScriptController.adminUpdateFloatScript);
router.delete('/float-scripts/:id', adminAuth, requireSuperAdmin, floatScriptController.adminDeleteFloatScript);

// --- Script Tags Management ---
const scriptTagController = require('../controllers/admin/scriptTagController');
// 排序标签管理
router.get('/script-sort-tabs', adminAuth, scriptTagController.getScriptSortTabs);
router.post('/script-sort-tabs', adminAuth, requireSuperAdmin, scriptTagController.createScriptSortTab);
router.put('/script-sort-tabs/:id', adminAuth, requireSuperAdmin, scriptTagController.updateScriptSortTab);
router.delete('/script-sort-tabs/:id', adminAuth, requireSuperAdmin, scriptTagController.deleteScriptSortTab);
// 分类标签管理
router.get('/category-tags', adminAuth, scriptTagController.getAllCategoryTags);
router.get('/categories/:categoryId/tags', adminAuth, scriptTagController.getCategoryTags);
router.post('/category-tags', adminAuth, requireSuperAdmin, scriptTagController.createCategoryTag);
router.put('/category-tags/:id', adminAuth, requireSuperAdmin, scriptTagController.updateCategoryTag);
router.delete('/category-tags/:id', adminAuth, requireSuperAdmin, scriptTagController.deleteCategoryTag);

// --- Interactive Stories Management ---
const storyAdminController = require('../controllers/admin/storyAdminController');

// 剧本管理
router.post('/interactive-stories/generate', adminAuth, requireSuperAdmin, storyAdminController.generateStoryWithAI);
router.get('/interactive-stories', adminAuth, storyAdminController.getStories);
router.post('/interactive-stories', adminAuth, requireSuperAdmin, storyAdminController.createStory);
router.put('/interactive-stories/:id', adminAuth, requireSuperAdmin, storyAdminController.updateStory);
router.delete('/interactive-stories/:id', adminAuth, requireSuperAdmin, storyAdminController.deleteStory);

// 节点管理
router.get('/interactive-story-nodes', adminAuth, storyAdminController.getNodes);
router.post('/interactive-story-nodes', adminAuth, requireSuperAdmin, storyAdminController.createNode);
router.put('/interactive-story-nodes/:id', adminAuth, requireSuperAdmin, storyAdminController.updateNode);
router.delete('/interactive-story-nodes/:id', adminAuth, requireSuperAdmin, storyAdminController.deleteNode);

// 选项管理
router.post('/interactive-story-choices', adminAuth, requireSuperAdmin, storyAdminController.createChoice);
router.put('/interactive-story-choices/:id', adminAuth, requireSuperAdmin, storyAdminController.updateChoice);
router.delete('/interactive-story-choices/:id', adminAuth, requireSuperAdmin, storyAdminController.deleteChoice);

module.exports = router;
