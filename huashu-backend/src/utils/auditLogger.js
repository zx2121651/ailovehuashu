const prisma = require('./prisma');

/**
 * 操作审计日志写入
 * @param {object} opts
 * @param {object} opts.admin 当前操作者 (username/name)
 * @param {string} opts.action CREATE | UPDATE | DELETE | LOGIN | APPROVE | REJECT | PERMISSION
 * @param {string} opts.module CONTENT | USER | AUTH | SETTINGS | UGC | ADMIN | ORDER
 * @param {string} opts.detail 操作描述
 * @param {object} opts.req 请求对象(用于取 IP)
 * @param {string} opts.status success | fail
 */
const auditLog = async ({ admin, action, module, detail, req, status = 'success' }) => {
  const username = (admin && (admin.username || admin.name)) || 'unknown';
  try {
    await prisma.adminLog.create({
      data: {
        adminUsername: username,
        action,
        module,
        detail: detail || '',
        ip: (req && (req.ip || (req.connection && req.connection.remoteAddress))) || null,
        status
      }
    });
  } catch (e) {
    // 审计日志写入失败不应阻断主流程
    console.error('审计日志写入失败:', e.message);
  }
};

module.exports = auditLog;