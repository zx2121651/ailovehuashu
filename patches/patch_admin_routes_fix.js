const fs = require('fs');
const uiPath = 'huashu-admin/src/pages/InteractiveStoryManagement.jsx';
let uiContent = fs.readFileSync(uiPath, 'utf8');

// reset uiContent properly as the previous script might have overwritten it with backend content due to typo `uiContent = content.replace`
// Since we might have corrupted InteractiveStoryManagement.jsx, let's check its content.
