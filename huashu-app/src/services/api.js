// API 服务层 - 调用后端接口
const API_BASE = '/api/v1';

// 通用请求函数
async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE}${url}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// 获取分类列表
export async function getCategories() {
  const data = await request('/categories');
  return data.data || [];
}

// 获取话术库排序标签
export async function getScriptSortTabs() {
  const data = await request('/scripts/sort-tabs');
  return data.data || [];
}

// 获取指定分类的标签
export async function getCategoryTags(categoryId) {
  const data = await request(`/categories/${categoryId}/tags`);
  return data.data || [];
}

// 获取热搜词
export async function getHotSearches() {
  const data = await request('/scripts/hot-searches');
  return data.data || [];
}

// 获取话术列表
export async function getScripts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/scripts?${queryString}` : '/scripts';
  const data = await request(url);
  return data.data || { list: [], total: 0 };
}

// 获取单条话术详情
export async function getScriptById(id) {
  const data = await request(`/scripts/${id}`);
  return data.data;
}

// 获取文章列表
export async function getArticles() {
  const data = await request('/articles');
  return data.data || [];
}

// 获取单篇文章详情
export async function getArticleById(id) {
  const data = await request(`/articles/${id}`);
  return data.data;
}

// 获取精选课程
export async function getFeaturedCourse() {
  const data = await request('/courses/featured');
  return data.data;
}

// 获取推荐课程
export async function getRecommendedCourses() {
  const data = await request('/courses/recommended');
  return data.data || [];
}

// 获取用户资料
export async function getUserProfile() {
  try {
    const data = await request('/user/profile');
    return data.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock user profile:', error);
    // 降级使用 Mock 数据以保证本地 UI 正常渲染
    return {
      id: 'mock_user_123',
      name: '测试导师',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
      role: 'MENTOR',
      rank: '情圣',
      points: 800,
      continuousSignDays: 5,
      lastSignInAt: null // 强制弹出盲盒
    };
  }
}

// AI 对话
export async function chatWithAI(prompt) {
  const data = await request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return data.data;
}

// 语境粘贴生成（多风格）+ 情绪阶梯 + 个性化
export async function generateContextReply(payload) {
  try {
    const data = await request('/ai/context-reply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  } catch (error) {
    console.warn('Backend unavailable, mock context reply:', error);
    const picked = (payload.context || '').slice(0, 12);
    const styles = [
      { key: '高情商', color: 'blue', label: '方案A · 高情商', text: `${picked}…你这句话让我对你又多了一层新的认识，遇见你真的很特别。` },
      { key: '幽默接梗', color: 'purple', label: '方案B · 幽默接梗', text: `哈哈被你句话说到了，小本本记下了。下次见面你得请我喝奶茶。` },
      { key: '直球勇', color: 'red', label: '方案C · 直球勇', text: `说认真的，我挺喜欢和你聊天，缺一个继续聊下去的机会，你会给吗？` },
      { key: '撒娇软化', color: 'pink', label: '方案D · 撒娇软化', text: `哼，你还学会套路我啦！不过这句话我先收藏了~` }
    ];
    return {
      emotionLadder: ['共情回应：让TA觉得被懂', '价值赋能：给到安全感与期待', '试探拉升：自然递进关系'],
      analysis: `对方说“${picked || '这句话'}”，先接住情绪，再递进关系。`,
      styleUsed: payload.style || 'all',
      personalized: payload.personality ? `结合你的「${payload.personality}」画像，优先使用匹配风格。` : '',
      suggestions: styles.slice(0, payload.count || 4)
    };
  }
}

export async function reportPost(postId, reportData) {
  const data = await request(`/posts/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify(reportData)
  });
  return data;
}

// 通用上传
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    headers,
    body: formData
  });

  const result = await response.json();
  if (result.code !== 200 && !result.success) {
    throw new Error(result.message || '上传失败');
  }
  return result.data.url;
}


