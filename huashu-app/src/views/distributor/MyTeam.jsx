import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, Users } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const MyTeam = () => {
  const { setActiveTab } = useContext(AppContext);
  const [activeTabLocal, setActiveTabLocal] = useState('level1');
  const [teamData, setTeamData] = useState({
    level1: [],
    level2: [],
    level3: [],
    counts: { level1: 0, level2: 0, level3: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const api = await import('../../services/api');
        const data = await api.getMyTeam();
        if (data) {
          setTeamData(data);
        }
      } catch (err) {
        console.error('Failed to fetch team data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();

  }, []);

  const renderList = (list) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Users size={48} className="mb-4 text-slate-200" />
          <p>暂无下级成员</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-100 bg-white px-4">
        {list.map(member => (
          <div key={member.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={member.avatar || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border border-slate-100"
              />
              <div className="ml-3">
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">注册时间: {new Date(member.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">累计贡献</p>
              <p className="font-bold text-emerald-600">¥{(member.totalEarned * 0.1).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setActiveTab('distributor')} className="p-2 -ml-2 text-slate-600 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">我的团队 ({teamData.counts.total})</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex px-4 pt-2">
          {['level1', 'level2', 'level3'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTabLocal(tab)}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTabLocal === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {idx === 0 ? '直推' : idx === 1 ? '间推' : '三级'}
              <span className="ml-1 text-xs opacity-80">({teamData.counts[tab]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 shadow-sm border-t border-b border-slate-100">
        {loading ? (
          <div className="py-10 text-center text-slate-400">加载中...</div>
        ) : (
          renderList(teamData[activeTabLocal])
        )}
      </div>
    </div>
  );
};

export default MyTeam;
