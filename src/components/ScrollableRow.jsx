/**
 * src/components/ScrollableRow.jsx
 * 横向滚动容器。
 * 在 Taro 中直接使用官方提供的 ScrollView 组件，实现小程序和H5上的平滑原生触摸滚动效果，
 * 彻底替换掉原版基于 onMouseDown/MouseMove 计算偏移量的复杂方式。
 */
import React from 'react'
import { ScrollView, View } from '@tarojs/components'

export default function ScrollableRow({ children, className }) {
  return (
    <ScrollView
      scrollX
      className={`whitespace-nowrap ${className}`}
      // 隐藏原生滚动条的类通常通过全局 css ::-webkit-scrollbar 设置
    >
      <View className="inline-flex">
        {children}
      </View>
    </ScrollView>
  )
}
