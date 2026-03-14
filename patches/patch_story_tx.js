const fs = require('fs');
const path = 'huashu-backend/src/controllers/storyController.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Transactional initialization
const initRegex = /if \(!progress && story\.pointsRequired > 0\) {[\s\S]*?create: { userId, storyId: parseInt\(storyId\), currentNodeId: firstNode\.id, affectionScore: 0 }\n      }\);/m;
const initReplacement = `await prisma.$transaction(async (tx) => {
        if (!progress && story.pointsRequired > 0) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (user.points < story.pointsRequired) {
            throw new Error('INSUFFICIENT_POINTS');
          }
          await tx.user.update({
            where: { id: userId },
            data: { points: { decrement: story.pointsRequired } }
          });
        }
        progress = await tx.userStoryProgress.upsert({
          where: { userId_storyId: { userId, storyId: parseInt(storyId) } },
          update: { currentNodeId: firstNode.id, affectionScore: 0, status: 'IN_PROGRESS' },
          create: { userId, storyId: parseInt(storyId), currentNodeId: firstNode.id, affectionScore: 0 }
        });
      });`;
content = content.replace(initRegex, initReplacement);

// catch and translate INSUFFICIENT_POINTS
const getStoryProgressRegex = /catch \(error\) {/m;
const getStoryProgressReplacement = `catch (error) {
    if (error.message === 'INSUFFICIENT_POINTS') {
       return res.status(403).json({ success: false, message: '积分不足' });
    }
    console.error('getStoryProgress Error:', error);`;
content = content.replace(getStoryProgressRegex, getStoryProgressReplacement);


// 2. Transactional reset
const resetRegex = /if \(story && story\.pointsRequired > 0\) {[\s\S]*?completedAt: null }\n    }\);/m;
const resetReplacement = `await prisma.$transaction(async (tx) => {
      if (story && story.pointsRequired > 0) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user.points < story.pointsRequired) {
          throw new Error('INSUFFICIENT_POINTS');
        }
        await tx.user.update({
          where: { id: userId },
          data: { points: { decrement: story.pointsRequired } }
        });
      }

      const firstNode = await tx.storyNode.findFirst({
          where: { storyId: parseInt(storyId) },
          orderBy: { id: 'asc' }
      });

      await tx.userStoryProgress.update({
        where: { userId_storyId: { userId, storyId: parseInt(storyId) } },
        data: { currentNodeId: firstNode ? firstNode.id : null, affectionScore: 0, status: 'IN_PROGRESS', completedAt: null }
      });
    });`;
content = content.replace(resetRegex, resetReplacement);

const resetCatchRegex = /res\.status\(500\)\.json\({ success: false, message: '重置进度失败' }\);\n  }\n};/m;
const resetCatchReplacement = `if (error.message === 'INSUFFICIENT_POINTS') {
      return res.status(403).json({ success: false, message: '积分不足，无法重新开始' });
    }
    res.status(500).json({ success: false, message: '重置进度失败' });
  }
};`;
content = content.replace(resetCatchRegex, resetCatchReplacement);

fs.writeFileSync(path, content, 'utf8');
