/**
 * src/pages/profile/index.jsx
 * 个人中心页
 */
import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Copy, Settings, Zap, Target, Crown, History, Edit3, MessageSquare, FileText, Heart, Gift, PenTool, Headphones, Award, HelpCircle, ChevronRight } from 'lucide-react'
import { useStore } from '../../store'
import Icon from '../../components/Icon'

// 辅助组件：个人资料列表项
function ProfileListItem({ icon, title, subtitle, border = true, onClick }) {
  return (
    <View
      onClick={onClick}
      className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors ${border ? 'border-b border-gray-50/80' : ''}`}
    >
      <View className="flex items-center">
        <View className="mr-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
          {icon}
        </View>
        <Text className="text-[15px] text-gray-700 font-medium">{title}</Text>
      </View>
      <View className="flex items-center">
        {subtitle && <Text className="text-xs text-gray-400 mr-2 font-medium">{subtitle}</Text>}
        <Icon Component={ChevronRight} size={16} className="text-gray-300" />
      </View>
    </View>
  )
}

export default function Profile() {
  const favoriteIds = useStore(state => state.favoriteIds)

  const showToast = (msg) => {
    Taro.showToast({ title: msg, icon: 'none' })
  }

  const handleCopy = (text) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        showToast('复制成功')
      }
    })
  }

  return (
    <View className="min-h-screen flex flex-col bg-[#F5F7FA] animate-in fade-in duration-300">
      {/* 顶部个人资料区 */}
      <View className="bg-gradient-to-b from-pink-100/80 to-[#F5F7FA] px-5 pt-10 pb-2 relative z-10">
        <View className="flex items-center justify-between">
          <View className="flex items-center space-x-4">
            <View className="w-[68px] h-[68px] bg-white p-1 rounded-full shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"
                className="w-full h-full rounded-full object-cover"
                mode="aspectFill"
              />
            </View>
            <View>
              <Text className="text-xl font-bold text-gray-800 block">微信用户</Text>
              <View className="text-[11px] text-gray-500 mt-1.5 flex items-center bg-white/60 w-max px-2.5 py-0.5 rounded-full border border-white/40 shadow-sm">
                ID: 8848123
                <Icon Component={Copy} size={10} className="ml-1 cursor-pointer" onClick={() => handleCopy('8848123')} />
              </View>
            </View>
          </View>
          <View
            onClick={() => showToast('设置功能开发中')}
            className="text-gray-600 cursor-pointer bg-white/50 p-2 rounded-full shadow-sm"
          >
            <Icon Component={Settings} size={20} />
          </View>
        </View>

        {/* 数据面板 */}
        <View className="flex justify-around bg-white rounded-[1.25rem] p-4 shadow-sm mt-5 mb-1 border border-white/50">
          <View className="text-center flex flex-col items-center">
            <View className="font-extrabold text-[20px] text-gray-800">12<Text className="text-[10px] text-gray-400 font-normal ml-0.5">天</Text></View>
            <View className="text-[11px] text-gray-500 mt-0.5 font-medium">累计学习</View>
          </View>
          <View className="w-px h-8 bg-gray-100 mt-1"></View>
          <View className="text-center flex flex-col items-center cursor-pointer" onClick={() => Taro.switchTab({ url: '/pages/favorites/index' })}>
            <View className="font-extrabold text-[20px] text-gray-800">{favoriteIds.length}<Text className="text-[10px] text-gray-400 font-normal ml-0.5">条</Text></View>
            <View className="text-[11px] text-gray-500 mt-0.5 font-medium">我的收藏</View>
          </View>
          <View className="w-px h-8 bg-gray-100 mt-1"></View>
          <View className="text-center flex flex-col items-center cursor-pointer" onClick={() => showToast('学习更多提升段位！')}>
            <View className="font-extrabold text-[18px] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 flex items-center mt-0.5">嘴强王者</View>
            <View className="text-[11px] text-gray-500 mt-1 font-medium">当前段位</View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-24" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 资产与任务 */}
        <View className="flex space-x-3 mb-4 mt-2">
           <View className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-orange-100" onClick={() => showToast('我的积分')}>
              <View>
                 <Text className="text-[11px] text-orange-600 font-medium mb-0.5 block">我的积分</Text>
                 <Text className="text-lg font-extrabold text-orange-700 tracking-tight block">350</Text>
              </View>
              <View className="w-8 h-8 bg-orange-200/60 rounded-full flex items-center justify-center text-orange-600 shadow-sm"><Icon Component={Zap} size={16}/></View>
           </View>
           <View className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-blue-100" onClick={() => showToast('每日任务')}>
              <View>
                 <Text className="text-[11px] text-blue-600 font-medium mb-1 block">每日任务</Text>
                 <Text className="text-[13px] font-bold text-blue-700 flex items-center">去完成 <Icon Component={ChevronRight} size={14} className="ml-0.5"/></Text>
              </View>
              <View className="w-8 h-8 bg-blue-200/60 rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Icon Component={Target} size={16}/></View>
           </View>
        </View>

        {/* VIP 横幅 */}
        <View
          onClick={() => showToast('VIP 开通功能开发中')}
          className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[1.25rem] p-4 shadow-lg shadow-gray-400/20 relative overflow-hidden group cursor-pointer border border-gray-700"
        >
          <View className="flex justify-between items-center relative z-10 p-0.5">
            <View className="flex items-center text-yellow-400">
              <Icon Component={Crown} size={22} className="mr-2.5 drop-shadow-md" />
              <View className="flex flex-col">
                 <Text className="font-bold text-[16px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 block">解锁终身会员</Text>
                 <Text className="text-gray-400 text-[10px] mt-0.5 font-medium block">10,000+ 话术 & AI 导师无限聊</Text>
              </View>
            </View>
            <View className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-yellow-500/20">立即开通</View>
          </View>
        </View>

        {/* 内容管理矩阵 */}
        <View className="bg-white rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <View className="text-[13px] font-bold text-gray-800 mb-3 flex items-center">
            <Icon Component={FileText} size={16} className="text-indigo-500 mr-1.5" /> 我的内容
          </View>
          <View className="grid grid-cols-4 gap-4">
            {[
              { id: 'history', icon: History, color: 'text-indigo-500', label: '浏览足迹' },
              { id: 'contributions', icon: Edit3, color: 'text-green-500', label: '我的贡献' },
              { id: 'ai-history', icon: MessageSquare, color: 'text-purple-500', label: 'AI 记录' },
              { id: 'notes', icon: FileText, color: 'text-orange-500', label: '错题本' }
            ].map((item, i) => (
              <View key={i} onClick={() => showToast(item.label)} className="flex flex-col items-center justify-center cursor-pointer">
                <View className="bg-gray-50 p-2.5 rounded-full mb-1.5 border border-gray-100/80">
                  <Icon Component={item.icon} size={20} className={item.color} />
                </View>
                <Text className="text-[11px] text-gray-600 font-medium">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 核心服务矩阵 */}
        <View className="bg-white rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <View className="text-[13px] font-bold text-gray-800 mb-3 flex items-center">
            <Icon Component={Heart} size={16} className="text-pink-500 mr-1.5" /> 核心服务
          </View>
          <View className="grid grid-cols-4 gap-4">
            {[
              { id: 'assessment', icon: Heart, color: 'text-pink-500', label: '恋爱评测' },
              { id: 'invite', icon: Gift, color: 'text-red-500', label: '邀请有礼' },
              { id: 'custom', icon: PenTool, color: 'text-blue-500', label: '话术定制' },
              { id: 'support', icon: Headphones, color: 'text-orange-500', label: '专属客服' }
            ].map((item, i) => (
              <View key={i} onClick={() => showToast(item.label)} className="flex flex-col items-center justify-center cursor-pointer">
                <View className="bg-gray-50 p-2.5 rounded-full mb-1.5 border border-gray-100/80">
                  <Icon Component={item.icon} size={20} className={item.color} />
                </View>
                <Text className="text-[11px] text-gray-600 font-medium">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-[1.25rem] shadow-sm p-1 border border-gray-50">
          <ProfileListItem
            icon={<Icon Component={Award} size={18} className="text-yellow-500" />}
            title="我的特权"
            subtitle="去查看"
            onClick={() => showToast('VIP 弹窗')}
          />
          <ProfileListItem
            icon={<Icon Component={HelpCircle} size={18} className="text-gray-500" />}
            title="帮助与反馈"
            border={false}
            onClick={() => showToast('帮助页面')}
          />
        </View>
      </ScrollView>
    </View>
  )
}