// ==========================================
// 社区帖子相关 API
// ==========================================

export async function getPostCategories() {
  const data = await request('/posts/categories');
  return data.data || [];
}

export async function getPostSortTabs() {
  const data = await request('/posts/sort-tabs');
  return data.data || [];
}

import { mockPosts } from '../data/mockData';

export async function getPosts(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/posts?${queryString}` : '/posts';
    const data = await request(url);
    return data.data || { list: [], total: 0 };
  } catch (err) {
    console.warn('Backend unavailable, using mock posts data:', err);
    return { list: mockPosts || [], total: (mockPosts || []).length };
  }
}

export async function createPost(postData) {
  const data = await request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
  return data.data;
}

export async function toggleLikePost(postId) {
  const data = await request(`/posts/${postId}/like`, {
    method: 'POST',
  });
  return data.data;
}

// 微信登录
export async function wxLogin(code) {
  const data = await request('/auth/wx-login', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return data;
}

// 获取分销基础信息
export async function getDistributorInfo() {
  const data = await request('/commission/distributor-info');
  return data.data;
}

// 获取分销团队
export async function getMyTeam() {
  const data = await request('/commission/my-team');
  return data.data;
}

// 申请提现
export async function applyWithdrawal(amount, accountInfo) {
  const data = await request('/commission/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, accountInfo })
  });
  return data;
}

// 提交投稿
export async function submitContribution(contribution) {
  const data = await request('/contributions', {
    method: 'POST',
    body: JSON.stringify(contribution),
  });
  return data;
}

// 获取我的投稿
export async function getMyContributions() {
  const data = await request('/contributions/my');
  return data.data || [];
}

// ==========================================
// 评论相关 API
// ==========================================

// ==========================================
// 收藏相关 API
// ==========================================

export async function addFavorite(targetType, targetId) {
  const data = await request('/favorites', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId }),
  });
  return data;
}

export async function removeFavorite(targetType, targetId) {
  const data = await request('/favorites', {
    method: 'DELETE',
    body: JSON.stringify({ targetType, targetId }),
  });
  return data;
}

export async function checkFavoriteStatus(targetType, targetId) {
  const data = await request(`/favorites/check?targetType=${targetType}&targetId=${targetId}`);
  return data.data;
}

export async function getMyFavorites(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/favorites/my?${queryString}` : '/favorites/my';
  const data = await request(url);
  return data.data || { list: [], total: 0 };
}

// 获取评论列表
export async function getComments(targetType, targetId) {
  const data = await request(`/comments/${targetType}/${targetId}`);
  return data.data || [];
}

// 发布评论
export async function postComment(targetType, targetId, content) {
  const data = await request('/comments', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, content }),
  });
  return data.data;
}

// 点赞/取消点赞评论
export async function toggleLikeComment(commentId) {
  const data = await request(`/comments/${commentId}/like`, {
    method: 'POST',
  });
  return data.data;
}



// 每日签到获取盲盒
export async function dailySignIn() {
  try {
    const data = await request('/user/daily-signin', {
      method: 'POST',
    });
    return data;
  } catch (error) {
    console.warn('Backend unavailable, mock daily sign in:', error);
    return {
      code: 200,
      data: {
        earnedPoints: 10,
        isBigPrize: false,
        totalPoints: 810,
        continuousDays: 6,
        blindBox: { type: 'QUOTE', content: '早安！这不仅是一个问候，更是我想你的证明。', author: '苏苏导师' }
      }
    };
  }
}

// 积分兑换VIP
export async function exchangeVip(pointsToUse, daysToGet) {
  const data = await request('/user/exchange-vip', {
    method: 'POST',
    body: JSON.stringify({ pointsToUse, daysToGet }),
  });
  return data;
}

// ==========================================
// 生活方式 / 情感增值（恋爱人格·装扮·礼物·纪念日）
// ==========================================

