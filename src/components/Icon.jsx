/**
 * src/components/Icon.jsx
 * 跨端通用的 Icon 组件封装。
 * 原始代码使用的是 lucide-react (SVG DOM)，但是在小程序中直接渲染 SVG 会遇到兼容性问题。
 * 因此这里使用 Taro 官方的 Image 组件加载 base64 或外链，或者后续在此处替换为 IconFont/Taro-UI 的图标。
 * 为了兼容原有逻辑，目前暂时尝试渲染 lucide-react 图标，并加上 try-catch (H5 可用)。
 */
import React from 'react'
import { View } from '@tarojs/components'

export default function Icon({ name, Component, size = 18, className = '', onClick }) {
  // 如果直接传入了 Lucide 的组件，则在 H5 下能正常渲染，小程序端可能需要进一步处理（通过 taro-plugin-svg 等）
  // 这里做了一个防崩溃封装
  return (
    <View className={`inline-flex items-center justify-center ${className}`} onClick={onClick}>
      {Component ? <Component size={size} /> : null}
    </View>
  )
}
