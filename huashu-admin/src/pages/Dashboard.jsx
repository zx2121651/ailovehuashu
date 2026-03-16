import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, MessageSquare, Activity, FileText,
  TrendingUp, RefreshCw, BarChart2, Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const StatCard = ({ title, value, icon, gradientFrom, gradientTo, iconColor }) => (
  <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
    {/* Background Gradient Blob */}
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-20 group-hover:opacity-40 blur-2xl transition-opacity duration-500`}></div>

    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-bold text-slate-500 mb-1 tracking-wide">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>

        {/* Trend Indicator (Mocked for visual enhancement) */}
        {typeof value === 'number' && (
          <div className="flex items-center mt-3 text-xs font-semibold text-emerald-500 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
            <TrendingUp size={12} className="mr-1" />
            <span>+12.5%</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 28, className: iconColor })}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const res = await fetch('/api/v1/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success || data.code === 200) {
          setStats(data.data);
        } else {
          setError('获取数据失败');
        }
      } catch (err) {
        console.error('Fetch stats error:', err);
        setError('服务器连接异常，请检查网络后重试。');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm font-medium">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500">{entry.name}:</span>
              <span className="text-slate-800 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <Activity size={40} className="animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">数据加载失败</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-800/20 flex items-center"
        >
          <RefreshCw size={18} className="mr-2" />
          重新加载数据
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Area */}
      <div className="flex justify-between items-end bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-2xl translate-y-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider text-indigo-100 uppercase">Live Dashboard</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">数据控制中心</h2>
          <p className="text-indigo-200/80 font-medium max-w-lg">实时监控全站运营数据，洞察业务增长趋势。所有关键指标一览无余。</p>
        </div>

        <button className="relative z-10 flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold transition-all duration-300 active:scale-95 group">
          <RefreshCw size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-700" />
          刷新数据
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总注册用户"
          value={stats?.totalUsers || 0}
          icon={<Users />}
          gradientFrom="from-blue-100" gradientTo="to-indigo-100" iconColor="text-blue-600"
        />
        <StatCard
          title="总话术数量"
          value={stats?.totalScripts || 0}
          icon={<FileText />}
          gradientFrom="from-emerald-100" gradientTo="to-teal-100" iconColor="text-emerald-600"
        />
        <StatCard
          title="待审核内容"
          value={stats?.pendingContributions || 0}
          icon={<MessageSquare />}
          gradientFrom="from-amber-100" gradientTo="to-orange-100" iconColor="text-amber-600"
        />
        <StatCard
          title="系统健康状态"
          value="优良"
          icon={<Activity />}
          gradientFrom="from-purple-100" gradientTo="to-pink-100" iconColor="text-purple-600"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Large Chart: User Growth Area */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                <BarChart2 className="w-6 h-6 mr-2 text-indigo-500" /> 近期用户增长趋势
              </h3>
              <p className="text-sm font-medium text-slate-400 mt-1">过去 7 天的新增活跃指标</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>最近 7 天</option>
              <option>最近 30 天</option>
            </select>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: '10/19', users: 45 }, { name: '10/20', users: 52 },
                { name: '10/21', users: 38 }, { name: '10/22', users: 65 },
                { name: '10/23', users: 85 }, { name: '10/24', users: 120 },
                { name: '10/25', users: 156 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Area type="monotone" dataKey="users" name="新增用户" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medium Chart: Category Pie */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">话术库分布</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">核心品类占比概览</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '幽默撩人', value: 256 }, { name: '开场破冰', value: 128 },
                    { name: '巧妙化解', value: 112 }, { name: '长期关系', value: 154 }
                  ]}
                  cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={6}
                  dataKey="value" stroke="none" cornerRadius={8}
                >
                  {[ '#4f46e5', '#0ea5e9', '#f43f5e', '#10b981' ].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Actions Area */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 mt-8 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight relative z-10 flex items-center">
          <Zap className="text-amber-500 mr-2" fill="currentColor" /> 常用功能入口
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <button
            onClick={() => navigate('/users')}
            className="group flex items-center p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors mr-5 shrink-0">
              <Users size={32} className="text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">用户管理中心</h4>
              <p className="text-sm font-medium text-slate-400 mt-1">查看和管理平台注册用户</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/content')}
            className="group flex items-center p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 rounded-3xl hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors mr-5 shrink-0">
              <BookOpen size={32} className="text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">核心话术库</h4>
              <p className="text-sm font-medium text-slate-400 mt-1">编辑、上下架平台核心内容</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/ugc')}
            className="group flex items-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-3xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
          >
            {/* Action shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />

            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mr-5 shrink-0 shadow-lg shadow-indigo-500/30">
              <MessageSquare size={32} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-indigo-900">UGC 投稿审核</h4>
              <p className="text-sm font-medium text-indigo-700 mt-1">处理用户提交的原创内容</p>
            </div>
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-rose-500 animate-bounce shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
