import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import NavItem from './components/common/NavItem';
import HomeView from './views/Home';
import DiscoverView from './views/Discover';
import AIView from './views/AI';
import FavoritesView from './views/Favorites';
import ProfileView from './views/Profile';
import VipModal from './components/modals/VipModal';
import SettingsModal from './components/modals/SettingsModal';
import RepliesDrawer from './components/modals/RepliesDrawer';
import BlindBoxModal from './components/modals/BlindBoxModal';
import ContributeDrawer from './components/modals/ContributeDrawer';
import Toast from './components/modals/Toast';
import ServicePages from './views/ServicePages';
import StoryList from './pages/story/StoryList';
import StoryPlay from './pages/story/StoryPlay';
import Community from './views/Community';
import DistributorCenter from './views/distributor/DistributorCenter';
import MyTeam from './views/distributor/MyTeam';
import Withdrawal from './views/distributor/Withdrawal';
import Login from './views/Login';
import { Home, MessageCircle, Sparkles, Star, User, Rss } from 'lucide-react';
import './App.css';

function MainApp() {
  const {
    token,
    activeTab, setActiveTab,
    showVipModal, setShowVipModal,
    showSettings, setShowSettings,
    showBlindBoxModal, setShowBlindBoxModal,
    userProfile, setUserProfile,
    repliesDrawerScript, setRepliesDrawerScript,
    copiedId, handleCopy,
    toastMsg, showToast
  } = useContext(AppContext);

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-md h-[100dvh] bg-white sm:shadow-xl sm:border-x sm:border-gray-200 overflow-hidden relative flex flex-col mx-auto">

        {!token ? (
          <Login />
        ) : (
          <>
            <div className="flex-1 overflow-hidden relative bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'auto' }}>
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'discover' && <DiscoverView />}
          {activeTab === 'community' && <Community />}
          {activeTab === 'ai' && <AIView />}
          {activeTab === 'favorites' && <FavoritesView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'distributor' && <DistributorCenter />}
          {activeTab === 'distributor_team' && <MyTeam />}
          {activeTab === 'distributor_withdraw' && <Withdrawal />}
          {activeTab === 'story' && <StoryList />}
          {activeTab === 'story_play' && <StoryPlay />}
        </div>

            <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2.5 px-5 pb-6 z-30 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mt-1.5 relative">
                <NavItem icon={<Home size={22} />} label="首页" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavItem icon={<Star size={22} />} label="剧本杀" isActive={activeTab === 'story'} onClick={() => setActiveTab('story')} />
                <NavItem icon={<MessageCircle size={22} />} label="话术库" isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
                <NavItem icon={<Rss size={22} />} label="圈子" isActive={activeTab === 'community'} onClick={() => setActiveTab('community')} />
                <NavItem icon={<Star size={22} />} label="收藏" isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                <NavItem icon={<User size={22} />} label="我的" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
              </div>
            </div>

            {/* Floating AI Button (moved from nav to bottom-right to fit 5 tabs) */}
            {activeTab !== 'ai' && activeTab !== 'community' && (
              <div onClick={() => setActiveTab('ai')} className="fixed bottom-[105px] right-5 w-14 h-14 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-gray-400/30 cursor-pointer active:scale-95 transition-transform z-40 border-2 border-white">
                 <Sparkles size={24} className="animate-pulse" />
              </div>
            )}

            <RepliesDrawer script={repliesDrawerScript} onClose={() => setRepliesDrawerScript(null)} copiedId={copiedId} onCopy={handleCopy} />
            <ContributeDrawer />
            <VipModal isOpen={showVipModal} onClose={() => setShowVipModal(false)} onShowToast={showToast} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onShowToast={showToast} />
            <BlindBoxModal
              isOpen={showBlindBoxModal}
              onClose={() => setShowBlindBoxModal(false)}
              user={userProfile}
              onSignInSuccess={(data) => {
                setUserProfile(prev => ({
                  ...prev,
                  points: data.totalPoints,
                  continuousSignDays: data.continuousDays,
                  lastSignInAt: new Date().toISOString()
                }));
              }}
              showToast={showToast}
            />
            <ServicePages />
          </>
        )}
        <Toast message={toastMsg} />
      </div>
    </div>
  );
}

export default MainApp;
