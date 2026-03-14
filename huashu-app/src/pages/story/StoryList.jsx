import React, { useState, useEffect } from 'react';
import { AppContext } from './../../context/AppContext';
import { Play, Star, Sparkles, Heart } from 'lucide-react';

function StoryList() {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveTab } = React.useContext(AppContext);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/stories', { headers });
      const data = await res.json();
      if (data.success) {
        setStories(data.data);
      }
    } catch (error) {
      console.error('加载剧本失败', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return <span className="love-card/20 backdrop-blur-sm text-white border border-white/30 text-xs px-2 py-1 rounded-full ml-2">已通关</span>;
    if (status === 'IN_PROGRESS') return <span className="bg-pink-500/50 backdrop-blur-sm text-white border border-pink-400/50 text-xs px-2 py-1 rounded-full ml-2">进行中</span>;
    return <span className="bg-black/30 backdrop-blur-sm text-white border border-white/20 text-xs px-2 py-1 rounded-full ml-2">未开始</span>;
  };

  return (
    <div className="pb-20 bg-transparent min-h-screen">
      {/* 1. 顶部栏 (Header) */}
      <div className="love-card/80 backdrop-blur-md text-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm border-b border-pink-50">
        <h1 className="text-xl font-bold flex items-center">
          <Heart className="w-5 h-5 text-pink-400 mr-2 fill-current" />
          互动情景模拟
        </h1>
      </div>

      <div className="p-4">
        {/* 2. 引导提示框 (Tip Box) */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 p-4 rounded-2xl flex items-start mb-6 shadow-sm">
          <div className="love-card p-1.5 rounded-full shadow-sm mr-3 flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-medium text-pink-600 mb-1 block">准备好迎接心动了吗？</span>
            在这里，你的每一次选择都可能改变结局。快来测测你的情商吧！
          </p>
        </div>

        {/* 列表内容 */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">
            <Heart className="w-8 h-8 mx-auto text-pink-200 animate-pulse mb-2" />
            <p>加载心动时刻中...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map(story => (
              <div
                key={story.id}
                className="group relative love-card rounded-3xl shadow-md border border-gray-50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setActiveTab('story_play', { id: story.id })}
              >
                {/* 3. 沉浸式大图 (Story Cards) */}
                <div className="h-64 sm:h-72 bg-gray-100 w-full relative">
                  {story.coverImage ? (
                    <img src={story.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={story.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-200"></div>
                  )}

                  {/* 黑色到透明的渐变遮罩 (Gradient Overlay) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                  {/* 文字悬浮层 */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end pointer-events-none">
                    <div className="mb-12"> {/* 留出底部栏的空间 */}
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-white text-xl drop-shadow-md">
                          {story.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-white/90">
                        {story.category && (
                          <span className="bg-pink-500/40 px-2 py-0.5 rounded backdrop-blur-sm border border-pink-400/30">
                            {story.category}
                          </span>
                        )}
                        {story.authorName && (
                          <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/20">
                            ✍️ {story.authorName}
                          </span>
                        )}
                        <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/20 flex items-center">
                          {Array.from({ length: story.difficulty || 1 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-300 fill-current" />
                          ))}
                        </span>
                        {getStatusBadge(story.progressStatus)}
                      </div>
                      <p className="text-gray-200 text-sm line-clamp-2 leading-relaxed opacity-90">{story.description}</p>
                    </div>
                  </div>
                </div>

                {/* 4. 毛玻璃质感底部操作栏 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 backdrop-blur-md bg-black/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      {story.pointsRequired > 0 ? (
                        <span className="text-amber-300 font-medium flex items-center bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {story.pointsRequired} 积分/次
                        </span>
                      ) : (
                        <span className="text-green-300 font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">免费体验</span>
                      )}
                    </div>

                    {/* 微渐变心跳按钮 */}
                    <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center shadow-lg hover:shadow-pink-500/30 group-hover:scale-105 transition-all duration-300">
                      <Play className="w-4 h-4 mr-1 fill-current" />
                      {story.progressStatus === 'COMPLETED' ? '重新体验' : story.progressStatus === 'IN_PROGRESS' ? '继续体验' : '开始模拟'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryList;
