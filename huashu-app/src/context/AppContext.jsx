import React, { createContext, useState, useEffect } from 'react';
import * as api from '../services/api';

/* eslint-disable react-refresh/only-export-components, no-unused-vars, no-undef */
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, _setActiveTab] = useState('home');
  const [activeParams, setActiveParams] = useState(null);
  const setActiveTab = (tab, params = null) => { _setActiveTab(tab); setActiveParams(params); };
  const [copiedId, setCopiedId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchFavorites = async () => {
    try {
      const res = await api.getMyFavorites({ type: 'SCRIPT', limit: 100 });
      if (res && res.list) {
        setFavoriteIds(res.list.map(f => f.targetId));
      }
    } catch (error) {
      // 401 错误表示未登录，这是正常情况，不需要报错
      if (error.message && error.message.includes('401')) {
        // 用户未登录，清空收藏列表
        setFavoriteIds([]);
      } else {
        console.error('获取收藏失败', error);
      }
    }
  };

  const [showVipModal, setShowVipModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeServicePage, setActiveServicePage] = useState(null);
  const [repliesDrawerScript, setRepliesDrawerScript] = useState(null);
  const [isContributeDrawerOpen, setIsContributeDrawerOpen] = useState(false);
  const [showBlindBoxModal, setShowBlindBoxModal] = useState(false);

  // Favorites State
  const [favoriteIds, setFavoriteIds] = useState([]);
  // Custom folders for favorites
  const [customFolders, setCustomFolders] = useState(['重点备用', '幽默特辑']);
  // Mapping of scriptId to folderName (e.g., { 1: '重点备用' })
  const [scriptFolders, setScriptFolders] = useState({});
  // Notes mapping (e.g., { 1: '七夕准备用这句' })
  const [favNotes, setFavNotes] = useState({ 1: '七夕准备用这句' });

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    id: '8848123',
    name: '微信用户',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
    gender: '男生',
    bio: '正在努力学习脱单...',
    daysLearned: 12,
    rank: '嘴强王者',
    points: 350
  });

  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      // Auto load profile if token exists (e.g., from playwright or refresh)
      api.getUserProfile().then(profileRes => {
        if (profileRes) {
          setUserProfile(prev => ({ ...prev, ...profileRes }));
          if (!profileRes.lastSignInAt) {
            setShowBlindBoxModal(true);
          } else {
            const lastDate = new Date(profileRes.lastSignInAt);
            const now = new Date();
            const isSameDay = lastDate.getFullYear() === now.getFullYear() &&
                              lastDate.getMonth() === now.getMonth() &&
                              lastDate.getDate() === now.getDate();
            if (!isSameDay) {
              setShowBlindBoxModal(true);
            }
          }
        }
      }).catch(e => console.error('Failed to auto fetch full profile', e));
      fetchFavorites();
    }

  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await api.wxLogin('mock_code_123');
      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUserProfile(prev => ({
          ...prev,
          id: res.data.user.id || prev.id,
          name: res.data.user.name || prev.name,
          avatar: res.data.user.avatar || prev.avatar
        }));

        // Fetch full profile to get points, lastSignInAt, etc.
        try {
          const profileRes = await api.getUserProfile();
          if (profileRes) {
            setUserProfile(prev => ({ ...prev, ...profileRes }));
            if (!profileRes.lastSignInAt) {
              setShowBlindBoxModal(true);
            } else {
              const lastDate = new Date(profileRes.lastSignInAt);
              const now = new Date();
              const isSameDay = lastDate.getFullYear() === now.getFullYear() &&
                                lastDate.getMonth() === now.getMonth() &&
                                lastDate.getDate() === now.getDate();
              if (!isSameDay) {
                setShowBlindBoxModal(true);
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch full profile', e);
        }

        fetchFavorites(); // Fetch favorites after login
        return true;
      }
    } catch (error) {
      console.error('登录失败', error);
      showToast('登录失败，请重试');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Initialize data on app load if token exists
  useEffect(() => {
    if (token) {
      fetchFavorites();
    }

  }, [token]);

  const [discoverState, setDiscoverState] = useState({
    activeCategory: 1,
    searchQuery: '',
    sort: '推荐',
    filterTag: '全部',
    activeTag: '全部',
    isSearchFocused: false
  });

  const [aiState, setAiState] = useState({
    chatInput: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleCopy = (id, text) => {
    const fallbackCopyTextToClipboard = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (_err) { console.error(_err);
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
    } else {
      navigator.clipboard.writeText(text).catch(err => {
        fallbackCopyTextToClipboard(text);
      });
    }

    setCopiedId(id);
    showToast('已复制到剪贴板');
    setTimeout(() => setCopiedId(null), 2000);
  };



  const toggleFavorite = async (id) => {
    const isFav = favoriteIds.includes(id);

    // 乐观更新 UI
    setFavoriteIds(prev => {
      if (isFav) {
        setScriptFolders(sf => {
          const newSf = { ...sf };
          delete newSf[id];
          return newSf;
        });
        return prev.filter(fId => fId !== id);
      }
      return [...prev, id];
    });

    try {
      if (isFav) {
        await api.removeFavorite('SCRIPT', id);
        showToast('已取消收藏');
      } else {
        await api.addFavorite('SCRIPT', id);
        showToast('收藏成功');
      }
    } catch (error) {
      console.error('收藏操作失败', error);
      showToast('操作失败，请重试');
      // 恢复状态 (简单回滚)
      fetchFavorites();
    }
  };

  const value = {
    token, setToken, handleLogin, handleLogout,
    user: userProfile, // Expose userProfile as user for Community component
    activeTab, setActiveTab, activeParams,
    copiedId, setCopiedId, handleCopy,
    toastMsg, showToast,
    showVipModal, setShowVipModal,
    showSettings, setShowSettings,
    activeServicePage, setActiveServicePage,
    repliesDrawerScript, setRepliesDrawerScript,
    isContributeDrawerOpen, setIsContributeDrawerOpen,
    favoriteIds, setFavoriteIds, toggleFavorite,
    customFolders, setCustomFolders,
    scriptFolders, setScriptFolders,
    favNotes, setFavNotes,
    userProfile, setUserProfile,
    discoverState, setDiscoverState,
    aiState, setAiState,
    showBlindBoxModal, setShowBlindBoxModal
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
