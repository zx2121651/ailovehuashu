/**
 * src/pages/ai/index.jsx
 * AI 聊天导师页面
 */
import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChevronLeft, MoreHorizontal, Sparkles, Copy, CheckCircle2, RefreshCw, ThumbsUp, ThumbsDown, Loader2, Mic, Smile, Send, PlusCircle } from 'lucide-react'
import Icon from '../../components/Icon'
import ScrollableRow from '../../components/ScrollableRow'

export default function AiTutor() {
  const [chatInput, setChatInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const scrollViewRef = useRef(null)

  const [chatMessages, setChatMessages] = useState([
    { id: 'msg1', role: 'ai', type: 'text', content: '嗨！我是你的专属恋爱导师。不知道怎么回消息？把TA的话发给我，我帮你生成高情商回复方案！🥰', time: '10:24' },
    { id: 'msg2', role: 'user', type: 'text', content: '她刚对我说：“我觉得我们还是做朋友比较好” 怎么回？？在线等急！', time: '10:25' },
    { id: 'msg3', role: 'ai', type: 'suggestions', content: '为你生成以下高情商方案：', suggestions: [
      { label: '方案A：以退为进 (推荐)', text: '好啊，那作为朋友，周末请我喝杯奶茶不过分吧？', color: 'blue' },
      { label: '方案B：幽默化解', text: '其实我也这么想，做恋人容易吵架，做朋友我就可以理直气壮地蹭你饭了。', color: 'purple' }
    ], time: '10:25' }
  ])

  // 滚动到底部逻辑 (小程序和 H5 需要不同的实现方式，这里使用 scroll-view 的 scrollIntoView 或 scrollTop)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    // 模拟滚动到底部，实际在小程序中可以使用 scroll-into-view
    setScrollTop(99999)
  }, [chatMessages, isAiTyping])

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

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const newUserMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    setChatMessages(prev => [...prev, newUserMsg])
    setChatInput('')
    setIsAiTyping(true)

    setTimeout(() => {
      const isGreeting = chatInput.includes('你好') || chatInput.includes('哈喽')
      const newAiMsg = isGreeting
        ? { id: (Date.now() + 1).toString(), role: 'ai', type: 'text', content: '你好呀！遇到什么情感难题了吗？发给我，我来帮你参谋参谋~', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        : { id: (Date.now() + 1).toString(), role: 'ai', type: 'suggestions', content: '为你量身定制的高情商回复：', suggestions: [
            { label: '方案A：拉扯反转', text: `我觉得你说的很有道理，不过在这件事上，我可能有不一样的看法。`, color: 'blue' },
            { label: '方案B：幽默风趣', text: '哈哈，被你发现了，那还不赶紧奖励我一朵小红花？', color: 'purple' }
          ], time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }

      setChatMessages(prev => [...prev, newAiMsg])
      setIsAiTyping(false)
    }, 1500)
  }

  return (
    <View className="h-screen flex flex-col bg-[#F4F5F7] animate-in zoom-in-95 duration-300">
      {/* 自定义导航栏 */}
      <View className="bg-white px-5 pt-12 pb-3 z-20 shadow-sm relative flex items-center justify-between">
        <View onClick={() => Taro.navigateBack()}>
          <Icon Component={ChevronLeft} size={24} className="text-gray-800 cursor-pointer" />
        </View>
        <View className="text-center flex-1">
          <View className="text-[17px] font-bold text-gray-800 flex items-center justify-center">
            AI 恋爱导师<View className="ml-1.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></View>
          </View>
          <Text className="text-[10px] text-gray-400 mt-0.5 font-medium">{isAiTyping ? '导师正在输入中...' : '随时在线，秒出回复方案'}</Text>
        </View>
        <View onClick={() => showToast('更多功能开发中')}>
          <Icon Component={MoreHorizontal} size={24} className="text-gray-800 cursor-pointer" />
        </View>
      </View>

      {/* 聊天记录区域 */}
      <ScrollView
        scrollY
        scrollTop={scrollTop}
        className="flex-1 p-4 pb-32 space-y-5"
        style={{ height: 'calc(100vh - 160px)' }}
      >
        <View className="flex justify-center mb-4">
          <Text className="text-[10px] bg-gray-200/80 text-gray-500 px-2.5 py-1 rounded-md">今天 10:24</Text>
        </View>

        {chatMessages.map(msg => (
          <View key={msg.id} className={`flex items-start mb-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            {/* 头像 */}
            <View className={`w-9 h-9 rounded-full shrink-0 shadow-sm mt-1 overflow-hidden flex items-center justify-center ${msg.role === 'user' ? 'ml-3 bg-gray-300' : 'mr-3 bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-200'}`}>
               {msg.role === 'user'
                 ? <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" className="w-full h-full" mode="aspectFill" />
                 : <Icon Component={Sparkles} size={18} className="text-white" />}
            </View>

            {/* 消息气泡 */}
            <View className={`max-w-[80%] ${msg.role === 'user' ? '' : 'w-full'}`}>
              {msg.type === 'text' && (
                <View className={`p-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed break-words ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none shadow-pink-200' : 'bg-white border border-gray-100/50 text-gray-800 rounded-tl-none'}`}>
                  {msg.content}
                </View>
              )}

              {msg.type === 'suggestions' && (
                <View className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100/50 text-sm text-gray-800 space-y-4">
                  <Text className="font-bold text-gray-900 border-b border-gray-50 pb-2 block">{msg.content}</Text>
                  {msg.suggestions.map((sug, idx) => (
                    <View key={idx} className={`bg-${sug.color}-50/50 p-3.5 rounded-xl border border-${sug.color}-100 relative group`}>
                      <Text className={`absolute -top-2.5 left-3 bg-${sug.color}-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm`}>{sug.label}</Text>
                      <Text className="mt-2 text-[14px] text-gray-800 leading-relaxed block">{sug.text}</Text>
                      <View className="flex justify-end mt-2">
                        <View
                          onClick={() => handleCopy(msg.id + idx, sug.text)}
                          className={`text-[11px] flex items-center text-${sug.color}-600 font-bold bg-${sug.color}-100/50 px-2 py-1 rounded-md hover:bg-${sug.color}-200 transition-colors`}
                        >
                           {copiedId === msg.id + idx
                             ? <><Icon Component={CheckCircle2} size={12} className="mr-1 text-green-500"/> 已复制</>
                             : <><Icon Component={Copy} size={12} className="mr-1" /> 复制</>}
                        </View>
                      </View>
                    </View>
                  ))}
                  {/* 反馈与刷新操作栏 */}
                  <View className="flex items-center space-x-3 mt-2 text-gray-400">
                    <View className="flex items-center space-x-1 cursor-pointer" onClick={() => showToast('已生成新方案')}>
                      <Icon Component={RefreshCw} size={14} /> <Text className="text-[11px]">换一换</Text>
                    </View>
                    <View className="w-px h-3 bg-gray-300"></View>
                    <Icon Component={ThumbsUp} size={14} className="cursor-pointer" onClick={() => showToast('感谢反馈！')} />
                    <Icon Component={ThumbsDown} size={14} className="cursor-pointer" onClick={() => showToast('我们会继续努力优化')} />
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}

        {isAiTyping && (
           <View className="flex items-start animate-fade-in-up mb-5">
              <View className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md shadow-pink-200 mr-3 shrink-0 mt-1">
                <Icon Component={Sparkles} size={18} className="text-white" />
              </View>
              <View className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100/50 text-[14px] text-gray-800 flex items-center space-x-1.5">
                <Icon Component={Loader2} size={16} className="animate-spin text-pink-500" />
                <Text className="text-gray-400 text-xs ml-1">AI 正在思考中...</Text>
              </View>
           </View>
        )}
      </ScrollView>

      {/* 底部输入框区域 */}
      <View className="absolute bottom-0 w-full bg-[#F4F5F7] z-40 pb-5">
        <ScrollableRow className="px-3 pb-2">
          <View className="flex space-x-2">
            {['帮我幽默回复', '高情商拒绝', '怎么自然邀约', '帮我写个晚安'].map((chip, idx) => (
              <Text
                key={idx}
                onClick={() => setChatInput(chip)}
                className="bg-white text-gray-600 text-[12px] px-3 py-1.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap cursor-pointer active:bg-pink-50 active:text-pink-500 transition-colors"
              >
                {chip}
              </Text>
            ))}
          </View>
        </ScrollableRow>
        <View className="border-t border-gray-200/80 p-3 px-4 bg-[#F4F5F7]">
          <View className="flex items-center space-x-3">
            <Icon Component={Mic} size={26} className="text-gray-600 shrink-0 cursor-pointer" onClick={() => showToast('暂未获取麦克风权限')} />
            <View className="flex-1 bg-white border border-gray-200 rounded-full flex items-center px-3 py-1.5 focus-within:border-pink-300 transition-colors shadow-sm">
              <Input
                type="text"
                value={chatInput}
                onInput={(e) => setChatInput(e.detail.value)}
                onConfirm={handleSendChat}
                placeholder="粘贴对方说的话..."
                className="flex-1 bg-transparent text-[15px] outline-none py-1 px-1"
              />
              <Icon Component={Smile} size={24} className="text-gray-400 mx-1 cursor-pointer" onClick={() => showToast('表情包加载中...')} />
            </View>
            {chatInput.trim() ? (
               <View onClick={handleSendChat} className="bg-pink-500 text-white p-1.5 rounded-full shadow-md active:scale-90 transition-transform flex items-center justify-center w-8 h-8">
                 <Icon Component={Send} size={16} className="ml-0.5" />
               </View>
            ) : (
               <Icon Component={PlusCircle} size={28} className="text-gray-600 shrink-0 cursor-pointer" onClick={() => showToast('更多功能开发中...')} />
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
