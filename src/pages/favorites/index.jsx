/**
 * src/pages/favorites/index.jsx
 * 收藏页
 */
import React, { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Search, FileDown, X, FolderHeart, PlusCircle, CheckSquare, Square, Trash2, Edit2, Heart } from 'lucide-react'
import { useStore } from '../../store'
import { allScripts } from '../../data/mock'
import Icon from '../../components/Icon'
import ScrollableRow from '../../components/ScrollableRow'
import ScriptCard from '../../components/ScriptCard'

export default function Favorites() {
  const [favFilter, setFavFilter] = useState('全部')
  const [isEditFav, setIsEditFav] = useState(false)
  const [checkedFavs, setCheckedFavs] = useState([])
  const [isFavSearchVisible, setIsFavSearchVisible] = useState(false)
  const [favSearchQuery, setFavSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [tempNoteContent, setTempNoteContent] = useState('')

  const favoriteIds = useStore(state => state.favoriteIds)
  const favNotes = useStore(state => state.favNotes)
  const toggleFavorite = useStore(state => state.toggleFavorite)
  const removeFavorites = useStore(state => state.removeFavorites)
  const setFavNote = useStore(state => state.setFavNote)

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

  const toggleFavCheck = (id) => {
    setCheckedFavs(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  const handleBatchDelete = () => {
    if(checkedFavs.length === 0) {
      setIsEditFav(false)
      return
    }
    removeFavorites(checkedFavs)
    setCheckedFavs([])
    setIsEditFav(false)
    showToast(`已删除 ${checkedFavs.length} 条收藏`)
  }

  const handleSaveNote = () => {
    if (editingNoteId) {
      setFavNote(editingNoteId, tempNoteContent)
      showToast('备注已保存')
      setEditingNoteId(null)
    }
  }

  let myFavs = allScripts.filter(s => favoriteIds.includes(s.id))
  if (favFilter !== '全部') {
     myFavs = myFavs.filter(s => s.type.includes(favFilter) || s.type === favFilter)
  }
  if (favSearchQuery) {
     myFavs = myFavs.filter(s => s.question.includes(favSearchQuery) || s.answers.some(a => a.includes(favSearchQuery)))
  }

  return (
    <View className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* 顶部标题栏 */}
      <View className="bg-white px-5 pt-12 pb-3 z-10 shadow-sm relative flex items-center justify-between">
         <View className="w-8"></View>
         <View className="text-lg font-bold text-gray-800 text-center">我的收藏</View>
         <View className="flex space-x-3 text-gray-600">
           <Icon Component={Search} size={20} className="cursor-pointer" onClick={() => setIsFavSearchVisible(!isFavSearchVisible)} />
           <Icon Component={FileDown} size={20} className="cursor-pointer" onClick={() => showToast('已将收藏导出至本地')} />
         </View>
      </View>

      {/* 搜索框 */}
      {isFavSearchVisible && (
        <View className="bg-white px-5 py-3 border-b border-gray-100 animate-in slide-in-from-top-2">
          <View className="relative">
            <View className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon Component={Search} size={14} className="text-gray-400" />
            </View>
            <Input
              type="text"
              value={favSearchQuery}
              onInput={(e) => setFavSearchQuery(e.detail.value)}
              placeholder="在收藏中搜索..."
              className="w-full bg-gray-100/80 rounded-xl py-2 pl-9 pr-8 text-xs outline-none transition-all"
            />
            {favSearchQuery && (
              <View className="absolute inset-y-0 right-3 flex items-center z-10" onClick={() => setFavSearchQuery('')}>
                <Icon Component={X} size={14} className="text-gray-400 cursor-pointer" />
              </View>
            )}
          </View>
        </View>
      )}

      <ScrollView scrollY className="flex-1 p-4 pb-24 relative" style={{ height: 'calc(100vh - 150px)' }}>
        {/* 文件夹/标签切换 */}
        <ScrollableRow className="mb-4 pb-1">
          <View className="flex space-x-2">
            <Text
              onClick={() => setFavFilter('全部')}
              className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '全部' ? 'bg-gray-800 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}
            >
              全部
            </Text>
            <View
              onClick={() => setFavFilter('高情商')}
              className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '高情商' ? 'bg-pink-500 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}
            >
              <Icon Component={FolderHeart} size={12} className="mr-1"/> 重点备用
            </View>
            <View
              onClick={() => setFavFilter('幽默')}
              className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '幽默' ? 'bg-blue-500 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}
            >
              <Icon Component={FolderHeart} size={12} className="mr-1"/> 幽默特辑
            </View>
            <View
              onClick={() => showToast('新建文件夹功能开发中')}
              className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors bg-gray-50 text-gray-500 border border-dashed border-gray-300 flex items-center"
            >
              <Icon Component={PlusCircle} size={12} className="mr-1"/> 新建
            </View>
          </View>
        </ScrollableRow>

        <View className="flex justify-between items-center mb-3 px-1">
          <Text className="text-xs text-gray-500 font-medium">共找到 <Text className="text-pink-500 font-bold">{myFavs.length}</Text> 条内容</Text>
          {myFavs.length > 0 && (
            <Text
              onClick={() => { setIsEditFav(!isEditFav); setCheckedFavs([]); }}
              className={`text-[11px] bg-white shadow-sm border px-3 py-1 rounded-full cursor-pointer transition-colors ${isEditFav ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-100 text-gray-600'}`}
            >
              {isEditFav ? '取消管理' : '批量管理'}
            </Text>
          )}
        </View>

        {myFavs.length > 0 ? (
          <View className="space-y-4 animate-fade-in-up">
            {myFavs.map(script => (
              <View key={script.id} className="relative flex items-start">
                {isEditFav && (
                  <View className="mr-3 mt-4 animate-in fade-in" onClick={() => toggleFavCheck(script.id)}>
                    <Icon Component={checkedFavs.includes(script.id) ? CheckSquare : Square} size={20} className={checkedFavs.includes(script.id) ? "text-pink-500" : "text-gray-300"} />
                  </View>
                )}
                <View className={`flex-1 transition-all ${isEditFav ? 'opacity-80 pointer-events-none' : ''}`}>
                  <View className="relative z-10">
                    <ScriptCard
                      script={script}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      isFavorite={true}
                      onToggleFav={() => toggleFavorite(script.id)}
                      onShowMore={() => showToast('更多回复将在详情中展示')}
                    />
                  </View>
                  {/* 个人备注区域 */}
                  <View className="bg-yellow-50/80 border border-yellow-200/60 rounded-b-[1rem] px-4 py-2.5 -mt-3 pt-5 flex justify-between items-start relative z-0">
                     <View className="flex-1 text-[11px] text-yellow-800/80 leading-relaxed pr-2">
                       <View className="font-bold flex items-center mb-0.5">
                         <Icon Component={Edit2} size={10} className="mr-1"/> 个人备注：
                       </View>
                       {favNotes[script.id]
                         ? <Text>{favNotes[script.id]}</Text>
                         : <Text className="text-yellow-600/50 italic">点击右侧添加备注，方便实战使用...</Text>
                       }
                     </View>
                     <View
                       onClick={() => { setEditingNoteId(script.id); setTempNoteContent(favNotes[script.id] || ''); }}
                       className="text-[10px] bg-white border border-yellow-200 text-yellow-700 px-2 py-1 rounded shadow-sm shrink-0 transition-colors"
                     >
                       {favNotes[script.id] ? '修改' : '添加'}
                     </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
           <View className="flex flex-col items-center justify-center py-20 opacity-60">
              <Icon Component={Heart} size={48} className="text-gray-300 mb-3" />
              <Text className="text-sm text-gray-500">没找到相关的收藏内容呢</Text>
              <View className="mt-4 bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full shadow-sm" onClick={() => { setFavSearchQuery(''); setFavFilter('全部'); }}>清除条件</View>
           </View>
        )}
      </ScrollView>

      {/* 批量编辑底栏 */}
      {isEditFav && (
        <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-3 px-5 z-40 flex justify-between items-center pb-safe">
           <View className="flex items-center text-sm text-gray-600 cursor-pointer" onClick={() => setCheckedFavs(checkedFavs.length === myFavs.length ? [] : myFavs.map(m=>m.id))}>
              <Icon Component={checkedFavs.length === myFavs.length ? CheckSquare : Square} size={18} className={checkedFavs.length === myFavs.length ? "text-pink-500 mr-2" : "text-gray-300 mr-2"} />
              全选
           </View>
           <View
             onClick={handleBatchDelete}
             className={`flex items-center text-sm px-5 py-2 rounded-full font-bold shadow-md transition-all ${checkedFavs.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}
           >
             <Icon Component={Trash2} size={16} className="mr-1" /> 删除 {checkedFavs.length > 0 ? `(${checkedFavs.length})` : ''}
           </View>
        </View>
      )}

      {/* 编辑备注弹窗 (简易实现) */}
      {editingNoteId !== null && (
        <View className="absolute inset-0 z-50 flex items-center justify-center">
           <View className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingNoteId(null)}></View>
           <View className="bg-white w-[85%] rounded-[1.5rem] p-5 relative z-10 animate-in zoom-in-95 duration-200 shadow-xl">
              <View className="font-bold text-gray-800 text-[15px] mb-3 flex items-center">
                <Icon Component={Edit2} size={16} className="mr-1.5 text-pink-500"/> 编辑话术备注
              </View>
              <Input
                value={tempNoteContent}
                onInput={(e) => setTempNoteContent(e.detail.value)}
                placeholder="例如：准备在跨年夜用这句表白..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-pink-300 transition-all shadow-inner"
              />
              <View className="flex space-x-3 mt-4">
                <View onClick={() => setEditingNoteId(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-center text-sm">取消</View>
                <View onClick={handleSaveNote} className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-pink-200 text-center text-sm">保存备注</View>
              </View>
           </View>
        </View>
      )}
    </View>
  )
}
