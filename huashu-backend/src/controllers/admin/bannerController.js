const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditLog = require('../../utils/auditLogger');

const getBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取横幅列表成功',
      data: { list: banners, total: banners.length }
    });
  } catch (error) {
    console.error('获取横幅列表失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const createBanner = async (req, res) => {
  try {
    const { title, type, targetUrl, imageUrl, content, sortOrder, status, startTime, endTime } = req.body;

    const banner = await prisma.banner.create({
      data: {
        title, type, targetUrl, imageUrl, content, sortOrder, status,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '创建横幅成功',
      data: banner
    });
    auditLog({ admin: req.admin, action: 'CREATE', module: 'BANNER', detail: `新增${type === 'ANNOUNCEMENT' ? '公告' : '轮播'}：${title || ''}`, req });
  } catch (error) {
    console.error('创建横幅失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, targetUrl, imageUrl, content, sortOrder, status, startTime, endTime } = req.body;

    const banner = await prisma.banner.update({
      where: { id: Number(id) },
      data: {
        title, type, targetUrl, imageUrl, content, sortOrder, status,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null
      }
    });

    res.json({
      code: 200,
      success: true,
      message: '更新横幅成功',
      data: banner
    });
    auditLog({ admin: req.admin, action: 'UPDATE', module: 'BANNER', detail: `编辑${type === 'ANNOUNCEMENT' ? '公告' : '轮播'} #${id}`, req });
  } catch (error) {
    console.error('更新横幅失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({
      where: { id: Number(id) }
    });

    res.json({
      code: 200,
      success: true,
      message: '删除横幅成功'
    });
    auditLog({ admin: req.admin, action: 'DELETE', module: 'BANNER', detail: `删除轮播/公告 #${id}`, req });
  } catch (error) {
    console.error('删除横幅失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getBanners, createBanner, updateBanner, deleteBanner
};
