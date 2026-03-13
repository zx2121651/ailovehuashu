const fs = require('fs');

const storyPlayPath = 'huashu-app/src/pages/story/StoryPlay.jsx';
let storyPlay = fs.readFileSync(storyPlayPath, 'utf8');

storyPlay = storyPlay.replace(/import \{ motion, AnimatePresence \} from 'framer-motion';/, 'import { AnimatePresence } from \'framer-motion\';');
storyPlay = storyPlay.replace(/\} catch \(err\) \{/g, '} catch (_err) {');
storyPlay = storyPlay.replace(/const story = data\?.story;/, '');

fs.writeFileSync(storyPlayPath, storyPlay);

const communityPath = 'huashu-app/src/views/Community.jsx';
let community = fs.readFileSync(communityPath, 'utf8');

community = community.replace(/const \[imageInput, setImageInput\] = useState\(''\);/, '');
community = community.replace(/const \[activeFilterTag, setActiveFilterTag\] = useState\('最新'\);/, 'const [activeFilterTag] = useState(\'最新\');');

fs.writeFileSync(communityPath, community);

const blindBoxPath = 'huashu-app/src/components/modals/BlindBoxModal.jsx';
let blindBox = fs.readFileSync(blindBoxPath, 'utf8');
blindBox = blindBox.replace(/\} catch \(error\) \{/g, '} catch (_error) {');
fs.writeFileSync(blindBoxPath, blindBox);

const pointsDrawerPath = 'huashu-app/src/components/modals/PointsDrawer.jsx';
let pointsDrawer = fs.readFileSync(pointsDrawerPath, 'utf8');
pointsDrawer = pointsDrawer.replace(/\} catch \(e\) \{/g, '} catch (_e) {');
fs.writeFileSync(pointsDrawerPath, pointsDrawer);
