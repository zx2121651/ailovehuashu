const express = require('express');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const requirePermission = require('../middleware/requirePermission');
const requireSystemManage = require('../middleware/requireSystemManage');
const { PERMISSIONS } = require('../constants/permissions');
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
router.get('/users', adminAuth, requirePermission(PERMISSIONS.USER_VIEW), userController.getUsers);
router.put('/users/:id', adminAuth, requirePermission(PERMISSIONS.USER_EDIT), userController.updateUser);
router.delete('/users/:id', adminAuth, requirePermission(PERMISSIONS.USER_DELETE), userController.deleteUser);

// --- Content Management ---
// Categories
router.get('/categories', adminAuth, contentController.getCategories);
router.post('/categories', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), contentController.createCategory);
router.put('/categories/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), contentController.updateCategory);
router.delete('/categories/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), contentController.deleteCategory);

// Scripts
router.get('/scripts', adminAuth, contentController.getScripts);
router.post('/scripts', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), contentController.createScript);
router.put('/scripts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), contentController.updateScript);
router.delete('/scripts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), contentController.deleteScript);

// --- UGC Management ---
router.get('/contributions', adminAuth, ugcController.getContributions);
router.post('/contributions/:id/review', adminAuth, requirePermission(PERMISSIONS.UGC_REVIEW), ugcController.reviewContribution);

// --- Orders Management ---
router.get('/orders', adminAuth, requirePermission(PERMISSIONS.ORDER_VIEW), orderController.getOrders);

// --- Notifications Management ---
router.get('/notifications', adminAuth, notificationController.getNotifications);
router.post('/notifications', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), notificationController.createNotification);
router.delete('/notifications/:id', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), notificationController.deleteNotification);

// --- Banners Management ---
router.get('/banners', adminAuth, bannerController.getBanners);
router.post('/banners', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), bannerController.createBanner);
router.put('/banners/:id', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), bannerController.updateBanner);
router.delete('/banners/:id', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), bannerController.deleteBanner);

// --- Feedbacks Management ---
router.get('/feedbacks', adminAuth, feedbackController.getFeedbacks);
router.put('/feedbacks/:id/reply', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), feedbackController.replyFeedback);
router.delete('/feedbacks/:id', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), feedbackController.deleteFeedback);

// --- Admins Management ---
// 权限定义接口，需系统管理权限
router.get('/permissions-definitions', adminAuth, requireSystemManage, adminManagementController.getPermissionDefinitions);
router.get('/admins', adminAuth, requireSystemManage, adminManagementController.getAdmins);
router.post('/admins', adminAuth, requireSystemManage, adminManagementController.createAdmin);
router.put('/admins/:id', adminAuth, requireSystemManage, adminManagementController.updateAdmin);
router.delete('/admins/:id', adminAuth, requireSystemManage, adminManagementController.deleteAdmin);

// --- System Logs ---
router.get('/logs', adminAuth, requireSuperAdmin, logController.getLogs);

// --- System Settings ---
router.get('/settings', adminAuth, requireSuperAdmin, settingController.getSettings);
router.put('/settings', adminAuth, requireSuperAdmin, settingController.updateSettings);

// --- Course Management ---
router.get('/courses', adminAuth, courseController.getCourses);
router.get('/courses/:id', adminAuth, courseController.getCourseById);
router.post('/courses', adminAuth, requirePermission(PERMISSIONS.COURSE_CREATE), courseController.createCourse);
router.put('/courses/:id', adminAuth, requirePermission(PERMISSIONS.COURSE_EDIT), courseController.updateCourse);
router.delete('/courses/:id', adminAuth, requirePermission(PERMISSIONS.COURSE_DELETE), courseController.deleteCourse);
router.patch('/courses/:id/recommend', adminAuth, requirePermission(PERMISSIONS.COURSE_EDIT), courseController.toggleRecommended);

// 分销管理
const commissionController = require('../controllers/admin/commissionController');
router.get('/withdrawals', adminAuth, requirePermission(PERMISSIONS.COMMISSION_REVIEW), commissionController.getWithdrawals);
router.post('/withdrawals/:id/review', adminAuth, requirePermission(PERMISSIONS.COMMISSION_REVIEW), commissionController.reviewWithdrawal);
router.get('/commissions', adminAuth, requirePermission(PERMISSIONS.COMMISSION_REVIEW), commissionController.getAllCommissionLogs);
router.get('/distributors', adminAuth, requirePermission(PERMISSIONS.COMMISSION_REVIEW), commissionController.getDistributors);