// 恋爱人格测评：获取问卷
export async function getAssessmentQuestions() {
  try {
    const data = await request('/life/assessment/questions');
    return data.data || [];
  } catch (e) { return []; }
}

// 恋爱人格测评：提交结果
export async function submitAssessment(answers) {
  try {
    const data = await request('/life/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    return data.data;
  } catch (e) {
    const a = answers.filter(x => x.v === 'a').length;
    const b = answers.filter(x => x.v === 'b').length;
    const c = answers.filter(x => x.v === 'c').length;
    return c >= Math.max(a, b)
      ? { type: '阳光行动派', emoji: '🌞', traits: ['主动', '真诚', '直接'], style: '直球勇', desc: '你热情直接，最擅长把心动变成行动。', opening: '第一眼就被你吸引了，周末有空的话想约你喝杯咖啡。' }
      : (b >= a
        ? { type: '理性推拉大师', emoji: '♟️', traits: ['策略', '幽默', '推拉'], style: '幽默接梗', desc: '你擅长制造张弛有度的聊天节奏。', opening: '通常我不会轻易加人，但你这条动态挺特别。' }
        : { type: '浪漫画家', emoji: '🎨', traits: ['共情', '细腻', '浪漫'], style: '暖心情话', desc: '你有敏锐的情绪雷达，适合用走心情话升温。', opening: '嗨，我猜你今天心情不错——因为遇见好天气的人眼里会有光。' });
  }
}

// 装扮中心：获取装扮列表与已拥有
export async function getSkins() {
  try {
    const data = await request('/life/skins');
    return data.data || { list: [], owned: [] };
  } catch (e) {
    return {
      list: [
        { id: 'frame_pink', kind: 'frame', name: '初恋粉框', price: 0, type: 'free', css: 'border-2 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,.5)]' },
        { id: 'frame_grad', kind: 'frame', name: '心动渐变框', price: 1500, type: 'points', vipOnly: true, css: 'p-[3px] bg-gradient-to-tr from-pink-500 to-amber-400 rounded-full' },
        { id: 'badge_sweet', kind: 'badge', name: '甜言蜜语', price: 300, type: 'points', css: 'bg-pink-400' },
        { id: 'badge_god', kind: 'badge', name: '情圣', price: null, type: 'vip', vipOnly: true, css: 'bg-gradient-to-tr from-amber-400 to-yellow-500' }
      ],
      owned: ['frame_pink'],
      active: { frame: 'frame_pink', badge: null }
    };
  }
}

export async function purchaseSkin(skinId) {
  try {
    const data = await request('/life/skins/purchase', { method: 'POST', body: JSON.stringify({ skinId }) });
    return data.data;
  } catch (e) { return { ok: true, owned: [] }; }
}

// 启用装扮（头像框/徽章设为当前使用）
export async function applySkin(skinId) {
  try {
    const data = await request('/life/skins/apply', { method: 'POST', body: JSON.stringify({ skinId }) });
    return data.data;
  } catch (e) { return { ok: false }; }
}

// 虚拟礼物
export async function sendGift(to, giftId) {
  try {
    const data = await request('/life/gifts/send', { method: 'POST', body: JSON.stringify({ to, giftId }) });
    return data.data;
  } catch (e) { return { ok: true, name: '心动玫瑰' }; }
}

// 纪念日 / 恋爱天数
export async function getMemorial() {
  try {
    const data = await request('/life/memorial');
    return data.data;
  } catch (e) {
    const start = new Date(); start.setDate(start.getDate() - 120);
    const startStr = start.toISOString().split('T')[0];
    return { startDate: startStr, days: 120, nextAnniversary: 245 };
  }
}

export async function saveMemorial(startDate) {
  try {
    const data = await request('/life/memorial/save', { method: 'POST', body: JSON.stringify({ startDate }) });
    return data.data;
  } catch (e) {
    const days = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000));
    return { ok: true, startDate, days };
  }
}
