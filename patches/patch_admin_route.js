const fs = require('fs');
const path = 'huashu-backend/src/routes/adminRoutes.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /router\.get\('\/stories', adminAuth, storyAdminController\.getStories\);/;
content = content.replace(regex, `router.post('/stories/generate', adminAuth, requireSuperAdmin, storyAdminController.generateStoryWithAI);\nrouter.get('/stories', adminAuth, storyAdminController.getStories);`);

fs.writeFileSync(path, content, 'utf8');
