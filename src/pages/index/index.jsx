/**
 * src/pages/index/index.jsx
 * 首页
 */
import React, { useState } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Search, Bell, TrendingUp, Volume2, Calendar, CheckCircle2, Quote, Timer, Sparkles, Heart, Zap, PlayCircle, ChevronRight, MessageSquare, Target } from 'lucide-react'
import { useStore } from '../../store'
import { categories, allScripts, pitfallsData } from '../../data/mock'
import Icon from '../../components/Icon'
import ScrollableRow from '../../components/ScrollableRow'
import ScriptCard from '../../components/ScriptCard'

export default function Home() {
  const [homeSearchInput, setHomeSearchInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const setGlobalSearch = useStore(state => state.setGlobalSearch)
  const favoriteIds = useStore(state => state.favoriteIds)
  const toggleFavorite = useStore(state => state.toggleFavorite)

  const showToast = (msg) => {
    Taro.showToast({ title: msg, icon: 'none' })
  }

  // 执行搜索并跳转到发现页
  const executeSearch = (query) => {
    if (!query.trim()) return
    setGlobalSearch(query)
    Taro.switchTab({ url: '/pages/discover/index' })
  }

  // 复制文本功能
  const handleCopy = (id, text) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }
    })
  }

  return (
    <View className="min-h-screen bg-[#F5F7FA] pb-6">
      {/* 顶部搜索栏区块 */}
      <View className="bg-white px-5 pt-12 pb-5 rounded-b-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10 animate-fade-in-up">
        <View className="flex justify-between items-center mb-5 pr-20">
          <View>
            <View className="text-[22px] font-extrabold text-gray-800 tracking-tight flex items-center">
              恋爱话术库
              <Text
                onClick={() => showToast('VIP 弹窗')}
                className="ml-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] px-2 py-0.5 rounded-full font-normal shadow-sm animate-pulse-slow"
              >
                Pro
              </Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1 font-medium block">今天想撩谁？一句顶一万句</Text>
          </View>
          <View
            onClick={() => showToast('暂无新通知')}
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <Icon Component={Bell} size={18} />
          </View>
        </View>

        {/* 搜索输入框 */}
        <View className="relative group">
          <View className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon Component={Search} size={18} className="text-gray-400 group-focus-within:text-pink-500 transition-colors" />
          </View>
          <Input
            type="text"
            value={homeSearchInput}
            onInput={(e) => setHomeSearchInput(e.detail.value)}
            onConfirm={(e) => executeSearch(e.detail.value)}
            className="block w-full pl-11 pr-20 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm placeholder-gray-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all outline-none"
            placeholder="搜一下：女生说“早安”怎么回"
          />
          <View className="absolute inset-y-0 right-1.5 flex items-center">
            <View
              onClick={() => executeSearch(homeSearchInput)}
              className="bg-gray-900 text-white text-xs px-4 py-2 rounded-xl shadow-md font-medium active:scale-95 transition-all cursor-pointer"
            >
              搜索
            </View>
          </View>
        </View>

        {/* 热门搜索词 */}
        <ScrollableRow className="mt-4 pb-1">
          <View className="flex items-center space-x-2">
            <Text className="text-[11px] font-bold text-gray-700 shrink-0 flex items-center">
              <Icon Component={TrendingUp} size={14} className="mr-1 text-red-500" /> 猜你想搜
            </Text>
            {['相亲怎么聊', '被拒绝', '生日祝福', '惹她生气'].map((tag, idx) => (
              <Text
                key={idx}
                onClick={() => executeSearch(tag)}
                className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm active:bg-pink-50"
              >
                {tag}
              </Text>
            ))}
          </View>
        </ScrollableRow>
      </View>

      {/* 四宫格快捷分类 */}
      <View className="px-5 mt-5 grid grid-cols-4 gap-3 animate-fade-in-up delay-100">
        {[
          { icon: MessageSquare, color: 'text-blue-500', label: '约会没话', catId: 1 },
          { icon: Heart, color: 'text-pink-500', label: '惹生气了', catId: 4 },
          { icon: Zap, color: 'text-orange-500', label: '神级破冰', catId: 1 },
          { icon: Sparkles, color: 'text-purple-500', label: '睡前晚安', catId: 5 }
        ].map((item, idx) => (
          <View
            key={idx}
            onClick={() => { setGlobalSearch('', item.catId); Taro.switchTab({ url: '/pages/discover/index' }) }}
            className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <View className="bg-gray-50 p-2 rounded-full mb-1.5">
              <Icon Component={item.icon} size={20} className={item.color} />
            </View>
            <Text className="text-[11px] font-bold text-gray-700">{item.label}</Text>
          </View>
        ))}
      </View>

      {/* AI 快捷入口 */}
      <View className="mt-6 animate-fade-in-up delay-200">
        <View className="flex justify-between items-center px-5 mb-3">
          <View className="font-bold text-gray-800 text-[17px] flex items-center">
            <Icon Component={Sparkles} size={18} className="text-purple-500 mr-1.5" /> AI 恋爱神器
          </View>
        </View>
        <View className="px-4 grid grid-cols-2 gap-3">
          {[
            { title: '朋友圈文案', desc: '高级感拉满', icon: MessageSquare, bg: 'bg-blue-50/50 border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-500' },
            { title: '高情商道歉', desc: '秒变乖狗狗', icon: Heart, bg: 'bg-orange-50/50 border-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-100 text-orange-500' }
          ].map((tool, idx) => (
            <View
              key={idx}
              onClick={() => Taro.switchTab({ url: '/pages/ai/index' })}
              className={`${tool.bg} border p-3 rounded-2xl flex items-center active:scale-95 transition-all shadow-sm`}
            >
              <View className={`w-8 h-8 rounded-full ${tool.iconBg} flex items-center justify-center mr-2.5 shrink-0 shadow-sm`}>
                <Icon Component={tool.icon} size={16} />
              </View>
              <View>
                <View className={`text-[13px] font-bold ${tool.text}`}>{tool.title}</View>
                <View className="text-[10px] text-gray-500 mt-0.5">{tool.desc}</View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 高分回复榜 */}
      <View className="px-4 mt-6 animate-fade-in-up delay-300">
        <View className="flex justify-between items-center mb-4 px-1">
          <View className="font-bold text-gray-800 text-[17px]">高分回复榜</View>
        </View>
        <View className="space-y-3.5">
          {allScripts.slice(0, 3).map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              copiedId={copiedId}
              onCopy={handleCopy}
              isFavorite={favoriteIds.includes(script.id)}
              onToggleFav={() => toggleFavorite(script.id)}
              onShowMore={() => showToast('请前往发现页查看更多')}
            />
          ))}
        </View>
      </View>
    </View>
  )
}
