const fs = require('fs');
const path = 'huashu-app/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
const searchStr = `<NavItem icon={<Home size={22} />} label="首页" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />`;
const replacement = `<NavItem icon={<Home size={22} />} label="首页" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavItem icon={<Star size={22} />} label="剧本杀" isActive={activeTab === 'story'} onClick={() => setActiveTab('story')} />`;
content = content.replace(searchStr, replacement);
fs.writeFileSync(path, content, 'utf8');
