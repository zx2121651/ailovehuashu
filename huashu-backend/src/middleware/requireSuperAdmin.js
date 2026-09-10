const requireSuperAdmin = require('./requireSystemManage');

// 兼容旧调用方：requireSuperAdmin 等价于要求系统管理权限
module.exports = requireSuperAdmin;