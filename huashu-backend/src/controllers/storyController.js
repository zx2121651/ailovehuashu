const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 获取剧本列表
exports.getStories = async (req, res) => {
  try {
    const stories = await prisma.interactiveStory.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    // 如果用户已登录，附带用户的进度状态
    if (req.user) {
      const progresses = await prisma.userStoryProgress.findMany({
        where: { userId: req.user.userId }
      });

      const storiesWithProgress = stories.map(story => {
        const prog = progresses.find(p => p.storyId === story.id);
        return {
          ...story,
          progressStatus: prog ? prog.status : 'NOT_STARTED',
          affectionScore: prog ? prog.affectionScore : 0
        };
      });
      return res.json({ success: true, data: storiesWithProgress });
    }

    res.json({ success: true, data: stories });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_POINTS') {
       return res.status(403).json({ success: false, message: '积分不足' });
    }
    console.error('getStoryProgress Error:', error);
    console.error('getStories Error:', error);
    res.status(500).json({ success: false, message: '获取剧本列表失败' });
  }
};

// 获取剧本详情与当前进度
exports.getStoryProgress = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;

    const story = await prisma.interactiveStory.findUnique({
      where: { id: parseInt(storyId) }
    });

    if (!story || story.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: '剧本不存在或已下架' });
    }

    let progress = await prisma.userStoryProgress.findUnique({
      where: { userId_storyId: { userId, storyId: parseInt(storyId) } }
    });

    // 如果没有进度，找到第一个节点作为开始
    if (!progress || !progress.currentNodeId) {
      const firstNode = await prisma.storyNode.findFirst({
        where: { storyId: parseInt(storyId) },
        orderBy: { id: 'asc' }
      });

      if (!firstNode) {
        return res.status(400).json({ success: false, message: '该剧本尚未配置内容' });
      }

      // 如果需要消耗积分（首次开始）
      await prisma.$transaction(async (tx) => {
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
      });
    }

    // 获取当前节点详情与选项
    const currentNode = await prisma.storyNode.findUnique({
      where: { id: progress.currentNodeId },
      include: { choices: true }
    });

    res.json({ success: true, data: { story, progress, currentNode } });
  } catch (error) {
    console.error('getStoryProgress Error:', error);
    res.status(500).json({ success: false, message: '获取剧本进度失败' });
  }
};

// 提交选择，推进剧情
exports.makeChoice = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { choiceId } = req.body;
    const userId = req.user.userId;

    const progress = await prisma.userStoryProgress.findUnique({
      where: { userId_storyId: { userId, storyId: parseInt(storyId) } }
    });

    if (!progress || progress.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: '无有效进度或已通关' });
    }

    const choice = await prisma.storyChoice.findUnique({
      where: { id: parseInt(choiceId) }
    });

    if (!choice || choice.nodeId !== progress.currentNodeId) {
      return res.status(400).json({ success: false, message: '无效的选项' });
    }

    const nextNodeId = choice.nextNodeId;
    let newStatus = 'IN_PROGRESS';
    let completedAt = null;

    if (!nextNodeId) {
      newStatus = 'COMPLETED';
      completedAt = new Date();
    } else {
      const nextNode = await prisma.storyNode.findUnique({ where: { id: nextNodeId } });
      if (nextNode && nextNode.isEnd) {
        newStatus = 'COMPLETED';
        completedAt = new Date();
      }
    }

    const updatedProgress = await prisma.userStoryProgress.update({
      where: { id: progress.id },
      data: {
        currentNodeId: nextNodeId || progress.currentNodeId,
        affectionScore: { increment: choice.affectionChange },
        status: newStatus,
        completedAt
      }
    });

    // 返回新节点
    let nextNodeData = null;
    if (nextNodeId) {
      nextNodeData = await prisma.storyNode.findUnique({
        where: { id: nextNodeId },
        include: { choices: true }
      });
    }

    res.json({ success: true, data: { progress: updatedProgress, currentNode: nextNodeData } });
  } catch (error) {
    console.error('makeChoice Error:', error);
    res.status(500).json({ success: false, message: '提交选择失败' });
  }
};

// 重置进度（重新开始）
exports.resetStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;

    const story = await prisma.interactiveStory.findUnique({
      where: { id: parseInt(storyId) }
    });

    await prisma.$transaction(async (tx) => {
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
    });

    res.json({ success: true, message: '重置成功' });
  } catch (error) {
    console.error('resetStory Error:', error);
    if (error.message === 'INSUFFICIENT_POINTS') {
      return res.status(403).json({ success: false, message: '积分不足，无法重新开始' });
    }
    res.status(500).json({ success: false, message: '重置进度失败' });
  }
};
