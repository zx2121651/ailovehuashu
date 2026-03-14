const fs = require('fs');

const appContextPath = 'huashu-app/src/context/AppContext.jsx';
let appCtx = fs.readFileSync(appContextPath, 'utf8');

// replace const fetchFavorites = async () => with function fetchFavorites()
appCtx = appCtx.replace(/const fetchFavorites = async \(\) => {/g, 'async function fetchFavorites() {');
fs.writeFileSync(appContextPath, appCtx);

const storyPlayPath = 'huashu-app/src/pages/story/StoryPlay.jsx';
let storyPlay = fs.readFileSync(storyPlayPath, 'utf8');

// Add setActiveTab to destructuring
if (!storyPlay.includes('setActiveTab')) {
  // if not included, nothing to do, but it is included based on previous grep
}

if (storyPlay.includes('activeParams') && !storyPlay.includes('setActiveTab')) {
    storyPlay = storyPlay.replace(/const { activeParams } = React.useContext\(AppContext\);/, 'const { activeParams, setActiveTab } = React.useContext(AppContext);');
}
fs.writeFileSync(storyPlayPath, storyPlay);
