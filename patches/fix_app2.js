const fs = require('fs');

const storyPlayPath = 'huashu-app/src/pages/story/StoryPlay.jsx';
let storyPlay = fs.readFileSync(storyPlayPath, 'utf8');

if (storyPlay.includes('activeParams') && !storyPlay.includes('setActiveTab')) {
    storyPlay = storyPlay.replace(/const { activeParams } = React.useContext\(AppContext\);/, 'const { activeParams, setActiveTab } = React.useContext(AppContext);');
}
fs.writeFileSync(storyPlayPath, storyPlay);

const appContextPath = 'huashu-app/src/context/AppContext.jsx';
let appCtx = fs.readFileSync(appContextPath, 'utf8');

// The issue with AppContext.jsx fetchFavorites is that it's defined inside the Provider component scope, but as an async function.
// the rule `react-hooks/immutability` or something might complain, but the error is "Error: Cannot access variable before it is declared"
// because the linter plugin `react-compiler` or similar treats function declarations inside functional components strictly?
// No, the error says: `fetchFavorites` is accessed before it is declared.
// So we just need to move `fetchFavorites` to the top of the AppProvider function body, right after `const [copiedId, setCopiedId] = useState(null);` maybe.

// Let's just use sed or regex to move it up.
const fetchFavoritesCode = `
  const fetchFavorites = async () => {
    try {
      const res = await api.getMyFavorites({ type: 'SCRIPT', limit: 100 });
      if (res && res.list) {
        setFavoriteIds(res.list.map(f => f.targetId));
      }
    } catch (error) {
      console.error('获取收藏失败', error);
    }
  };
`;

appCtx = appCtx.replace(/async function fetchFavorites\(\) \{[\s\S]*?获取收藏失败[\s\S]*?\}\s*\n\s*\};\n/, '');
appCtx = appCtx.replace(/const fetchFavorites = async \(\) => \{[\s\S]*?获取收藏失败[\s\S]*?\}\s*\n\s*\};\n/, '');

appCtx = appCtx.replace(/const \[toastMsg, setToastMsg\] = useState\(''\);/, 'const [toastMsg, setToastMsg] = useState(\'\');\n' + fetchFavoritesCode);

fs.writeFileSync(appContextPath, appCtx);
