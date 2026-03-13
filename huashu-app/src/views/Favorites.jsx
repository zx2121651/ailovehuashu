import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { allScripts } from '../data/mockData';
import ScrollableRow from '../components/common/ScrollableRow';
import ScriptCard from '../components/common/ScriptCard';
import ShareDrawer from '../components/modals/ShareDrawer';
import { Search, FileDown, X, FolderHeart, PlusCircle, CheckSquare, Square, Trash2, Edit2, Heart, FolderPlus, MoreHorizontal, ArrowRightLeft } from 'lucide-react';

export default function Favorites() {
  const {
    favoriteIds, setFavoriteIds, copiedId, handleCopy, toggleFavorite,
    setRepliesDrawerScript, showToast,
    customFolders, setCustomFolders,
    scriptFolders, setScriptFolders,
    favNotes, setFavNotes
  } = useContext(AppContext);

  const [favFilter, setFavFilter] = useState('全部');
  const [isEditFav, setIsEditFav] = useState(false);
  const [checkedFavs, setCheckedFavs] = useState([]);
  const [isFavSearchVisible, setIsFavSearchVisible] = useState(false);
  const [favSearchQuery, setFavSearchQuery] = useState('');

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  // Folder Management State
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingScriptId, setMovingScriptId] = useState(null);

  // Sorting State
  const [favSortOrder, setFavSortOrder] = useState('newest'); // 'newest', 'oldest', 'category'
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Sharing State
  const [sharingScript, setSharingScript] = useState(null);

  const [myFavsData, setMyFavsData] = useState([]);

  React.useEffect(() => {
    // 假设在真实环境中我们会调用 api 获取带有详情的完整收藏列表
    // 此处仅做模拟：由于前面 AppContext 中提取了 favoriteIds 数组，
    // 我们用 mockData 根据 ids 组装出当前应展示的内容，
    // 如果后端数据已经完整包含 targetDetail，可直接使用。
    setMyFavsData(allScripts.filter(s => favoriteIds.includes(s.id)));

  }, [favoriteIds]);

  let myFavs = [...myFavsData];

  // Filter by Folder (which replaced the old type filters)
  if (favFilter !== '全部') {
     myFavs = myFavs.filter(s => scriptFolders[s.id] === favFilter);
  }
  if (favSearchQuery) {
     myFavs = myFavs.filter(s => s.question.includes(favSearchQuery) || s.answers.some(a => a.includes(favSearchQuery)));
  }

  // Apply Sorting
  // Mocking "add time" by using the script's array index for simplicity in this demo.
  // In a real app, favorites would have a timestamp. Here, id=1 was added first, id=4 later, etc.
  myFavs.sort((a, b) => {
    const idxA = favoriteIds.indexOf(a.id);
    const idxB = favoriteIds.indexOf(b.id);

    if (favSortOrder === 'newest') {
      return idxB - idxA;
    } else if (favSortOrder === 'oldest') {
      return idxA - idxB;
    } else if (favSortOrder === 'category') {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });

  const toggleFavCheck = (id) => setCheckedFavs(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

  const handleBatchDelete = () => {
    if(checkedFavs.length === 0) return setIsEditFav(false);
    setFavoriteIds(prev => prev.filter(id => !checkedFavs.includes(id)));
    // Also cleanup scriptFolders
    setScriptFolders(prev => {
      const next = { ...prev };
      checkedFavs.forEach(id => delete next[id]);
      return next;
    });
    setCheckedFavs([]);
    setIsEditFav(false);
    showToast(`已删除 ${checkedFavs.length} 条收藏`);
  };

  const handleSaveNote = () => {
    if (editingNoteId !== null) {
      setFavNotes(prev => ({ ...prev, [editingNoteId]: tempNoteContent }));
      showToast('备注已保存');
      setEditingNoteId(null);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return showToast('文件夹名称不能为空');
    if (customFolders.includes(newFolderName) || newFolderName === '全部' || newFolderName === '默认收藏') {
      return showToast('该文件夹名称已存在');
    }
    setCustomFolders(prev => [...prev, newFolderName]);
    setIsCreateFolderModalOpen(false);
    setNewFolderName('');
    showToast('文件夹创建成功');
  };

  const handleMoveScript = (folder) => {
    if (movingScriptId !== null) {
      if (folder === '默认收藏') {
        setScriptFolders(prev => {
          const next = {...prev};
          delete next[movingScriptId];
          return next;
        });
      } else {
        setScriptFolders(prev => ({ ...prev, [movingScriptId]: folder }));
      }
      setMovingScriptId(null);
      showToast('移动成功');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F7FA] animate-in fade-in slide-in-from-right-4 duration-300 relative">
      <div className="bg-white px-5 pt-8 pb-3 z-10 shadow-sm relative flex items-center justify-between">
         <div className="w-8"></div>
         <h1 className="text-lg font-bold text-gray-800 text-center">我的收藏</h1>
         <div className="flex space-x-3 text-gray-600">
           <Search size={20} className="cursor-pointer hover:text-pink-500" onClick={() => setIsFavSearchVisible(!isFavSearchVisible)} />
           <FileDown size={20} className="cursor-pointer hover:text-blue-500" onClick={() => showToast('已将收藏导出至本地')} />
         </div>
      </div>

      {isFavSearchVisible && (
        <div className="bg-white px-5 py-3 border-b border-gray-100 animate-in slide-in-from-top-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={14} className="text-gray-400" /></div>
            <input
              type="text" value={favSearchQuery} onChange={(e) => setFavSearchQuery(e.target.value)}
              placeholder="在收藏中搜索..."
              className="w-full bg-gray-100/80 rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border focus:border-pink-300 transition-all"
            />
            {favSearchQuery && <X size={14} className="absolute inset-y-0 right-3 top-2 text-gray-400 cursor-pointer" onClick={() => setFavSearchQuery('')} />}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
        <ScrollableRow className="flex space-x-2 mb-4 pb-1">
          <span onClick={() => setFavFilter('全部')} className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === '全部' ? 'bg-gray-800 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}>全部</span>
          {customFolders.map(folder => (
            <span key={folder} onClick={() => setFavFilter(folder)} className={`text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm flex items-center ${favFilter === folder ? 'bg-pink-500 text-white font-bold' : 'bg-white text-gray-600 border border-gray-100'}`}>
              <FolderHeart size={12} className="mr-1"/> {folder}
            </span>
          ))}
          <span onClick={() => setIsCreateFolderModalOpen(true)} className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors bg-gray-50 text-gray-500 border border-dashed border-gray-300 flex items-center"><PlusCircle size={12} className="mr-1"/> 新建</span>
        </ScrollableRow>

        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs text-gray-500 font-medium">共找到 <span className="text-pink-500 font-bold">{myFavs.length}</span> 条内容</span>

          <div className="flex items-center space-x-2">
            <div className="relative">
               <span onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="text-[11px] bg-white shadow-sm border border-gray-100 px-3 py-1 rounded-full cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
                 <ArrowRightLeft size={10} className="mr-1 rotate-90" />
                 {favSortOrder === 'newest' ? '最新添加' : favSortOrder === 'oldest' ? '最早添加' : '按分类'}
               </span>
               {isSortDropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)}></div>
                   <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95">
                      <div onClick={() => { setFavSortOrder('newest'); setIsSortDropdownOpen(false); }} className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-pink-50 ${favSortOrder==='newest' ? 'text-pink-500 font-bold' : 'text-gray-600'}`}>最新添加</div>
                      <div onClick={() => { setFavSortOrder('oldest'); setIsSortDropdownOpen(false); }} className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-pink-50 ${favSortOrder==='oldest' ? 'text-pink-500 font-bold' : 'text-gray-600'}`}>最早添加</div>
                      <div onClick={() => { setFavSortOrder('category'); setIsSortDropdownOpen(false); }} className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-pink-50 ${favSortOrder==='category' ? 'text-pink-500 font-bold' : 'text-gray-600'}`}>按分类排序</div>
                   </div>
                 </>
               )}
            </div>

            {myFavs.length > 0 && (
              <span onClick={() => { setIsEditFav(!isEditFav); setCheckedFavs([]); setIsSortDropdownOpen(false); }} className={`text-[11px] bg-white shadow-sm border px-3 py-1 rounded-full cursor-pointer transition-colors ${isEditFav ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                {isEditFav ? '取消管理' : '批量管理'}
              </span>
            )}
          </div>
        </div>

        {myFavs.length > 0 ? (
          <div className="space-y-4 animate-fade-in-up">
            {myFavs.map(script => (
              <div key={script.id} className="relative flex items-start">
                {isEditFav && (
                  <div className="mr-3 mt-4 animate-in fade-in slide-in-from-left-2" onClick={() => toggleFavCheck(script.id)}>
                    {checkedFavs.includes(script.id) ? <CheckSquare className="text-pink-500" /> : <Square className="text-gray-300" />}
                  </div>
                )}
                <div className={`flex-1 transition-all ${isEditFav ? 'opacity-80 pointer-events-none' : ''}`}>
                  <div className="relative z-10">
                    <ScriptCard script={script} copiedId={copiedId} onCopy={handleCopy} isFavorite={true} onToggleFav={() => toggleFavorite(script.id)} onShowMore={() => setRepliesDrawerScript(script)} onShare={(s) => setSharingScript(s)} />
                  </div>
                  {/* Action Bar for each favorite */}
                  <div className="bg-white/80 backdrop-blur-sm border-t border-gray-100 rounded-b-[1rem] px-3 py-2 -mt-3 pt-4 flex justify-between items-center relative z-0 shadow-sm">
                     <div className="flex-1 text-[11px] text-gray-500 truncate pr-2" onClick={() => { setEditingNoteId(script.id); setTempNoteContent(favNotes[script.id] || ''); }}>
                       {favNotes[script.id] ? (
                         <span className="flex items-center text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full max-w-fit truncate"><Edit2 size={10} className="mr-1 shrink-0 text-pink-500"/> {favNotes[script.id]}</span>
                       ) : (
                         <span className="flex items-center text-gray-400 hover:text-pink-500 transition-colors cursor-pointer"><Edit2 size={10} className="mr-1"/> 添加备注</span>
                       )}
                     </div>
                     <div className="flex items-center space-x-2 shrink-0">
                       <button onClick={() => setMovingScriptId(script.id)} className="text-[10px] text-gray-500 hover:text-blue-500 flex items-center bg-gray-50 px-2 py-1 rounded transition-colors">
                         <FolderPlus size={12} className="mr-1" /> {scriptFolders[script.id] || '移动'}
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <Heart size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">没找到相关的收藏内容呢</p>
              <button className="mt-4 bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full shadow-sm" onClick={() => { setFavSearchQuery(''); setFavFilter('全部'); }}>清除条件</button>
           </div>
        )}
      </div>

      {isEditFav && (
        <div className="absolute bottom-20 w-full bg-white border-t border-gray-100 p-3 px-5 z-40 flex justify-between items-center animate-in slide-in-from-bottom-5">
           <div className="flex items-center text-sm text-gray-600 cursor-pointer" onClick={() => setCheckedFavs(checkedFavs.length === myFavs.length ? [] : myFavs.map(m=>m.id))}>
              {checkedFavs.length === myFavs.length ? <CheckSquare className="text-pink-500 mr-2" /> : <Square className="text-gray-300 mr-2" />} 全选
           </div>
           <button onClick={handleBatchDelete} className={`flex items-center text-sm px-5 py-2 rounded-full font-bold shadow-md transition-all ${checkedFavs.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
             <Trash2 size={16} className="mr-1" /> 删除 {checkedFavs.length > 0 ? `(${checkedFavs.length})` : ''}
           </button>
        </div>
      )}

      {isCreateFolderModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsCreateFolderModalOpen(false)}></div>
           <div className="bg-white w-[80%] rounded-2xl p-5 relative z-10 animate-in zoom-in-95 duration-200 shadow-xl">
              <h3 className="font-bold text-gray-800 text-[15px] mb-3 text-center">新建收藏夹</h3>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="例如：约会必杀技"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-pink-300 focus:bg-white transition-all shadow-inner text-center"
              />
              <div className="flex space-x-3 mt-4">
                <button onClick={() => setIsCreateFolderModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl active:bg-gray-200 transition-colors text-sm">取消</button>
                <button onClick={handleCreateFolder} className="flex-1 bg-pink-500 text-white font-bold py-2 rounded-xl shadow-md shadow-pink-200 active:scale-95 transition-transform text-sm">确定</button>
              </div>
           </div>
        </div>
      )}

      {movingScriptId !== null && (
        <div className="absolute inset-x-0 bottom-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm h-[100vh] -translate-y-full animate-in fade-in duration-200" onClick={() => setMovingScriptId(null)}></div>
          <div className="bg-white rounded-t-2xl p-4 pb-8 relative z-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800 text-[15px]">移动至收藏夹</h3>
               <button onClick={() => setMovingScriptId(null)}><X size={18} className="text-gray-400"/></button>
             </div>
             <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                <button
                  onClick={() => handleMoveScript('默认收藏')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between transition-colors ${!scriptFolders[movingScriptId] ? 'bg-pink-50 text-pink-600 font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="flex items-center"><FolderHeart size={16} className="mr-2 opacity-70"/> 默认收藏</span>
                  {!scriptFolders[movingScriptId] && <CheckSquare size={16} />}
                </button>
                {customFolders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => handleMoveScript(folder)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between transition-colors ${scriptFolders[movingScriptId] === folder ? 'bg-pink-50 text-pink-600 font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="flex items-center"><FolderHeart size={16} className="mr-2 opacity-70"/> {folder}</span>
                    {scriptFolders[movingScriptId] === folder && <CheckSquare size={16} />}
                  </button>
                ))}
                <button onClick={() => { setMovingScriptId(null); setIsCreateFolderModalOpen(true); }} className="w-full text-center px-4 py-3 rounded-xl text-sm text-blue-500 border border-dashed border-blue-200 bg-blue-50/50 flex items-center justify-center font-medium mt-2">
                  <PlusCircle size={16} className="mr-1" /> 新建收藏夹
                </button>
             </div>
          </div>
        </div>
      )}

      {editingNoteId !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingNoteId(null)}></div>
           <div className="bg-white w-[85%] rounded-[1.5rem] p-5 relative z-10 animate-in zoom-in-95 duration-200 shadow-xl">
              <h3 className="font-bold text-gray-800 text-[15px] mb-3 flex items-center"><Edit2 size={16} className="mr-1.5 text-pink-500"/> 编辑话术备注</h3>
              <textarea
                autoFocus
                value={tempNoteContent}
                onChange={(e) => setTempNoteContent(e.target.value)}
                placeholder="例如：准备在跨年夜用这句表白..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-pink-300 focus:bg-white transition-all resize-none shadow-inner"
                rows={4}
              />
              <div className="flex space-x-3 mt-4">
                <button onClick={() => setEditingNoteId(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl active:bg-gray-200 transition-colors text-sm">取消</button>
                <button onClick={handleSaveNote} className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-pink-200 active:scale-95 transition-transform text-sm">保存备注</button>
              </div>
           </div>
        </div>
      )}

      {/* Share Drawer */}
      <ShareDrawer isOpen={sharingScript !== null} onClose={() => setSharingScript(null)} script={sharingScript} />
    </div>
  );
}
