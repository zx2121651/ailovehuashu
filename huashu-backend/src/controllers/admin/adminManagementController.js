const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      code: 200,
      success: true,
      message: '获取管理员列表成功',
      data: { list: admins, total: admins.length }
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { username, name, password, role, status } = req.body;

    // Check if exists
    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ code: 400, success: false, message: '用户名已存在' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '123456', salt);

    const admin = await prisma.admin.create({
      data: {
        username,
        name,
        password: hashedPassword,
        role,
        status
      },
      select: {
        id: true, username: true, name: true, role: true, status: true
      }
    });

    res.json({ code: 200, success: true, message: '创建管理员成功', data: admin });
  } catch (error) {
    console.error('创建管理员失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, role, status } = req.body;

    const admin = await prisma.admin.update({
      where: { id: Number(id) },
      data: { username, name, role, status },
      select: { id: true, username: true, name: true, role: true, status: true }
    });

    res.json({ code: 200, success: true, message: '更新管理员成功', data: admin });
  } catch (error) {
    console.error('更新管理员失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.admin.delete({ where: { id: Number(id) } });
    res.json({ code: 200, success: true, message: '删除管理员成功' });
  } catch (error) {
    console.error('删除管理员失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getAdmins, createAdmin, updateAdmin, deleteAdmin
};
