const fs = require('fs');
const path = 'huashu-app/src/services/api.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /code: 200,\s*data: {\s*earnedPoints: 10,\s*isBigPrize: false,\s*totalPoints: 810,\s*continuousDays: 6,\s*blindBox: { type: 'QUOTE', content: '早安！这不仅是一个问候，更是我想你的证明。', author: '苏苏导师' }\s*}/;

const replacement = `code: 200,
      data: {
        earnedPoints: 10,
        isBigPrize: false,
        totalPoints: 810,
        continuousDays: 6,
        blindBox: { type: 'QUOTE', content: '早安！这不仅是一个问候，更是我想你的证明。', author: '苏苏导师' }
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
