const fs = require('fs');

const listPath = 'huashu-app/src/pages/story/StoryList.jsx';
let listContent = fs.readFileSync(listPath, 'utf8');
listContent = listContent.replace(/onClick={\(\) => navigate\(\`\/story\/\${story\.id}\`\)}/g, "onClick={() => setActiveTab('story_play', { id: story.id })}");
listContent = listContent.replace(/const navigate = useNavigate\(\);/g, "");
listContent = listContent.replace(/import { useNavigate } from 'react-router-dom';/g, "");
fs.writeFileSync(listPath, listContent, 'utf8');

const playPath = 'huashu-app/src/pages/story/StoryPlay.jsx';
let playContent = fs.readFileSync(playPath, 'utf8');
playContent = playContent.replace(/navigate\('\/login', { state: { returnUrl: `\/story\/\${id}` } }\);/g, "setActiveTab('home'); alert('请先登录');");
playContent = playContent.replace(/const navigate = useNavigate\(\);/g, "const { setActiveTab } = React.useContext(AppContext);");
playContent = playContent.replace(/import { useParams, useNavigate } from 'react-router-dom';/g, "");
playContent = playContent.replace(/onClick={\(\) => navigate\(-1\)}/g, "onClick={() => setActiveTab('story')}");
playContent = playContent.replace(/onClick={\(\) => navigate\('\/story'\)}/g, "onClick={() => setActiveTab('story')}");
fs.writeFileSync(playPath, playContent, 'utf8');
