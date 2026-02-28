/**
 * src/components/ScriptCard.jsx
 * 话术卡片组件，负责展示"问"和"答"，支持收藏、复制和查看更多功能。
 */
import React from 'react'
import { View, Text } from '@tarojs/components'
import { Heart, CheckCircle2, Copy, ChevronRight } from 'lucide-react'
import Icon from './Icon'

export default function ScriptCard({
  script,
  copiedId,
  onCopy,
  simple = false,
  isFavorite,
  onToggleFav,
  onShowMore
}) {
  return (
    <View className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
      {/* 收藏按钮 */}
      <Icon
        Component={Heart}
        size={18}
        onClick={onToggleFav}
        className={`absolute top-4 right-4 cursor-pointer transition-all active:scale-75 ${
          isFavorite ? 'fill-pink-500 text-pink-500 drop-shadow-sm' : 'text-gray-300 hover:text-pink-300'
        }`}
      />

      {/* 问题区域 */}
      <View className="flex items-start mb-3">
        <View className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mr-3 mt-0.5 shadow-sm">
          问
        </View>
        <View className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2.5 text-[14px] text-gray-800 font-medium border border-gray-100 pr-8">
          {script.question}
        </View>
      </View>

      {/* 回答区域 */}
      <View className="flex items-start">
        <View className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold text-xs shrink-0 mr-3 mt-1 shadow-sm">
          答
        </View>
        <View className="flex-1 space-y-2">
          {/* 首选回答展示框 */}
          <View className="bg-gradient-to-br from-pink-50/80 to-rose-50/50 rounded-2xl rounded-tr-none px-4 py-3 text-[14px] text-gray-800 relative group/inner border border-pink-100/50">
            <Text className="pr-5 leading-relaxed">{script.answers[0]}</Text>

            {/* 复制按钮 */}
            <View
              onClick={() => onCopy(script.id, script.answers[0])}
              className="absolute -bottom-2.5 right-2 bg-white text-gray-500 border border-gray-100 shadow-sm p-1.5 rounded-full active:scale-95 transition-all z-10"
            >
              {copiedId === script.id
                ? <Icon Component={CheckCircle2} size={14} className="text-green-500" />
                : <Icon Component={Copy} size={14} />
              }
            </View>
          </View>

          {/* 更多回复按钮 */}
          {!simple && (
            <View className="flex justify-between items-center text-[11px] text-gray-400 pl-1 pt-1.5">
              <Text className="flex items-center bg-gray-100 px-2 py-0.5 rounded-md font-medium">{script.type}</Text>
              <View onClick={onShowMore} className="text-pink-500 flex items-center font-bold">
                更多回复 ({script.answers.length})
                <Icon Component={ChevronRight} size={12} className="ml-0.5" />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
