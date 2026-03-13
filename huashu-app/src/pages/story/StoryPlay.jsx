import React, { useState, useEffect } from 'react';
import { AppContext } from './../../context/AppContext';
import { ChevronLeft, RotateCcw, Heart, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StoryPlay() {
  const { activeParams, setActiveTab } = React.useContext(AppContext); const id = activeParams?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [id]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActiveTab('home'); alert('请先登录');
        return;
      }
      const res = await fetch(`/api/v1/stories/${id}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (_err) {
      setError('加载进度失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChoice = async (choice) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/stories/${id}/choice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceId: choice.id })
      });
      const result = await res.json();
      if (result.success) {
        setData(prev => ({
          ...prev,
          progress: result.data.progress,
          currentNode: result.data.currentNode
        }));
      } else {
        alert(result.message);
      }
    } catch (_err) {
      alert('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('重新开始会清空当前好感度进度，确定吗？')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/stories/${id}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProgress();
    } catch (_err) {
      alert('重置失败');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">加载中...</div>;
  if (error) return <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="text-red-500 mb-4">{error}</div>
    <button onClick={() => setActiveTab('story')} className="bg-rose-500 text-white px-6 py-2 rounded-full">返回</button>
  </div>;

  const { story, progress, currentNode } = data;
  const isCompleted = progress.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 text-white">
        <button onClick={() => setActiveTab('story')} className="p-2 bg-black/30 backdrop-blur rounded-full hover:bg-black/50 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex space-x-2">
          <div className="px-3 py-1.5 bg-black/30 backdrop-blur rounded-full flex items-center text-sm font-medium">
            <Heart className={`w-4 h-4 mr-1.5 ${progress.affectionScore >= 0 ? 'text-rose-400 fill-rose-400' : 'text-gray-400'}`} />
            {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
          </div>
          <button onClick={handleReset} className="p-2 bg-black/30 backdrop-blur rounded-full hover:bg-black/50 transition">
            <RotateCcw className="w-5 h-5 text-gray-200" />
          </button>
        </div>
      </div>

      {/* 沉浸式背景/立绘 */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black">
          {currentNode?.imageUrl ? (
            <img src={currentNode.imageUrl} alt="scene" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          ) : (
             <div className="absolute inset-0 bg-rose-900/20"></div>
          )}
        </div>
      </div>

      {/* 内容区域 (底部吸附) */}
      <div className="flex-1 flex flex-col justify-end z-10 relative">
        <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-6">
          <AnimatePresence mode="wait">
            {!isCompleted && currentNode && (
              <motion.div
                key={currentNode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md mx-auto"
              >
                {/* 讲述人 */}
                {currentNode.speakerName && (
                  <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur rounded-full text-white text-sm font-medium mb-3 border border-white/20 shadow-sm">
                    <User className="w-4 h-4 mr-1.5 text-rose-300" /> {currentNode.speakerName}
                  </div>
                )}

                {/* 文本内容 */}
                <div className="text-white text-lg leading-relaxed mb-8 drop-shadow-md">
                  {currentNode.content}
                </div>

                {/* 选项 */}
                <div className="space-y-3">
                  {!currentNode.isEnd ? (
                    currentNode.choices?.map((choice, index) => (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        key={choice.id}
                        onClick={() => handleMakeChoice(choice)}
                        disabled={isSubmitting}
                        className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white p-4 rounded-xl text-left transition-all relative overflow-hidden group"
                      >
                        <div className="flex">
                          <span className="text-rose-400 font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                          <span className="flex-1 pr-6 leading-snug">{choice.content}</span>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                     <div className="text-center text-gray-400 italic mt-8 text-sm">剧情发展到这里似乎结束了...</div>
                  )}

                  {!currentNode.choices?.length && !currentNode.isEnd && (
                     <div className="text-center text-gray-500 text-sm mt-4">作者暂未配置后续剧情 😅</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 通关结算面板 */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 text-center shadow-2xl w-full max-w-sm mx-auto my-12 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-pink-500"></div>
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">剧本达成</h2>
                <p className="text-gray-500 mb-6">本次互动的最终好感度结算</p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <div className="text-4xl font-black text-rose-500 mb-1">
                    {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
                  </div>
                  <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">AFFECTION SCORE</div>
                </div>

                <div className="space-y-3">
                  <button onClick={handleReset} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm">
                    再次挑战
                  </button>
                  <button onClick={() => setActiveTab('story')} className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-xl transition-colors border border-gray-200 shadow-sm">
                    返回列表
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default StoryPlay;
