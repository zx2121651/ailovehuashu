const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();

    // Transform to an object based on keys
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({
      code: 200,
      success: true,
      message: '获取系统设置成功',
      data: settingsObj
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;

    const upsertPromises = Object.keys(newSettings).map(key => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: newSettings[key] },
        create: { key, value: newSettings[key] }
      });
    });

    await prisma.$transaction(upsertPromises);

    res.json({
      code: 200,
      success: true,
      message: '更新系统设置成功',
      data: newSettings
    });
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getSettings, updateSettings
};
