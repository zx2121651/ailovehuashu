const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const auditLog = require('../../utils/auditLogger');

const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
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
    const { username, name, password, role, status, permissions } = req.body;

    // Check if exists
    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ code: 400, success: false, message: '用户名已存在' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '123456', salt);

    // 权限可为数组或 JSON 字符串，统一存 JSON 字符串
    let permissionsStr = null;
    if (Array.isArray(permissions) && permissions.length > 0) {
      permissionsStr = JSON.stringify(permissions);
    } else if (typeof permissions === 'string' && permissions) {
      permissionsStr = permissions;
    }

    const admin = await prisma.admin.create({
      data: {
        username,
        name,
        password: hashedPassword,
        role,
        status,
        permissions: permissionsStr
      },
      select: {
        id: true, username: true, name: true, role: true, permissions: true, status: true
      }
    });

    auditLog({ admin: req.admin, action: 'CREATE', module: 'ADMIN', detail: `创建管理员 ${username}（角色 ${role}）`, req });
    res.json({ code: 200, success: true, message: '创建管理员成功', data: admin });
  } catch (error) {
    console.error('创建管理员失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, role, status, permissions } = req.body;

    const data = { username, name, role, status };

    // 若传入了 permissions 字段，则更新（数组转 JSON 字符串，空数组清空走角色默认）
    if (permissions !== undefined) {
      data.permissions = Array.isArray(permissions)
        ? (permissions.length > 0 ? JSON.stringify(permissions) : null)
        : permissions;
    }

    const admin = await prisma.admin.update({
      where: { id: Number(id) },
      data,
      select: { id: true, username: true, name: true, role: true, permissions: true, status: true }
    });

    // 区分权限变更与普通更新
    const isPermissionChange = permissions !== undefined;
    auditLog({
      admin: req.admin,
      action: isPermissionChange ? 'PERMISSION' : 'UPDATE',
      module: 'ADMIN',
      detail: isPermissionChange
        ? `调整管理员权限 ${username}（角色 ${role}，权限点=${Array.isArray(permissions) ? permissions.length : 0}）`
        : `更新管理员 ${username}（角色 ${role}，状态 ${status}）`,
      req
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
    // 记录被删除账号的用户名，便于审计
    const target = await prisma.admin.findUnique({
      where: { id: Number(id) },
      select: { username: true }
    });
    await prisma.admin.delete({ where: { id: Number(id) } });
    auditLog({ admin: req.admin, action: 'DELETE', module: 'ADMIN', detail: `删除管理员 ${target?.username || id}`, req });
    res.json({ code: 200, success: true, message: '删除管理员成功' });
  } catch (error) {
    console.error('删除管理员失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

// 获取全部权限点定义 + 各角色默认权限（供前端渲染权限勾选界面）
const getPermissionDefinitions = async (req, res) => {
  try {
    const { PERMISSIONS, ROLE_PERMISSIONS } = require('../../constants/permissions');

    // 分组格式化权限点，前端按模块展示
    const groups = [
      { key: 'dashboard', name: '仪表盘', permissions: [PERMISSIONS.DASHBOARD_VIEW] },
      { key: 'user', name: '用户管理', permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_EDIT, PERMISSIONS.USER_DELETE] },
      { key: 'content', name: '内容管理', permissions: [PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_DELETE] },
      { key: 'ugc', name: '内容审核', permissions: [PERMISSIONS.UGC_REVIEW, PERMISSIONS.UGC_DELETE] },
      { key: 'course', name: '课程管理', permissions: [PERMISSIONS.COURSE_CREATE, PERMISSIONS.COURSE_EDIT, PERMISSIONS.COURSE_DELETE] },
      { key: 'story', name: '互动剧本', permissions: [PERMISSIONS.STORY_CREATE, PERMISSIONS.STORY_EDIT, PERMISSIONS.STORY_DELETE] },
      { key: 'ops', name: '运营配置', permissions: [PERMISSIONS.OPS_MANAGE] },
      { key: 'moderate', name: '社区管理', permissions: [PERMISSIONS.CONTENT_MODERATE] },
      { key: 'order', name: '订单与佣金', permissions: [PERMISSIONS.ORDER_VIEW, PERMISSIONS.COMMISSION_REVIEW] },
      { key: 'system', name: '系统管理', permissions: [PERMISSIONS.SYSTEM_MANAGE] }
    ];

    const roles = [
      { value: 'SUPER_ADMIN', name: '超级管理员', permissions: ROLE_PERMISSIONS.SUPER_ADMIN },
      { value: 'ADMIN', name: '管理员', permissions: ROLE_PERMISSIONS.ADMIN },
      { value: 'EDITOR', name: '内容编辑', permissions: ROLE_PERMISSIONS.EDITOR },
      { value: 'REVIEWER', name: '审核员', permissions: ROLE_PERMISSIONS.REVIEWER },
      { value: 'GUEST', name: '访客', permissions: ROLE_PERMISSIONS.GUEST }
    ];

    res.json({ code: 200, success: true, data: { groups, roles } });
  } catch (error) {
    console.error('获取权限定义失败:', error);
    res.status(500).json({ code: 500, success: false, message: '服务器错误' });
  }
};

module.exports = {
  getAdmins, createAdmin, updateAdmin, deleteAdmin, getPermissionDefinitions
};
