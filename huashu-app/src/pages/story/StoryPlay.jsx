import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Heart } from 'lucide-react';

/**
 * 互动剧本体验页 (Ethereal Romance / 恋与深空 风格)
 * 采用全屏沉浸壁纸 + 毛玻璃对话框 + 顶部心动积分悬浮
 */
export default function StoryPlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
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
      alert('网络错误');
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

  useEffect(() => {
    fetchProgress();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#faf9f9] text-[#8b4c50]">Loading memory...</div>;
  if (error) return <div className="h-screen flex flex-col items-center justify-center bg-[#faf9f9] p-6 text-center"><p className="text-[#ba1a1a] mb-4">{error}</p><button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#8b4c50] text-white rounded-full">返回</button></div>;
  if (!data) return null;

  const { story, progress, currentNode } = data;
  const isCompleted = progress.status === 'COMPLETED';

  // 动态使用节点原画，否则回退到剧本封面，或者默认沉浸粉色
  const bgImage = currentNode?.imageUrl || story?.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 1. 沉浸式全屏背景图 */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Scene Background"
          className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-90"
        />
        {/* 底部暗色渐变，保障毛玻璃框文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1c]/90 via-[#1a1c1c]/40 to-transparent"></div>
      </div>

      {/* 2. 顶部透明控制栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-12 bg-gradient-to-b from-black/40 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/80 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 核心商业点：心动指示器 */}
        <motion.div
          key={progress.affectionScore}
          initial={{ scale: 1.2, color: '#ffb3b5' }}
          animate={{ scale: 1, color: '#ffffff' }}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-5 py-2 rounded-full border border-white/30 shadow-[0_0_20px_rgba(233,156,159,0.3)]"
        >
          <Heart className={`w-4 h-4 ${progress.affectionScore >= 0 ? 'text-[#e99c9f] fill-[#e99c9f]' : 'text-gray-400'}`} />
          <span className="font-['Manrope'] font-bold text-sm tracking-widest text-white drop-shadow-md">
             {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
          </span>
        </motion.div>

        <button onClick={handleReset} className="p-2 -mr-2 text-white/80 hover:text-white transition">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 3. 底部互动区域 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full flex flex-col justify-end p-4 pb-10">
        <AnimatePresence mode="wait">
          {!isCompleted && currentNode && (
            <motion.div
              key={currentNode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md mx-auto flex flex-col space-y-4"
            >

              {/* 悬浮选项组 (Choices) */}
              <div className="space-y-3 mb-2 flex flex-col items-center">
                {!currentNode.isEnd && currentNode.choices?.map((choice, index) => (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    key={choice.id}
                    onClick={() => handleMakeChoice(choice)}
                    disabled={isSubmitting}
                    className="w-[90%] bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white py-3.5 px-6 rounded-2xl text-center transition-all shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative overflow-hidden"
                  >
                    <span className="text-sm font-medium tracking-wide drop-shadow-sm">{choice.content}</span>
                  </motion.button>
                ))}
              </div>

              {/* 毛玻璃对话框 (Dialogue Box) */}
              <div className="relative bg-[#ffffff]/60 backdrop-blur-2xl rounded-[32px] p-8 pt-10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40">
                {/* 角色铭牌 (Name Tag) */}
                <div className="absolute -top-4 left-8 bg-[#6b5778] text-white px-5 py-1.5 rounded-full shadow-lg border border-white/20">
                  <span className="font-['Noto_Serif'] font-bold text-sm tracking-wider">
                    {currentNode.speakerName || '旁白'}
                  </span>
                </div>

                {/* 对话正文 */}
                <div className="text-[#1a1c1c] text-base leading-relaxed font-medium">
                  {currentNode.content}
                </div>
              </div>

            </motion.div>
          )}

          {/* 结算面板 */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-3xl rounded-[32px] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/50"
            >
              <div className="mb-8">
                <Heart className="w-16 h-16 mx-auto text-[#e99c9f] fill-[#e99c9f] drop-shadow-lg mb-4" />
                <h2 className="text-3xl font-['Noto_Serif'] font-bold text-[#6b3236] mb-2">END</h2>
                <p className="text-[#7b4f59] text-sm tracking-widest uppercase">Story Completed</p>
              </div>

              <div className="bg-[#f4f3f3]/80 rounded-2xl p-6 mb-8 border border-white/60">
                <div className="text-[#1a1c1c] font-bold text-4xl mb-1 font-['Manrope']">
                  {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
                </div>
                <div className="text-xs font-medium text-[#827473] uppercase tracking-wider">Final Affection Score</div>
              </div>

              <div className="space-y-4">
                <button onClick={handleReset} className="w-full bg-gradient-to-r from-[#8b4c50] to-[#e99c9f] hover:opacity-90 text-white font-bold py-4 rounded-full transition-opacity shadow-lg">
                  重新回忆
                </button>
                <button onClick={() => navigate(-1)} className="w-full bg-transparent border-2 border-[#d4c2c2] hover:bg-[#d4c2c2]/20 text-[#504444] font-bold py-4 rounded-full transition-colors">
                  返回列表
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
