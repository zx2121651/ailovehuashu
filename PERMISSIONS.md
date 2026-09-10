# 后台管理系统权限说明

> 面向运营/管理员：说明「话术大师 Pro 后台」的角色、权限点，以及如何分配。

## 一、权限模型

采用 **RBAC + 细粒度权限点** 双层模型：

- 每个管理员绑定一个 **角色(Role)**，角色决定默认权限集合。
- 可对单个管理员再单独指定 **权限点(Permissions)** 进行覆盖（存于 `Admin.permissions`，JSON 字符串；为空则按角色默认权限）。
- **超级管理员(SUPER_ADMIN)始终拥有全部权限**，忽略其 `permissions` 字段。

优先级：`管理员自定义权限点 > 角色默认权限`，且 `SUPER_ADMIN` 恒为全权限。

## 二、权限点清单

| 权限点 | 说明 | 对应后台模块 |
| --- | --- | --- |
| `dashboard:view` | 查看仪表盘 | 仪表盘 |
| `user:view` | 查看用户 | 用户管理 |
| `user:edit` | 编辑用户 | 用户管理 |
| `user:delete` | 删除/注销用户 | 用户管理 |
| `content:create` | 新增话术/分类/标签 | 内容运营 |
| `content:edit` | 编辑话术/分类/标签 | 内容运营 |
| `content:delete` | 删除话术/分类/标签 | 内容运营 |
| `ugc:review` | 审核 UGC 投稿 | UGC 审核 |
| `ugc:delete` | 删除 UGC 投稿 | UGC 审核 |
| `course:create` | 新增课程 | 课程管理 |
| `course:edit` | 编辑课程 | 课程管理 |
| `course:delete` | 删除课程 | 课程管理 |
| `story:create` | 新增互动剧本 | 互动故事 |
| `story:edit` | 编辑互动剧本 | 互动故事 |
| `story:delete` | 删除互动剧本 | 互动故事 |
| `ops:manage` | 运营配置（轮播图/盲盒/悬浮窗） | 运营配置 |
| `content:moderate` | 社区管理（帖子/评论/社区分类） | 审核与互动 |
| `order:view` | 查看订单 | 订单管理 |
| `commission:review` | 分销/提现审核 | 分销管理 |
| `system:manage` | 系统管理（管理员/日志/设置/推送） | 系统安全 |

## 三、角色默认权限

| 角色 | 说明 | 默认权限 |
| --- | --- | --- |
| `SUPER_ADMIN` | 超级管理员 | **全部权限**（不可被删除） |
| `ADMIN` | 管理员 | 除 `system:manage` 外的全部业务权限 |
| `EDITOR` | 内容编辑 | 仪表盘 + 内容增/改 + UGC 审核 + 课程增/改 + 剧本增/改 + 社区管理 |
| `REVIEWER` | 审核员 | 仪表盘 + 内容改 + UGC 审核 + 社区管理 + 订单查看 |
| `GUEST` | 访客 | 仅仪表盘查看 |
| `MENTOR` | 导师（兼容旧角色） | 仪表盘 + 内容创建 |

## 四、后端强制（最终防线）

- `authController.login` / `getMe` 返回当前管理员 `role + permissions`。
- `adminAuth` 每次请求从数据库加载管理员完整信息（含 `permissions`），写入 `req.admin`。
- `requirePermission(P)` → 校验 `req.admin` 是否拥有权限点 `P`。
- `requireSystemManage` / `requireSuperAdmin` → 校验系统级权限（`system:manage`）。
- 路由示例（`routes/adminRoutes.js`）：
  - `GET /users` → `requirePermission(user:view)`
  - `PUT /users/:id` → `requirePermission(user:edit)`
  - `POST /categories` → `requirePermission(content:create)`
  - `GET /admins` → `requireSystemManage`

> 注意：前端隐藏/禁用只是体验优化，**真正的权限控制以后端中间件为准**。

## 五、前端控制

- 菜单过滤：`AdminLayout.jsx` 用 `hasPermission(admin, PERMISSIONS.xxx)` 控制导航显示。
- 路由守卫：`App.jsx` 用 `GuardRoute`（基于 `PermissionGuard`）在未授权时跳转 `/403` 页面。
- 按钮级控制：页面内用 `<PermissionGuard permission={P}>` 包裹「编辑/删除/新增」等操作按钮，无权限则隐藏。
- 使用方法：
  ```jsx
  import { PERMISSIONS } from '../utils/permissions';
  import PermissionGuard from '../components/PermissionGuard';

  const { can } = usePermission(); // 或直接 can(PERMISSIONS.USER_EDIT)
  ```

## 六、操作日志审计

- 后台管理员的关键操作写入 `AdminLog` 表：登录成功/失败、创建/更新/删除账号、权限变更等。
- 动作类型：`LOGIN / CREATE / UPDATE / DELETE / APPROVE / REJECT / PERMISSION`。
- 模块：`AUTH / CONTENT / USER / UGC / ADMIN / ORDER / SETTINGS`。
- 「系统安全 → 操作日志」页可搜索、按模块过滤、导出。

## 七、上线步骤

1. 启动数据库后应用 schema（新增 `Admin.permissions` 字段）：
   ```bash
   cd huashu-backend
   npx prisma db push
   npx prisma db seed        # 确保 admin 账号 = SUPER_ADMIN
   ```
2. 用超级管理员登录 → 「系统安全 → 管理员权限」：
   - 新增/编辑账号时选择角色，可进一步勾选细粒度权限点覆盖默认。
   - 只有拥有 `system:manage` 的管理员才能进入该管理页面。

## 八、相关文件

- 后端：`huashu-backend/src/constants/permissions.js`（权限点与角色默认）
- 后端：`huashu-backend/src/utils/permissionHelper.js`、`src/middleware/requirePermission.js`、`src/middleware/requireSystemManage.js`、`src/middleware/adminAuth.js`
- 后端：`huashu-backend/src/utils/auditLogger.js`
- 前端：`huashu-admin/src/utils/permissions.js`、`src/hooks/usePermission.js`、`src/components/PermissionGuard.jsx`、`src/pages/Forbidden.jsx`