// --- Comments Management ---
router.get('/comments', adminAuth, commentAdminController.getComments);
router.patch('/comments/:id/status', adminAuth, requirePermission(PERMISSIONS.CONTENT_MODERATE), commentAdminController.updateCommentStatus);
router.delete('/comments/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_MODERATE), commentAdminController.deleteComment);

// --- Posts (Community) Management ---
router.get('/posts', adminAuth, postAdminController.getPosts);
router.post('/posts', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), postAdminController.createPost);
router.put('/posts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), postAdminController.updatePost);
router.patch('/posts/:id/status', adminAuth, requirePermission(PERMISSIONS.CONTENT_MODERATE), postAdminController.updatePostStatus);
router.delete('/posts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), postAdminController.deletePost);

// 每日盲盒管理
const blindBoxController = require('../controllers/admin/blindBoxController');
router.get('/blind-box', adminAuth, blindBoxController.getAll);
router.post('/blind-box', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), blindBoxController.create);
router.put('/blind-box/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), blindBoxController.update);
router.delete('/blind-box/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), blindBoxController.delete);

// --- Float Scripts ---
router.get('/float-scripts', adminAuth, requirePermission(PERMISSIONS.OPS_MANAGE), floatScriptController.adminGetFloatScripts);
router.post('/float-scripts', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), floatScriptController.adminCreateFloatScript);
router.put('/float-scripts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), floatScriptController.adminUpdateFloatScript);
router.delete('/float-scripts/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), floatScriptController.adminDeleteFloatScript);

// --- Script Tags Management ---
const scriptTagController = require('../controllers/admin/scriptTagController');
// 排序标签管理
router.get('/script-sort-tabs', adminAuth, scriptTagController.getScriptSortTabs);
router.post('/script-sort-tabs', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), scriptTagController.createScriptSortTab);
router.put('/script-sort-tabs/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), scriptTagController.updateScriptSortTab);
router.delete('/script-sort-tabs/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), scriptTagController.deleteScriptSortTab);
// 分类标签管理
router.get('/category-tags', adminAuth, scriptTagController.getAllCategoryTags);
router.get('/categories/:categoryId/tags', adminAuth, scriptTagController.getCategoryTags);
router.post('/category-tags', adminAuth, requirePermission(PERMISSIONS.CONTENT_CREATE), scriptTagController.createCategoryTag);
router.put('/category-tags/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_EDIT), scriptTagController.updateCategoryTag);
router.delete('/category-tags/:id', adminAuth, requirePermission(PERMISSIONS.CONTENT_DELETE), scriptTagController.deleteCategoryTag);

// --- Interactive Stories Management ---
const storyAdminController = require('../controllers/admin/storyAdminController');

// 剧本管理
router.post('/interactive-stories/generate', adminAuth, requirePermission(PERMISSIONS.STORY_CREATE), storyAdminController.generateStoryWithAI);
router.get('/interactive-stories', adminAuth, storyAdminController.getStories);
router.post('/interactive-stories', adminAuth, requirePermission(PERMISSIONS.STORY_CREATE), storyAdminController.createStory);
router.put('/interactive-stories/:id', adminAuth, requirePermission(PERMISSIONS.STORY_EDIT), storyAdminController.updateStory);
router.delete('/interactive-stories/:id', adminAuth, requirePermission(PERMISSIONS.STORY_DELETE), storyAdminController.deleteStory);

// 节点管理
router.get('/interactive-story-nodes', adminAuth, storyAdminController.getNodes);
router.post('/interactive-story-nodes', adminAuth, requirePermission(PERMISSIONS.STORY_EDIT), storyAdminController.createNode);
router.put('/interactive-story-nodes/:id', adminAuth, requirePermission(PERMISSIONS.STORY_EDIT), storyAdminController.updateNode);
router.delete('/interactive-story-nodes/:id', adminAuth, requirePermission(PERMISSIONS.STORY_DELETE), storyAdminController.deleteNode);

// 选项管理
router.post('/interactive-story-choices', adminAuth, requirePermission(PERMISSIONS.STORY_EDIT), storyAdminController.createChoice);
router.put('/interactive-story-choices/:id', adminAuth, requirePermission(PERMISSIONS.STORY_EDIT), storyAdminController.updateChoice);
router.delete('/interactive-story-choices/:id', adminAuth, requirePermission(PERMISSIONS.STORY_DELETE), storyAdminController.deleteChoice);

module.exports = router;
