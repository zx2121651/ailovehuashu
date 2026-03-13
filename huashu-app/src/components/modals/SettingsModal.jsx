import React, { useState } from 'react';
import { ChevronLeft, Bell, Trash2, User, ShieldCheck, Info, Moon } from 'lucide-react';
import ProfileListItem from '../common/ProfileListItem';

export default function SettingsModal({ isOpen, onClose, onShowToast }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [cacheSize, setCacheSize] = useState('12.5 MB');

  if (!isOpen) return null;

  const handleClearCache = () => {
    setCacheSize('0.0 MB');
    onShowToast('缓存清理成功');
  };

  const togglePush = () => {
    setPushEnabled(!pushEnabled);
    onShowToast(!pushEnabled ? '已开启消息推送' : '已关闭消息推送');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    onShowToast(!darkMode ? '已切换至深色模式 (模拟)' : '已切换至浅色模式 (模拟)');
  };

  return (
    <div className="absolute inset-0 z-[60] bg-[#F5F7FA] animate-in slide-in-from-right-full duration-300 flex flex-col">
       <div className="bg-white px-5 pt-8 pb-3 z-10 shadow-sm relative flex items-center justify-between">
          <ChevronLeft size={24} className="text-gray-800 cursor-pointer" onClick={onClose} />
          <h1 className="text-lg font-bold text-gray-800">系统设置</h1><div className="w-6"></div>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">

          <div className="bg-white rounded-[1.25rem] shadow-sm p-1">
             <div className="flex justify-between items-center p-4 border-b border-gray-50">
                <div className="flex items-center text-sm font-medium text-gray-800">
                  <Bell size={18} className="text-blue-500 mr-3" />
                  消息推送
                </div>
                <div
                  onClick={togglePush}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${pushEnabled ? 'bg-pink-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                </div>
             </div>

             <div className="flex justify-between items-center p-4 border-b border-gray-50">
                <div className="flex items-center text-sm font-medium text-gray-800">
                  <Moon size={18} className="text-indigo-500 mr-3" />
                  深色模式
                </div>
                <div
                  onClick={toggleDarkMode}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${darkMode ? 'bg-indigo-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                </div>
             </div>

             <ProfileListItem icon={<Trash2 size={18} className="text-gray-500" />} title="清理缓存" subtitle={cacheSize} border={false} onClick={handleClearCache} />
          </div>

          <div className="bg-white rounded-[1.25rem] shadow-sm p-1">
             <ProfileListItem icon={<User size={18} className="text-gray-700" />} title="账号与安全" onClick={() => onShowToast('账号设置开发中')} />
             <ProfileListItem icon={<ShieldCheck size={18} className="text-green-500" />} title="隐私政策" onClick={() => onShowToast('即将打开隐私政策')} />
             <ProfileListItem icon={<Info size={18} className="text-gray-400" />} title="关于我们" subtitle="v2.1.0" border={false} onClick={() => onShowToast('当前已是最新版本')} />
          </div>
          <button className="w-full bg-white text-red-500 font-bold py-3.5 rounded-2xl shadow-sm mt-8 active:bg-gray-50 transition-colors" onClick={() => { onClose(); onShowToast('已退出登录'); }}>退出登录</button>
       </div>
    </div>
  );
}
