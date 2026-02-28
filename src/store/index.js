/**
 * src/store/index.js
 * 使用 zustand 进行全局状态管理
 * 主要管理跨页面共享的数据：收藏列表、用户笔记、搜索状态等
 */
import { create } from 'zustand'

export const useStore = create((set) => ({
  // 收藏的话术 ID 列表
  favoriteIds: [1, 4],
  // 收藏页个人笔记记录 (映射表)
  favNotes: { 1: '七夕准备用这句' },

  // 搜索参数，用于在首页搜索后带入发现页
  globalSearchQuery: '',
  // 选中的发现页分类
  globalActiveCategory: 1,

  // Action: 切换收藏状态
  toggleFavorite: (id) => set((state) => {
    const isFav = state.favoriteIds.includes(id);
    return {
      favoriteIds: isFav
        ? state.favoriteIds.filter(fId => fId !== id)
        : [...state.favoriteIds, id]
    }
  }),

  // Action: 批量删除收藏
  removeFavorites: (ids) => set((state) => ({
    favoriteIds: state.favoriteIds.filter(id => !ids.includes(id))
  })),

  // Action: 更新笔记
  setFavNote: (id, note) => set((state) => ({
    favNotes: { ...state.favNotes, [id]: note }
  })),

  // Action: 设定全局搜索词并切换到发现分类
  setGlobalSearch: (query, categoryId = null) => set(() => ({
    globalSearchQuery: query,
    globalActiveCategory: categoryId
  })),
}))
