const fs = require('fs');

const file = 'src/controllers/userController.js';
let content = fs.readFileSync(file, 'utf8');

const search = `/**
 * 微信小程序登录 (模拟)
 * 接收微信的 code，返回 token 和用户信息
 */
exports.wxLogin = async (req, res) => {
  const { code, inviteCode } = req.body;

  if (!code) {
    return res.status(400).json({ code: 400, message: "缺少 code 参数" });
  }

  try {
    // 模拟微信 openId 为 code 的值
    const mockOpenId = \`wx_\${code}\`;
    let user = null;

    // 查找用户是否已存在
    user = await prisma.user.findUnique({
      where: { openId: mockOpenId }
    });

    // 如果是新用户，则注册
    if (!user) {
      // 检查是否有合法的邀请人
      let inviterId = null;
      if (inviteCode) {
        const inviter = await prisma.user.findUnique({
          where: { inviteCode }
        });
        if (inviter) {
          inviterId = inviter.id;
        }
      }

      user = await prisma.user.create({
        data: {
          openId: mockOpenId,
          name: \`微信用户_\${Math.floor(Math.random() * 10000)}\`,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + mockOpenId,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          inviterId
        }
      });
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user.id, openId: user.openId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
};`;

const replace = `/**
 * 【真实实现】微信小程序登录
 * 调用微信官方 jscode2session 接口，利用 code 换取真实 OpenId 和 SessionKey
 */
exports.wxLogin = async (req, res) => {
  const { code, inviteCode, userInfo } = req.body; // userInfo 为前端 (如 uni.getUserProfile) 获取到的明文昵称和头像

  if (!code) {
    return res.status(400).json({ code: 400, message: "缺少 code 参数" });
  }

  try {
    // 1. 获取环境变量中的微信配置
    const appId = process.env.WX_APP_ID;
    const appSecret = process.env.WX_APP_SECRET;

    if (!appId || !appSecret) {
      console.warn("环境变量缺失 WX_APP_ID 或 WX_APP_SECRET，降级为 Mock 模式");
    }

    let openId = \`wx_mock_\${code}\`; // 降级备用
    let sessionKey = 'mock_session_key';

    // 2. 向微信服务器发情真实请求
    if (appId && appSecret) {
      const wxApiUrl = \`https://api.weixin.qq.com/sns/jscode2session?appid=\${appId}&secret=\${appSecret}&js_code=\${code}&grant_type=authorization_code\`;
      const response = await fetch(wxApiUrl);
      const wxResult = await response.json();

      if (wxResult.errcode) {
        throw new Error(\`微信接口返回错误: \${wxResult.errmsg}\`);
      }
      openId = wxResult.openid;
      sessionKey = wxResult.session_key;
    }

    // 3. 处理邀请人逻辑 (防止自己邀请自己，防止环形邀请)
    let validInviterId = null;
    if (inviteCode) {
      const inviter = await prisma.user.findUnique({
        where: { inviteCode }
      });
      // 只有邀请人存在，且邀请的不是同一个 openId 的老用户时才绑定
      if (inviter && inviter.openId !== openId) {
        validInviterId = inviter.id;
      }
    }

    // 4. 数据库事务：利用 Prisma 的 upsert 原理实现“不存在则创建，存在则更新部分信息”
    // 注意：如果您的表结构经常改变，建议使用 findUnique + create 这种分离式写法以便处理复杂的关联关系
    let user = await prisma.user.findUnique({
      where: { openId }
    });

    if (!user) {
      // 新用户注册
      user = await prisma.user.create({
        data: {
          openId,
          name: userInfo?.nickName || \`微信用户_\${openId.substring(openId.length - 4)}\`,
          avatar: userInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + openId,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          inviterId: validInviterId,
          // 将 sessionKey 存入表（如需后续解析手机号密文），需确保 user 模型有 sessionKey 字段，或存入 redis
        }
      });
    } else {
      // 老用户更新昵称头像 (可选)
      if (userInfo?.nickName && userInfo.nickName !== user.name) {
        user = await prisma.user.update({
          where: { openId },
          data: {
            name: userInfo.nickName,
            avatar: userInfo.avatarUrl || user.avatar
          }
        });
      }
    }

    // 5. 签发自有业务系统的 JWT Token
    const token = jwt.sign(
      { userId: user.id, openId: user.openId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isVip: user.isVip,
          vipExpireAt: user.vipExpireAt,
          balance: user.balance
        }
      }
    });
  } catch (error) {
    console.error('真实微信登录逻辑异常:', error);
    res.status(500).json({ code: 500, message: '登录失败: ' + error.message });
  }
};`;

if(content.includes('exports.wxLogin')) {
  content = content.replace(search, replace);
  fs.writeFileSync(file, content, 'utf8');
  console.log('wxLogin 真实逻辑替换成功');
} else {
  console.error('没找到 wxLogin');
}
