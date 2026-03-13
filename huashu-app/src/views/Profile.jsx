import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ProfileListItem from '../components/common/ProfileListItem';
import EditProfileModal from '../components/modals/EditProfileModal';
import PointsDrawer from '../components/modals/PointsDrawer';
import { Copy, Settings, Zap, Target, ChevronRight, Crown, BookOpen, History, Edit3, MessageSquareText, FileText, Sparkles, Heart, Gift, PenTool, Headset, Award, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const {
    setActiveTab, favoriteIds, setShowSettings, setShowVipModal,
    setActiveServicePage, handleCopy, showToast,
    userProfile, setUserProfile, setShowBlindBoxModal
  } = useContext(AppContext);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPointsDrawerOpen, setIsPointsDrawerOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-transparent animate-in fade-in duration-300 relative">
      <div className="bg-gradient-to-b from-pink-200/40 to-[#F5F7FA] px-5 pt-10 pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setIsEditProfileOpen(true)}>
            <div className="w-[68px] h-[68px] love-card p-1 rounded-full shadow-md relative overflow-hidden group-hover:scale-105 transition-transform">
              <img src={userProfile.avatar} className="w-full h-full rounded-full object-cover" alt="User" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Edit3 size={16} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  {userProfile.name} <Edit3 size={12} className="ml-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
                {userProfile.role === 'MENTOR' && (
                   <span className="flex items-center bg-yellow-400 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm shadow-yellow-200">
                     <ShieldCheck size={10} className="mr-0.5" /> 导师
                   </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 flex items-center love-card/60 w-max px-2.5 py-0.5 rounded-full border border-white/40 shadow-sm">
                ID: {userProfile.id} <Copy size={10} className="ml-1 cursor-pointer hover:text-pink-500" onClick={(e) => { e.stopPropagation(); handleCopy(null, userProfile.id); }} />
              </p>
            </div>
          </div>
          <div onClick={() => setShowSettings(true)} className="text-gray-600 cursor-pointer love-card/50 p-2 rounded-full shadow-sm backdrop-blur-sm hover:text-pink-500 transition-colors"><Settings size={20} /></div>
        </div>

        <div className="flex justify-around love-card rounded-[1.25rem] p-4 shadow-sm mt-5 mb-1 border border-white/50">
          <div className="text-center flex flex-col items-center">
            <div className="font-extrabold text-[20px] text-gray-800">{userProfile.daysLearned}<span className="text-[10px] text-gray-400 font-normal ml-0.5">天</span></div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">累计学习</div>
          </div>
          <div className="w-px h-8 bg-gray-100 mt-1"></div>
          <div className="text-center flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('favorites')}>
            <div className="font-extrabold text-[20px] text-gray-800">{favoriteIds.length}<span className="text-[10px] text-gray-400 font-normal ml-0.5">条</span></div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">我的收藏</div>
          </div>
          <div className="w-px h-8 bg-gray-100 mt-1"></div>
          <div className="text-center flex flex-col items-center" onClick={() => setIsPointsDrawerOpen(true)}>
            <div className="font-extrabold text-[18px] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 flex items-center mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">{userProfile.rank}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">当前段位</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide pb-24">

        <div className="flex space-x-3 mb-4 mt-2">
           <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-orange-100 cursor-pointer active:scale-95 transition-transform" onClick={() => setIsPointsDrawerOpen(true)}>
              <div>
                 <p className="text-[11px] text-orange-600 font-medium mb-0.5">我的积分</p>
                 <div className="flex items-center">
                   <p className="text-lg font-extrabold text-orange-700 tracking-tight">{userProfile.points}</p>
                   {userProfile.continuousSignDays > 0 && (
                     <span className="ml-1.5 text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">连签{userProfile.continuousSignDays}天</span>
                   )}
                 </div>
              </div>
              <div className="w-8 h-8 bg-orange-200/60 rounded-full flex items-center justify-center text-orange-600 shadow-sm"><Zap size={16}/></div>
           </div>
           <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm border border-blue-100 cursor-pointer active:scale-95 transition-transform" onClick={() => setShowBlindBoxModal(true)}>
              <div>
                 <p className="text-[11px] text-blue-600 font-medium mb-1">每日盲盒</p>
                 <p className="text-[13px] font-bold text-blue-700 flex items-center">抽盲盒 <ChevronRight size={14} className="ml-0.5"/></p>
              </div>
              <div className="w-8 h-8 bg-blue-200/60 rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Target size={16}/></div>
           </div>
        </div>

        <div onClick={() => setShowVipModal(true)} className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[1.25rem] p-4 shadow-lg shadow-gray-400/20 relative overflow-hidden group cursor-pointer border border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-center relative z-10 p-0.5">
            <div className="flex items-center text-yellow-400">
              <Crown size={22} className="mr-2.5 drop-shadow-md" />
              <div className="flex flex-col">
                 <span className="font-bold text-[16px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">解锁终身会员</span>
                 <p className="text-gray-400 text-[10px] mt-0.5 font-medium">10,000+ 话术 & AI 导师无限聊</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-yellow-500/20 pointer-events-none">立即开通</button>
          </div>
        </div>

        <div className="love-card rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center"><BookOpen size={16} className="text-indigo-500 mr-1.5" /> 我的内容</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'history', icon: <History size={20} className="text-indigo-500" />, label: '浏览足迹' },
              { id: 'contributions', icon: <Edit3 size={20} className="text-green-500" />, label: '我的贡献' },
              { id: 'ai-history', icon: <MessageSquareText size={20} className="text-purple-500" />, label: 'AI 记录' },
              { id: 'notes', icon: <FileText size={20} className="text-orange-500" />, label: '错题本' }
            ].map((item, i) => (
              <div key={i} onClick={() => setActiveServicePage({ id: item.id })} className="flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity">
                <div className="bg-transparent p-2.5 rounded-full mb-1.5 border border-transparent/80">{item.icon}</div>
                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="love-card rounded-[1.25rem] shadow-sm p-4 mb-4 border border-gray-50">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center"><Sparkles size={16} className="text-pink-500 mr-1.5" /> 核心服务</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'distributor', icon: <Gift size={20} className="text-red-500" />, label: '分销中心' },
              { id: 'assessment', icon: <Heart size={20} className="text-pink-500" />, label: '恋爱评测' },
              { id: 'custom', icon: <PenTool size={20} className="text-blue-500" />, label: '话术定制' },
              { id: 'support', icon: <Headset size={20} className="text-orange-500" />, label: '专属客服' }
            ].map((item, i) => (
              <div key={i} onClick={() => item.id === 'distributor' ? setActiveTab('distributor') : setActiveServicePage({ id: item.id })} className="flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity">
                <div className="bg-transparent p-2.5 rounded-full mb-1.5 border border-transparent/80">{item.icon}</div>
                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {userProfile.role === 'MENTOR' && (
          <div className="bg-yellow-50 rounded-[1.25rem] shadow-sm p-1 border border-yellow-100 mb-5">
            <ProfileListItem
              icon={<ShieldCheck size={18} className="text-yellow-600" />}
              title="导师工作台"
              subtitle="管理与特权"
              border={false}
              onClick={() => showToast('导师管理系统功能正在开发中')}
            />
          </div>
        )}

        <div className="love-card rounded-[1.25rem] shadow-sm p-1 border border-gray-50">
          <ProfileListItem icon={<Award size={18} className="text-yellow-500" />} title="我的特权" subtitle="去查看" onClick={() => setShowVipModal(true)} />
          <ProfileListItem icon={<HelpCircle size={18} className="text-gray-500" />} title="帮助与反馈" border={false} onClick={() => setActiveServicePage({ id: 'feedback' })} />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        setProfile={setUserProfile}
        onShowToast={showToast}
      />

      <PointsDrawer
        isOpen={isPointsDrawerOpen}
        onClose={() => setIsPointsDrawerOpen(false)}
        profile={userProfile}
        onShowToast={showToast}
      />
    </div>
  );
}
