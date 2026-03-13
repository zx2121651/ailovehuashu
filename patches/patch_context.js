const fs = require('fs');
const path = 'huashu-app/src/context/AppContext.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('activeParams')) {
  content = content.replace(/const \[activeTab, setActiveTab\] = useState\('home'\);/, "const [activeTab, _setActiveTab] = useState('home');\n  const [activeParams, setActiveParams] = useState(null);\n  const setActiveTab = (tab, params = null) => { _setActiveTab(tab); setActiveParams(params); };");
  content = content.replace(/activeTab, setActiveTab,/, "activeTab, setActiveTab, activeParams,");
  fs.writeFileSync(path, content, 'utf8');
}
