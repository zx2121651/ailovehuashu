import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategories, getScripts, getHotSearches, getScriptSortTabs, getCategoryTags } from '../services/api';
import ScrollableRow from '../components/common/ScrollableRow';
import ScriptCard from '../components/common/ScriptCard';
import {  Search, X, RefreshCw, Flame, Compass, TrendingUp, ChevronRight, Edit3, MessageCircle, Sparkles, PenTool , Heart } from 'lucide-react';

export default function Discover() {
  const {
    discoverState, setDiscoverState,
    setActiveServicePage,
    copiedId, handleCopy,
    favoriteIds, toggleFavorite,
    setRepliesDrawerScript, setIsContributeDrawerOpen,
    showToast, setActiveTab, setAiState
  } = useContext(AppContext);

  const { activeCategory, searchQuery, sort, filterTag, activeTag, isSearchFocused } = discoverState;

  const [categories, setCategories] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [hotSearches, setHotSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortTabs, setSortTabs] = useState([]);
  const [categoryTags, setCategoryTags] = useState([]);

  // 从 API 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, hotWords, tabs] = await Promise.all([
          getCategories(),
          getHotSearches(),
          getScriptSortTabs()
        ]);
        setCategories(cats);
        setHotSearches(hotWords);
        setSortTabs(tabs);
        
        // 设置默认排序
        const defaultTab = tabs.find(t => t.isDefault);
        if (defaultTab) {
          setDiscoverState(prev => ({ ...prev, sort: defaultTab.label }));
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        showToast('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  // 当分类变化时，获取该分类的标签
  useEffect(() => {
    const fetchCategoryTags = async () => {
      if (!activeCategory) {
        setCategoryTags([]);
        return;
      }
      try {
        const tags = await getCategoryTags(activeCategory);
        // 添加 "全部" 到标签列表开头
        setCategoryTags([{ id: 'all', name: '全部' }, ...tags]);
      } catch (error) {
        console.error('获取分类标签失败:', error);
      }
    };

    fetchCategoryTags();

  }, [activeCategory]);

  // 根据分类或搜索词获取话术
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const params = {};
        
        if (searchQuery) {
          params.keyword = searchQuery;
        } else if (activeCategory) {
          params.categoryId = activeCategory;
        }
        
        // 排序
        if (sort === '最新') {
          params.sort = 'new';
        } else if (sort === '最热') {
          params.sort = 'hot';
        }

        const data = await getScripts(params);
        setScripts(data.list || []);
      } catch (error) {
        console.error('获取话术失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();

  }, [activeCategory, searchQuery, sort]);

  const executeSearch = (query) => {
    if (!query.trim()) return;
    setDiscoverState(prev => ({ ...prev, searchQuery: query, activeCategory: null, filterTag: '全部', activeTag: '全部', isSearchFocused: false }));
  };

  // 本地过滤
  let filteredScripts = scripts;

  if (filterTag !== '全部') {
    filteredScripts = filteredScripts.filter(s => s.type && s.type.includes(filterTag));
  }

  if (activeTag !== '全部') {
    filteredScripts = filteredScripts.filter(s => s.tags?.includes(activeTag));
  }

  if (sort === '最新') {
    filteredScripts = [...filteredScripts].sort((a, b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
  } else if (sort === '最热') {
    filteredScripts = [...filteredScripts].sort((a, b) => b.likes - a.likes);
  }

  const currentCat = categories.find(c => c.id === activeCategory);
  const featuredScripts = scripts.filter(s => s.isFeatured);

  if (loading && categories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in slide-in-from-right-4 duration-300 relative">
      <div className="bg-white px-5 pt-8 pb-3 z-30 shadow-sm relative flex items-center border-b border-gray-100">
        <div className="relative flex-1">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className={`transition-colors ${isSearchFocused ? 'text-pink-500' : 'text-gray-400'}`} /></div>
           <input
              type="text" value={searchQuery} onChange={(e) => setDiscoverState(prev => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => setDiscoverState(prev => ({ ...prev, isSearchFocused: true }))}
              onBlur={() => setTimeout(() => setDiscoverState(prev => ({ ...prev, isSearchFocused: false })), 200)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
              placeholder="搜索库内话术..."
              className={`w-full bg-gray-100/80 rounded-full py-2 pl-9 pr-8 text-[13px] outline-none transition-all ${isSearchFocused ? 'bg-pink-50/50 border border-pink-200' : 'border border-transparent focus:border-pink-300'}`}
           />
           {searchQuery && <X size={14} className="absolute inset-y-0 right-3 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setDiscoverState(prev => ({ ...prev, searchQuery: '' }))} />}
        </div>
      </div>

      {isSearchFocused && !searchQuery && (
        <>
          <div className="absolute inset-0 bg-black/20 z-20 top-[68px] animate-in fade-in duration-200"></div>
          <div className="absolute top-[68px] left-0 right-0 bg-white z-30 p-5 shadow-lg border-b border-gray-100 rounded-b-3xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">全网热搜</h3>
              <RefreshCw size={14} className="text-gray-400 cursor-pointer hover:text-pink-500 transition-transform active:rotate-180 duration-300" onClick={() => showToast('已刷新热搜词')} />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {hotSearches.map((hot, idx) => (
                <span
                  key={idx}
                  onClick={() => { setDiscoverState(prev => ({ ...prev, searchQuery: hot, isSearchFocused: false })); }}
                  className={`text-xs px-3.5 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm ${idx < 2 ? 'text-pink-600 bg-pink-50 font-medium border border-pink-100' : 'text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}
                >
                  {idx < 2 && <Flame size={12} className="inline mr-1 text-red-500" />}
                  {hot}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-1 overflow-hidden bg-gray-50 relative z-10">
        <div className="w-[90px] bg-rose-50/30 backdrop-blur-md overflow-y-auto scrollbar-hide pb-24 border-r border-rose-100/60 shadow-[2px_0_15px_-5px_rgba(244,63,94,0.05)] z-10">
          {categories.map(cat => (
            <div key={cat.id} onClick={() => { setDiscoverState({ activeCategory: cat.id, searchQuery: '', sort: '推荐', filterTag: '全部', activeTag: '全部', isSearchFocused: false }); }} className={`py-4 flex flex-col items-center justify-center relative transition-colors cursor-pointer ${activeCategory === cat.id && !searchQuery ? 'bg-white shadow-[inset_4px_0_0_#F43F5E]' : 'hover:bg-rose-50/50'}`}>
              <div className="relative"><span className={`text-[22px] mb-1 block transition-transform transform ${activeCategory === cat.id && !searchQuery ? 'scale-110' : ''}`}>{cat.icon}</span></div>
              <span className={`text-[11px] mt-1 ${activeCategory === cat.id && !searchQuery ? 'text-pink-600 font-bold' : 'text-gray-500 font-medium'}`}>{cat.name}</span>
              <span className="text-[9px] text-gray-400 mt-0.5 scale-90">{cat.count} 篇</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pb-24 bg-[#F8F9FA] relative">
          <div className="animate-fade-in-up">
            <div className="sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-md z-20 pb-2 pt-1 mb-2 border-b border-gray-200/50">
              <div className="flex justify-between items-center px-1 mb-2">
                <h3 className="font-bold text-gray-800 flex items-center">
                  {searchQuery ? `包含 "${searchQuery}"` : currentCat?.name}
                  <span className="ml-2 text-xs font-normal bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{filteredScripts.length} 条</span>
                </h3>
              </div>
              <ScrollableRow className="flex items-center space-x-2 pb-1">
                {sortTabs.map(sortTab => (
                  <span
                    key={sortTab.key}
                    onClick={() => setDiscoverState(prev => ({ ...prev, sort: sortTab.label }))}
                    className={`text-[11px] px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm cursor-pointer transition-colors ${sort === sortTab.label ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
                  >
                    {sortTab.label}
                  </span>
                ))}
              </ScrollableRow>
            </div>

            {!searchQuery && (
              <>
                <ScrollableRow className="flex items-center space-x-2 mb-4 pb-1">
                  {categoryTags.map(tag => (
                    <span
                      key={tag.id}
                      onClick={() => setDiscoverState(prev => ({ ...prev, activeTag: tag.name }))}
                      className={`text-[11px] px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer shadow-sm ${activeTag === tag.name ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md shadow-rose-200/50 border-none' : 'bg-white text-gray-500 border border-rose-100/60 hover:border-rose-300 hover:text-rose-500'}`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </ScrollableRow>

                {featuredScripts.length > 0 && activeTag === '全部' && (
                  <div className="mb-5">
                    <h3 className="text-sm font-extrabold text-gray-800 mb-3 px-1 flex items-center"><Flame size={16} className="text-red-500 mr-1.5" /> 每日精选</h3>
                    <ScrollableRow className="flex space-x-3 pb-2">
                      {featuredScripts.map(script => (
                        <div key={'featured-'+script.id} onClick={() => setRepliesDrawerScript(script)} className="min-w-[85%] bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/60 p-4 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform">
                           <div className="flex items-center mb-2">
                              <span className="bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">官方推荐</span>
                           </div>
                           <p className="font-bold text-[14px] text-gray-900 line-clamp-2 leading-snug mb-2.5">{script.question}</p>
                           <p className="text-[12px] text-indigo-700/80 bg-white/60 p-2.5 rounded-xl line-clamp-2 border border-white/50">{script.answers?.[0] || '暂无回复'}</p>
                        </div>
                      ))}
                    </ScrollableRow>
                  </div>
                )}

                <div className="mb-4 bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 text-white shadow-md shadow-pink-200 relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveServicePage({ id: 'topic' })}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-600/30 rounded-full blur-lg"></div>
                  <div className="relative z-10">
                    <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm mb-1.5 flex items-center w-max border border-white/20"><Compass size={12} className="mr-1"/> 必看专题</span>
                    <h4 className="font-bold text-[15px] mb-0.5">七夕特辑：高分表白话术</h4>
                    <p className="text-[11px] text-white/90 flex items-center"><TrendingUp size={12} className="mr-1"/> 收录 50+ 句直击灵魂的告白</p>
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative z-10 border border-white/30">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>

              </>
            )}

            {filteredScripts.length > 0 ? (
              <div className="space-y-3">
                {filteredScripts.map(script => (
                  <ScriptCard key={script.id} script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={favoriteIds.includes(script.id)} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} simple={false} />
                ))}
                <div className="text-center text-xs text-gray-400 mt-6 pb-4">- 到底啦，快去实战吧 -</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 opacity-80">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4"><MessageCircle size={32} className="text-gray-400" /></div>
                <p className="text-sm text-gray-600 font-bold mb-1">未找到匹配的话术</p>
                <p className="text-xs text-gray-400 mb-6 text-center px-4">你可以尝试更换搜索词，或者直接让 AI 导师为你定制专属回复</p>
                <div className="flex space-x-3 w-full px-6">
                  <button className="flex-1 text-xs bg-white border border-gray-200 py-2.5 rounded-xl text-gray-600 shadow-sm font-medium" onClick={() => setDiscoverState(prev => ({ ...prev, searchQuery: '' }))}>清除搜索</button>
                  <button className="flex-1 text-xs bg-pink-500 text-white py-2.5 rounded-xl shadow-md shadow-pink-200 font-bold flex items-center justify-center" onClick={() => { setActiveTab('ai'); setAiState({ chatInput: searchQuery }); }}>
                    <Sparkles size={14} className="mr-1" /> 问 AI 导师
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-24 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.3)] ring-2 ring-white/50 flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-40 group px-3.5 py-2.5 space-x-1.5"
          onClick={() => setIsContributeDrawerOpen(true)}
        >
          <PenTool size={16} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-bold">发布话术</span>
        </div>
      </div>
    </div>
  );
}
