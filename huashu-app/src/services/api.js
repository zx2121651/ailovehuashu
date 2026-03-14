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
