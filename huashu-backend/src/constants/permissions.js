// 后台管理系统权限点定义
// 采用 RBAC + 细粒度权限点模型，管理员可通过 role 继承默认权限，也可单独覆盖 permissions

// 所有权限点定义
const PERMISSIONS = {
  // Dashboard 仪表盘
  DASHBOARD_VIEW: 'dashboard:view',

  // 用户管理
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  // 内容管理（话术/分类/标签）
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',

  // UGC 内容审核
  UGC_REVIEW: 'ugc:review',
  UGC_DELETE: 'ugc:delete',

  // 团购/课程
  COURSE_CREATE: 'course:create',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',

  // 互动剧本
  STORY_CREATE: 'story:create',
  STORY_EDIT: 'story:edit',
  STORY_DELETE: 'story:delete',

  // 运营配置（Banner/盲盒/通知/跳转话术）
  OPS_MANAGE: 'ops:manage',

  // 社区管理（帖子/评论）
  CONTENT_MODERATE: 'content:moderate',

  // 订单/分销/佣金
  ORDER_VIEW: 'order:view',
  COMMISSION_REVIEW: 'commission:review',

  // 系统管理（管理员/日志/设置）
  SYSTEM_MANAGE: 'system:manage'
};

// 角色默认权限（当管理员未单独设置 permissions 时使用）
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  // 管理员：全部业务权限，不含系统管理
  ADMIN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.UGC_REVIEW,
    PERMISSIONS.UGC_DELETE,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.COURSE_DELETE,
    PERMISSIONS.STORY_CREATE,
    PERMISSIONS.STORY_EDIT,
    PERMISSIONS.STORY_DELETE,
    PERMISSIONS.OPS_MANAGE,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.COMMISSION_REVIEW
  ],
  // 内容编辑：可创建/编辑内容与审核
  EDITOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.UGC_REVIEW,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.STORY_CREATE,
    PERMISSIONS.STORY_EDIT,
    PERMISSIONS.CONTENT_MODERATE
  ],
  // 审核员：仅可编辑/审核，不可新建删除
  REVIEWER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.UGC_REVIEW,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.ORDER_VIEW
  ],
  // 访客：只读
  GUEST: [
    PERMISSIONS.DASHBOARD_VIEW
  ],
  // 导师（兼容旧 MENTOR 角色，只读 + 内容创建）
  MENTOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CONTENT_CREATE
  ]
};

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };