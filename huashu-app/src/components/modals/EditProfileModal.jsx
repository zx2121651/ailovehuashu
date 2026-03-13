import React, { useState } from 'react';
import { X, Camera, Save, User as UserIcon, Heart, AlignLeft } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, profile, setProfile, onShowToast }) {


  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleSave = () => {
    if (!tempProfile.name.trim()) {
      onShowToast('昵称不能为空');
      return;
    }
    setProfile(tempProfile);
    onShowToast('个人资料已保存');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="bg-[#F5F7FA] rounded-t-3xl w-full max-h-[90vh] flex flex-col relative z-10 animate-in slide-in-from-bottom-full duration-300">

        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-white rounded-t-3xl shadow-sm z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            编辑资料
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="relative group cursor-pointer" onClick={() => onShowToast('头像更换开发中...')}>
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                <img src={tempProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 bg-pink-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Camera size={12} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">点击更换头像</p>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-gray-50 space-y-4">

            {/* Nickname */}
            <div>
              <label className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center">
                <UserIcon size={12} className="mr-1" /> 昵称
              </label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-pink-300 focus:bg-white transition-all shadow-inner"
                placeholder="请输入昵称"
                maxLength={12}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center">
                <Heart size={12} className="mr-1" /> 性别
              </label>
              <div className="flex space-x-3">
                {['男生', '女生', '保密'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setTempProfile({...tempProfile, gender: g})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tempProfile.gender === g ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center">
                <AlignLeft size={12} className="mr-1" /> 个性签名
              </label>
              <textarea
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-pink-300 focus:bg-white transition-all resize-none shadow-inner"
                placeholder="介绍一下自己吧，例如：正在努力学习脱单..."
                rows={3}
                maxLength={50}
              />
              <div className="text-right text-[10px] text-gray-400 mt-1">{tempProfile.bio.length}/50</div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="p-5 bg-white border-t border-gray-100 flex space-x-4">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-200 text-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <Save size={18} className="mr-2" />
            保存资料
          </button>
        </div>

      </div>
    </div>
  );
}
