const fs = require('fs');

const uiPath = 'huashu-admin/src/pages/InteractiveStoryManagement.jsx';
let uiContent = fs.readFileSync(uiPath, 'utf8');

uiContent = uiContent.replace(/\/stories\/generate/g, '/interactive-stories/generate');
uiContent = uiContent.replace(/\/stories\//g, '/interactive-stories/');
uiContent = uiContent.replace(/\/stories/g, '/interactive-stories');

uiContent = uiContent.replace(/\/story-nodes\//g, '/interactive-story-nodes/');
uiContent = uiContent.replace(/\/story-nodes/g, '/interactive-story-nodes');

uiContent = uiContent.replace(/\/story-choices\//g, '/interactive-story-choices/');
uiContent = uiContent.replace(/\/story-choices/g, '/interactive-story-choices');

fs.writeFileSync(uiPath, uiContent, 'utf8');
