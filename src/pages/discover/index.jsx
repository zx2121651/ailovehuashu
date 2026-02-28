/**
 * src/pages/discover/index.jsx
 * 话术库(发现页)
 */
import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { Search, X, MessageCircle, Sparkles, Compass, TrendingUp, ChevronRight } from 'lucide-react'
import { useStore } from '../../store'
import { categories, allScripts, hotSearches } from '../../data/mock'
import Icon from '../../components/Icon'
import ScrollableRow from '../../components/ScrollableRow'
import ScriptCard from '../../components/ScriptCard'

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(1)
  const [activeFilterTag, setActiveFilterTag] = useState('全部')
  const [discoverSort, setDiscoverSort] = useState('default')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const globalSearchQuery = useStore(state => state.globalSearchQuery)
  const globalActiveCategory = useStore(state => state.globalActiveCategory)
  const setGlobalSearch = useStore(state => state.setGlobalSearch)
  const favoriteIds = useStore(state => state.favoriteIds)
  const toggleFavorite = useStore(state => state.toggleFavorite)

  // 当页面显示时，读取全局搜索词和分类
  useDidShow(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery)
      setGlobalSearch('') // 消费后清除
    }
    if (globalActiveCategory) {
      setActiveCategory(globalActiveCategory)
      setGlobalSearch('', null)
    }
  })

  const showToast = (msg) => {
    Taro.showToast({ title: msg, icon: 'none' })
  }

  const handleCopy = (id, text) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }
    })
  }

  let filteredScripts = allScripts
  if (searchQuery) {
    filteredScripts = allScripts.filter(s => s.question.includes(searchQuery) || s.answers.some(a => a.includes(searchQuery)))
  } else if (activeCategory) {
    filteredScripts = allScripts.filter(s => s.categoryId === activeCategory)
  }

  if (activeFilterTag !== '全部') {
    filteredScripts = filteredScripts.filter(s => s.type.includes(activeFilterTag))
  }

  if (discoverSort === 'new') filteredScripts.sort((a,b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1)
  if (discoverSort === 'hot') filteredScripts.sort((a,b) => b.likes - a.likes)

  const currentCat = categories.find(c => c.id === activeCategory)

  return (
    <View className="min-h-screen flex flex-col bg-white">
      {/* 顶部搜索栏 */}
      <View className="bg-white px-5 pt-12 pb-3 z-30 shadow-sm relative flex items-center border-b border-gray-100">
        <View className="relative flex-1">
          <View className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon Component={Search} size={16} className={isSearchFocused ? 'text-pink-500' : 'text-gray-400'} />
          </View>
          <Input
            type="text"
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="搜索库内话术..."
            className={`w-full bg-gray-100/80 rounded-full py-2 pl-9 pr-8 text-[13px] outline-none transition-all ${isSearchFocused ? 'bg-pink-50/50 border border-pink-200' : 'border border-transparent focus:border-pink-300'}`}
          />
          {searchQuery && (
            <View
              className="absolute inset-y-0 right-3 flex items-center z-10"
              onClick={() => setSearchQuery('')}
            >
              <Icon Component={X} size={14} className="text-gray-400 cursor-pointer" />
            </View>
          )}
        </View>
      </View>

      <View className="flex flex-1 overflow-hidden bg-gray-50 relative z-10 h-full">
        {/* 左侧分类导航 */}
        <View className="w-[85px] bg-white border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
          <ScrollView scrollY className="h-full pb-24" showScrollbar={false}>
            {categories.map(cat => (
              <View
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); setDiscoverSort('default'); setActiveFilterTag('全部'); }}
                className={`py-4 flex flex-col items-center justify-center relative transition-colors cursor-pointer ${activeCategory === cat.id && !searchQuery ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'}`}
              >
                {activeCategory === cat.id && !searchQuery && <View className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-pink-500 rounded-r-md"></View>}
                <View className={`text-[22px] mb-1 block transition-transform transform ${activeCategory === cat.id && !searchQuery ? 'scale-110' : ''}`}>{cat.icon}</View>
                <Text className={`text-[11px] mt-1 ${activeCategory === cat.id && !searchQuery ? 'text-pink-600 font-bold' : 'text-gray-500 font-medium'}`}>{cat.name}</Text>
                <Text className="text-[9px] text-gray-400 mt-0.5 scale-90">{cat.count} 篇</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 右侧话术列表 */}
        <ScrollView scrollY className="flex-1 p-3 pb-24 bg-[#F8F9FA] relative h-[85vh]">
          <View className="animate-fade-in-up">
            {/* 顶部分类名称 */}
            <View className="sticky top-0 bg-[#F8F9FA]/90 z-10 pb-2 pt-1 mb-2 border-b border-gray-200/50">
              <View className="flex justify-between items-center px-1">
                <Text className="font-bold text-gray-800 flex items-center">
                  {searchQuery ? `包含 "${searchQuery}"` : currentCat?.name}
                  <Text className="ml-2 text-xs font-normal bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{filteredScripts.length} 条</Text>
                </Text>
              </View>
            </View>

            {/* 无搜索时的二级过滤 */}
            {!searchQuery && (
              <View>
                <ScrollableRow className="mb-4 pb-1">
                  <View className="flex items-center space-x-2">
                    {['全部', '高情商', '幽默', '暖心', '化解', '开场白'].map(tag => (
                      <Text
                        key={tag}
                        onClick={() => setActiveFilterTag(tag)}
                        className={`text-[11px] px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer shadow-sm ${activeFilterTag === tag ? 'bg-pink-100 text-pink-600 font-bold border border-pink-200' : 'bg-white text-gray-500 border border-gray-100'}`}
                      >
                        {tag}
                      </Text>
                    ))}
                  </View>
                </ScrollableRow>
              </View>
            )}

            {/* 列表渲染 */}
            {filteredScripts.length > 0 ? (
              <View className="space-y-3">
                {filteredScripts.map(script => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    isFavorite={favoriteIds.includes(script.id)}
                    onToggleFav={() => toggleFavorite(script.id)}
                    onShowMore={() => showToast('更多回复将在抽屉组件中展示')}
                  />
                ))}
                <View className="text-center text-xs text-gray-400 mt-6 pb-4">- 到底啦，快去实战吧 -</View>
              </View>
            ) : (
              <View className="flex flex-col items-center justify-center py-16 opacity-80">
                <View className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Icon Component={MessageCircle} size={32} className="text-gray-400" />
                </View>
                <Text className="text-sm text-gray-600 font-bold mb-1">未找到匹配的话术</Text>
                <Text className="text-xs text-gray-400 mb-6 text-center px-4">你可以尝试更换搜索词，或者直接让 AI 导师为你定制专属回复</Text>
                <View className="flex space-x-3 w-full px-6">
                  <View
                    className="flex-1 text-xs bg-white border border-gray-200 py-2.5 rounded-xl text-gray-600 shadow-sm font-medium text-center"
                    onClick={() => setSearchQuery('')}
                  >
                    清除搜索
                  </View>
                  <View
                    className="flex-1 text-xs bg-pink-500 text-white py-2.5 rounded-xl shadow-md shadow-pink-200 font-bold flex items-center justify-center"
                    onClick={() => Taro.switchTab({ url: '/pages/ai/index' })}
                  >
                    <Icon Component={Sparkles} size={14} className="mr-1" /> 问 AI 导师
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
