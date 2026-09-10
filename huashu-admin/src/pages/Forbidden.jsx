import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Lock } from 'lucide-react';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-rose-100 to-red-50 border border-rose-100 flex items-center justify-center">
          <ShieldOff className="w-14 h-14 text-rose-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
          <Lock className="w-4 h-4 text-rose-400" />
        </div>
      </div>

      <h1 className="text-5xl font-black text-slate-800 tracking-tight">403</h1>
      <p className="mt-3 text-xl font-bold text-slate-700">无权限访问</p>
      <p className="mt-2 text-slate-500 max-w-md">
        当前账号未被授予访问该模块的权限。如需操作，请联系超级管理员为你分配相应权限点。
      </p>

      <div className="mt-8 flex space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
        >
          <ArrowLeft size={16} />
          <span>返回仪表盘</span>
        </button>
      </div>
    </div>
  );
};

export default Forbidden;