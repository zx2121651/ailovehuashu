import React, { useState, useEffect } from 'react';
import { AppContext } from './../../context/AppContext';
import { Play, Star, AlertCircle } from 'lucide-react';

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
    if (status === 'COMPLETED') return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">已通关</span>;
    if (status === 'IN_PROGRESS') return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-2">进行中</span>;
    return <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full ml-2">未开始</span>;
  };

  return (
    <div className="pb-20">
      <div className="bg-rose-500 text-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold">互动情景模拟</h1>
      </div>

      <div className="p-4">
        <div className="bg-rose-50 text-rose-800 p-3 rounded-lg flex items-start mb-6 text-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>体验沉浸式的恋爱抉择。你的每一个选项都会影响最终的情感走向，快来测测你的情商吧！</p>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400">加载剧本中...</div>
        ) : (
          <div className="space-y-4">
            {stories.map(story => (
              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                onClick={() => setActiveTab('story_play', { id: story.id })}
              >
                {story.coverImage && (
                  <div className="h-32 bg-gray-200 w-full">
                    <img src={story.coverImage} className="w-full h-full object-cover" alt="cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                      {story.title}
                      {getStatusBadge(story.progressStatus)}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{story.description}</p>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <div className="flex items-center text-sm">
                      {story.pointsRequired > 0 ? (
                        <span className="text-amber-500 font-medium flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-current" /> {story.pointsRequired} 积分/次
                        </span>
                      ) : (
                        <span className="text-green-500 font-medium">免费体验</span>
                      )}
                    </div>
                    <button className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-sm font-medium flex items-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <Play className="w-4 h-4 mr-1" />
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
