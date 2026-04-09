import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * 互动剧本体验页 (WeChat Simulator / 微信聊天模拟器风格)
 * 极致本土化、高代入感、实用主义
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
      setError('网络波动，请检查连接');
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
    if (!window.confirm('要清空聊天记录重新开始模拟吗？')) return;
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F3F3F3] text-gray-500">加载聊天记录中...</div>;
  if (error) return <div className="h-screen flex flex-col items-center justify-center bg-[#F3F3F3] p-6 text-center"><p className="text-red-500 mb-4">{error}</p><button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#07C160] text-white rounded-md">返回列表</button></div>;
  if (!data) return null;

  const { story, progress, currentNode } = data;
  const isCompleted = progress.status === 'COMPLETED';

  // 模拟对方头像
  const girlAvatar = currentNode?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop';

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F3F3F3] font-['Inter',system-ui,sans-serif]">

      {/* 1. 顶部导航栏 (标准微信白底风格) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0 shadow-sm z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#1a1c1c] active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-semibold text-[#1a1c1c] tracking-wide">
          {currentNode?.speakerName || story?.title || '聊天对象'}
        </h1>

        {/* 右侧好感度指示器 (红字显眼) */}
        <motion.div
          key={progress.affectionScore}
          initial={{ scale: 1.2, color: '#ff8475' }}
          animate={{ scale: 1, color: '#e63946' }}
          className="flex items-center space-x-1"
        >
          <span className="font-bold text-sm tracking-wider">
             好感度: {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
          </span>
          <span className="text-sm">❤️</span>
        </motion.div>
      </div>

      {/* 2. 聊天记录区 (主内容区) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-6">

        {/* 系统提示 */}
        <div className="text-center">
          <span className="bg-gray-200/60 text-gray-500 text-xs px-3 py-1 rounded-md">
            实战演练已开始：请选择最高情商的回复
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isCompleted && currentNode && (
            <motion.div
              key={currentNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col space-y-6"
            >
              {/* 对方 (女生) 发来的消息：左侧、白底气泡 */}
              <div className="flex items-start max-w-[85%]">
                <img
                  src={girlAvatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-md object-cover mr-3 bg-gray-300 shrink-0 shadow-sm"
                />
                <div className="relative bg-white text-[#1a1c1c] text-[15px] leading-relaxed p-3 rounded-lg shadow-sm">
                  {/* 气泡左侧小尾巴 */}
                  <div className="absolute top-3 -left-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent"></div>
                  {currentNode.content}
                </div>
              </div>
            </motion.div>
          )}

          {/* 结算面板：以系统消息形式展示 */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center mt-10 space-y-6"
            >
              <div className="bg-white p-6 rounded-xl shadow-sm text-center w-full max-w-sm border border-gray-100">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-[#1a1c1c] mb-1">演练结束</h2>
                <p className="text-gray-500 text-sm mb-6">本次模拟聊天已抵达结局</p>

                <div className="bg-[#f9f9f9] rounded-lg p-4 mb-6">
                  <div className="text-[#e63946] font-bold text-3xl mb-1">
                    {progress.affectionScore > 0 ? '+' : ''}{progress.affectionScore}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">最终获得好感度</div>
                </div>

                <div className="space-y-3">
                  <button onClick={handleReset} className="w-full flex items-center justify-center bg-[#07C160] active:bg-[#06ad56] text-white font-medium py-3 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 mr-2" /> 重新模拟
                  </button>
                  <button onClick={() => navigate(-1)} className="w-full bg-gray-100 active:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors">
                    返回上一页
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. 底部选项区 (用户输入键盘的替代品) */}
      {!isCompleted && currentNode && !currentNode.isEnd && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#f9f9f9] border-t border-gray-200 px-4 pt-4 pb-8 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="text-xs text-gray-400 mb-3 ml-1">请选择您的回复话术：</div>
          <div className="space-y-2.5">
            {currentNode.choices?.map((choice) => (
              <motion.button
                whileTap={{ scale: 0.98, backgroundColor: '#f0f0f0' }}
                key={choice.id}
                onClick={() => handleMakeChoice(choice)}
                disabled={isSubmitting}
                className="w-full bg-white border border-gray-200 text-[#1a1c1c] py-3.5 px-4 rounded-lg text-left transition-all shadow-sm flex items-center group active:border-[#07C160]"
              >
                {/* 模拟绿色的发送小箭头 */}
                <div className="w-6 h-6 rounded-full bg-gray-100 group-active:bg-[#07C160]/10 flex items-center justify-center mr-3 shrink-0">
                   <span className="text-gray-400 group-active:text-[#07C160] text-xs">A</span>
                </div>
                <span className="text-[14px] leading-snug font-medium line-clamp-2 pr-2">{choice.content}</span>
              </motion.button>
            ))}
          </div>

          {/* 当该节点没有写选项时 */}
          {!currentNode.choices?.length && (
            <div className="text-center text-gray-500 text-sm py-4">作者暂未配置回复话术 😅</div>
          )}
        </div>
      )}
    </div>
  );
}
