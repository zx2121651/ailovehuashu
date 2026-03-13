const prisma = require('../../utils/prisma');

/**
 * 获取所有盲盒内容
 */
exports.getAll = async (req, res) => {
  try {
    const cards = await prisma.blindBoxCard.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ code: 200, data: cards });
  } catch (error) {
    res.status(500).json({ code: 500, message: "获取失败" });
  }
};

/**
 * 创建新的盲盒内容
 */
exports.create = async (req, res) => {
  const { content, type, author, status } = req.body;
  if (!content) return res.status(400).json({ code: 400, message: "内容不能为空" });

  try {
    const card = await prisma.blindBoxCard.create({
      data: { content, type: type || 'QUOTE', author, status: status || 'ACTIVE' }
    });
    res.json({ code: 200, message: "创建成功", data: card });
  } catch (error) {
    res.status(500).json({ code: 500, message: "创建失败" });
  }
};

/**
 * 更新盲盒内容
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const card = await prisma.blindBoxCard.update({
      where: { id: parseInt(id) },
      data: updates
    });
    res.json({ code: 200, message: "更新成功", data: card });
  } catch (error) {
    res.status(500).json({ code: 500, message: "更新失败" });
  }
};

/**
 * 删除盲盒内容
 */
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.blindBoxCard.delete({
      where: { id: parseInt(id) }
    });
    res.json({ code: 200, message: "删除成功" });
  } catch (error) {
    res.status(500).json({ code: 500, message: "删除失败" });
  }
};
