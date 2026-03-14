const fs = require('fs');

const routesPath = 'huashu-backend/src/routes/adminRoutes.js';
let content = fs.readFileSync(routesPath, 'utf8');

// Replace routes from /stories to /interactive-stories to avoid conflict with standard scripts/articles
content = content.replace(/\/stories\/generate/g, '/interactive-stories/generate');
content = content.replace(/\/stories\//g, '/interactive-stories/');
content = content.replace(/\/stories/g, '/interactive-stories');

content = content.replace(/\/story-nodes\//g, '/interactive-story-nodes/');
content = content.replace(/\/story-nodes/g, '/interactive-story-nodes');

content = content.replace(/\/story-choices\//g, '/interactive-story-choices/');
content = content.replace(/\/story-choices/g, '/interactive-story-choices');

fs.writeFileSync(routesPath, content, 'utf8');

const uiPath = 'huashu-admin/src/pages/InteractiveStoryManagement.jsx';
let uiContent = fs.readFileSync(uiPath, 'utf8');

uiContent = uiContent.replace(/\/stories\/generate/g, '/interactive-stories/generate');
uiContent = uiContent.replace(/\/stories\//g, '/interactive-stories/');
uiContent = uiContent.replace(/\/stories/g, '/interactive-stories');

uiContent = uiContent.replace(/\/story-nodes\//g, '/interactive-story-nodes/');
uiContent = content.replace(/\/story-nodes/g, '/interactive-story-nodes'); // note: here we should use uiContent

uiContent = uiContent.replace(/\/story-choices\//g, '/interactive-story-choices/');
uiContent = uiContent.replace(/\/story-choices/g, '/interactive-story-choices');

fs.writeFileSync(uiPath, uiContent, 'utf8');
