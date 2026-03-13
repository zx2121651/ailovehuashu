const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === 剧本管理 ===
exports.getStories = async (req, res) => {
    try {
        const stories = await prisma.interactiveStory.findMany({
            include: { _count: { select: { nodes: true, progresses: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: stories });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取剧本列表失败' });
    }
};

exports.createStory = async (req, res) => {
    try {
        const { title, description, coverImage, isPremium, pointsRequired, status } = req.body;
        const story = await prisma.interactiveStory.create({
            data: { title, description, coverImage, isPremium, pointsRequired, status }
        });
        res.json({ success: true, data: story });
    } catch (error) {
        res.status(500).json({ success: false, message: '创建剧本失败' });
    }
};

exports.updateStory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const story = await prisma.interactiveStory.update({ where: { id: parseInt(id) }, data });
        res.json({ success: true, data: story });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新剧本失败' });
    }
};

exports.deleteStory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.interactiveStory.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: '删除剧本成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '删除剧本失败，可能存在关联数据' });
    }
};

// === 节点管理 ===
exports.getNodes = async (req, res) => {
    try {
        const { storyId } = req.query;
        if (!storyId) return res.status(400).json({ success: false, message: '缺少 storyId' });

        const nodes = await prisma.storyNode.findMany({
            where: { storyId: parseInt(storyId) },
            include: { choices: true },
            orderBy: { id: 'asc' }
        });
        res.json({ success: true, data: nodes });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取节点列表失败' });
    }
};

exports.createNode = async (req, res) => {
    try {
        const { storyId, name, content, speakerName, imageUrl, isEnd } = req.body;
        const node = await prisma.storyNode.create({
            data: { storyId: parseInt(storyId), name, content, speakerName, imageUrl, isEnd }
        });
        res.json({ success: true, data: node });
    } catch (error) {
        res.status(500).json({ success: false, message: '创建节点失败' });
    }
};

exports.updateNode = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const node = await prisma.storyNode.update({ where: { id: parseInt(id) }, data });
        res.json({ success: true, data: node });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新节点失败' });
    }
};

exports.deleteNode = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.storyNode.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: '删除节点成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '删除节点失败' });
    }
};

// === 选项管理 ===
exports.createChoice = async (req, res) => {
    try {
        const { nodeId, content, nextNodeId, affectionChange } = req.body;
        const choice = await prisma.storyChoice.create({
            data: { nodeId: parseInt(nodeId), content, nextNodeId: parseInt(nextNodeId) || null, affectionChange }
        });
        res.json({ success: true, data: choice });
    } catch (error) {
        res.status(500).json({ success: false, message: '创建选项失败' });
    }
};

exports.updateChoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, nextNodeId, affectionChange } = req.body;
        const choice = await prisma.storyChoice.update({
            where: { id: parseInt(id) },
            data: { content, nextNodeId: parseInt(nextNodeId) || null, affectionChange }
        });
        res.json({ success: true, data: choice });
    } catch (error) {
        res.status(500).json({ success: false, message: '更新选项失败' });
    }
};

exports.deleteChoice = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.storyChoice.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: '删除选项成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '删除选项失败' });
    }
};

// === AI 自动生成剧本 ===
exports.generateStoryWithAI = async (req, res) => {
    try {
        const { theme } = req.body;
        if (!theme) return res.status(400).json({ success: false, message: '请提供剧情主题或背景' });

        // 在真实环境中，这里应该调用 OpenAI / Claude 等真实大模型接口，并带上 system prompt
        // 由于当前 aiController 也是 Mock 的，为了保证功能闭环可用，我们在这里生成一个标准的结构化 Mock 剧情网

        // 模拟 AI 思考和生成的时间
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 假设这是 AI 返回的 JSON 结构
        const aiGeneratedData = {
            title: `《\${theme}》`,
            description: "由 AI 自动生成的沉浸式情感分支剧本。你将面临关键的选择，每一步都影响着好感度的走向。",
            rewardPoints: 50,
            winScoreThreshold: 20,
            nodes: [
                {
                    tempId: 1, // 临时ID用于关联选项
                    name: "开场",
                    speakerName: "旁白",
                    content: `你正在\${theme}，突然对方向你打招呼：“嗨，好巧啊。”你现在的反应是？`,
                    isEnd: false,
                    choices: [
                        { content: "热情回应，并称赞对方今天的穿搭", nextTempId: 2, affectionChange: 15 },
                        { content: "冷淡点头，显得比较高冷", nextTempId: 3, affectionChange: -5 }
                    ]
                },
                {
                    tempId: 2,
                    name: "热情分支",
                    speakerName: "对方",
                    content: "哈哈谢谢，你真会说话！要不要一起喝杯咖啡？",
                    isEnd: false,
                    choices: [
                        { content: "好啊，我知道附近有一家不错的店", nextTempId: 4, affectionChange: 20 },
                        { content: "抱歉我还有事，下次吧", nextTempId: 5, affectionChange: -10 }
                    ]
                },
                {
                    tempId: 3,
                    name: "高冷分支",
                    speakerName: "对方",
                    content: "哦...看来你今天心情不太好，那我不打扰你了。",
                    isEnd: true, // 这是一个结局
                    choices: []
                },
                {
                    tempId: 4,
                    name: "完美结局",
                    speakerName: "旁白",
                    content: "你们在咖啡店聊得非常开心，发现彼此有很多共同爱好。这真是一个完美的开始！",
                    isEnd: true,
                    choices: []
                },
                {
                    tempId: 5,
                    name: "错过结局",
                    speakerName: "旁白",
                    content: "你转身离开，对方看着你的背影有些失落，可能你们就此错过了。",
                    isEnd: true,
                    choices: []
                }
            ]
        };

        // 使用事务将生成的 JSON 写入数据库，并映射 tempId 到真实的数据库 ID
        const result = await prisma.$transaction(async (tx) => {
            // 1. 创建剧本 (默认草稿)
            const story = await tx.interactiveStory.create({
                data: {
                    title: aiGeneratedData.title,
                    description: aiGeneratedData.description,
                    status: 'ACTIVE' // 直接发布
                }
            });

            // 2. 创建所有节点，并记录 tempId 到 真实Id 的映射
            const tempToRealNodeId = {};
            for (const nodeData of aiGeneratedData.nodes) {
                const createdNode = await tx.storyNode.create({
                    data: {
                        storyId: story.id,
                        name: nodeData.name,
                        speakerName: nodeData.speakerName,
                        content: nodeData.content,
                        isEnd: nodeData.isEnd
                    }
                });
                tempToRealNodeId[nodeData.tempId] = createdNode.id;
            }

            // 3. 创建所有选项，使用刚才的映射建立连接
            for (const nodeData of aiGeneratedData.nodes) {
                if (nodeData.choices && nodeData.choices.length > 0) {
                    const realNodeId = tempToRealNodeId[nodeData.tempId];
                    for (const choice of nodeData.choices) {
                        const realNextNodeId = choice.nextTempId ? tempToRealNodeId[choice.nextTempId] : null;
                        await tx.storyChoice.create({
                            data: {
                                nodeId: realNodeId,
                                content: choice.content,
                                affectionChange: choice.affectionChange,
                                nextNodeId: realNextNodeId
                            }
                        });
                    }
                }
            }

            return story;
        });

        res.json({ success: true, message: 'AI 生成剧本成功！', data: result });
    } catch (error) {
        console.error('AI Generate Error:', error);
        res.status(500).json({ success: false, message: 'AI 生成剧本失败' });
    }
};
