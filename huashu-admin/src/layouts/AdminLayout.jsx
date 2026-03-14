import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Tags,
  Settings, History, ShieldAlert, Image, Megaphone, ReceiptText,
  Bell, Wallet, Network, GraduationCap, MessageCircle, Rss,
  ChevronDown, Menu, X, Sparkles, Gift, Drama
} from 'lucide-react';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default false for mobile, CSS handles desktop
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isMentor = admin?.role === 'MENTOR';

  // 分组导航菜单
  const navGroups = [
    {
      name: '核心概览',
      items: [
        { name: '仪表盘', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        ...(!isMentor ? [{ name: '系统设置', path: '/settings', icon: <Settings size={18} /> }] : []),
      ]
    },
    {
      name: '用户与分销',
      items: [
        ...(!isMentor ? [{ name: '用户管理', path: '/users', icon: <Users size={18} /> }] : []),
        ...(!isMentor ? [{ name: '分销商管理', path: '/distributors', icon: <Network size={18} /> }] : []),
        ...(!isMentor ? [{ name: '提现审核', path: '/withdrawals', icon: <Wallet size={18} /> }] : []),
        ...(!isMentor ? [{ name: '订单管理', path: '/orders', icon: <ReceiptText size={18} /> }] : []),
      ].filter(Boolean)
    },
    {
      name: '内容运营',
      items: [
        { name: '话术库管理', path: '/content', icon: <BookOpen size={18} /> },
        ...(!isMentor ? [{ name: '悬浮窗话术', path: '/float-scripts', icon: <Sparkles size={18} /> }] : []),
        ...(!isMentor ? [{ name: '盲盒管理', path: '/blind-box', icon: <Gift size={18} /> }] : []),
        { name: '互动故事', path: '/interactive-stories', icon: <Drama size={18} /> },
        { name: '课程管理', path: '/courses', icon: <GraduationCap size={18} /> },
        { name: '话术分类管理', path: '/categories', icon: <Tags size={18} /> },
        { name: '话术标签管理', path: '/script-tags', icon: <Tags size={18} /> },
        ...(!isMentor ? [{ name: '运营轮播图', path: '/banners', icon: <Image size={18} /> }] : []),
      ]
    },
    {
      name: '审核与互动',
      items: [
        { name: 'UGC 审核', path: '/ugc', icon: <MessageSquare size={18} /> },
        { name: '社区分类管理', path: '/community-categories', icon: <Tags size={18} /> },
        { name: '社区动态墙', path: '/posts', icon: <Rss size={18} /> },
        { name: '评论管理', path: '/comments', icon: <MessageCircle size={18} /> },
        { name: '用户反馈', path: '/feedback', icon: <Megaphone size={18} /> },
      ]
    },
    ...(!isMentor ? [{
      name: '系统安全',
      items: [
        { name: '消息推送', path: '/notifications', icon: <Bell size={18} /> },
        { name: '操作日志', path: '/logs', icon: <History size={18} /> },
        { name: '管理员权限', path: '/admins', icon: <ShieldAlert size={18} /> },
      ]
    }] : [])
  ].filter(group => group.items.length > 0);

  return (
    <div className="flex h-screen bg-[#f4f7fe] font-sans overflow-hidden">
      {/* 移动端菜单遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar 侧边栏 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/95 backdrop-blur-2xl border-r border-indigo-50 shadow-[8px_0_30px_-5px_rgba(0,0,0,0.03)] flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo 区域 */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-indigo-50/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-transform duration-300 ring-2 ring-white">
              <Sparkles className="text-white w-5 h-5 absolute opacity-0 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity" />
              <span className="text-white font-black text-xl leading-none group-hover:opacity-0 transition-opacity duration-300">H</span>
            </div>
            <div>
              <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 text-xl tracking-tight block">话术大师</span>
              <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase">Pro Admin</span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative z-10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* 导航菜单区域 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {/* 分组标题 */}
                <div
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors group select-none"
                  onClick={() => toggleGroup(group.name)}
                >
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all"></span>
                    {group.name}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${collapsedGroups[group.name] ? '-rotate-90' : 'rotate-0'}`} />
                </div>

                {/* 菜单项 */}
                <ul className={`space-y-1 transition-all duration-300 ease-in-out origin-top overflow-hidden ${collapsedGroups[group.name] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                  {group.items.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                              isActive
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 font-semibold translate-x-1'
                                : 'text-slate-500 hover:bg-indigo-50/80 hover:text-indigo-700 hover:translate-x-1 font-medium'
                            }`
                          }
                        >
                          <div className={`absolute inset-0 bg-white opacity-0 ${isActive ? '' : 'group-hover:opacity-10'} transition-opacity`}></div>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                          )}
                          <span className={`mr-3 transition-transform duration-300 ${
                            isActive ? 'text-white scale-110 drop-shadow-sm' : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'
                          }`}>
                            {item.icon}
                          </span>
                          <span className="relative z-10">{item.name}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* 底部用户信息区域 */}
        <div className="p-4 m-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-200 transition-all duration-300">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 p-[2px] shadow-md group-hover:shadow-indigo-500/40 transition-shadow">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 text-lg border-2 border-transparent">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="truncate flex-1">
              <div className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{admin?.username || 'Super Admin'}</div>
              <div className="text-xs text-slate-500 font-medium tracking-wide">{isMentor ? '系统导师' : '高级系统管理员'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-sm"
            title="退出登录"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content 主内容区 */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-[#f8fafc]">
        {/* 顶部 Header */}
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-slate-100/80 flex items-center justify-between px-4 sm:px-8 z-20 shadow-sm">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl mr-3 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900">控制面板</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
             <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 hover:scale-105">
               <Bell size={20} />
               <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
             </button>
             <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
               <span className="relative flex h-2.5 w-2.5 mr-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
               </span>
               <span className="text-sm font-bold text-emerald-700 tracking-wide">系统运行正常</span>
             </div>
          </div>
        </header>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-100 hover:scrollbar-thumb-indigo-200 scrollbar-track-transparent bg-slate-50/50">
          <div className="p-4 sm:p-8 min-h-full">
            <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
