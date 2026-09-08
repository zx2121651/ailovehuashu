import React, { useEffect, useRef, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../services/api';
import { ChevronLeft, Sparkles, Check, RefreshCw, Send, HeartPulse, RotateCcw } from 'lucide-react';

// 本地问卷（后端在线时用后端 /life/assessment/questions，否则用此份）
const LOCAL_QUESTIONS = [
  { id: 1, q: '和喜欢的人冷场了，你的第一反应是？', options: [{ v: 'a', t: '主动换个话题暖场' }, { v: 'b', t: '抛个幽默段子试探' }, { v: 'c', t: '直接问对方想聊什么' }] },
  { id: 2, q: 'TA 发来一句负能量抱怨，你会怎么接？', options: [{ v: 'a', t: '共情安慰，先稳住情绪' }, { v: 'b', t: '幽默化解 逗TA开心' }, { v: 'c', t: '给出解决办法并约见面' }] },
  { id: 3, q: '表白被拒绝了，你会？', options: [{ v: 'a', t: '温柔表达理解 继续陪伴' }, { v: 'b', t: '优雅退后 保留余味联系' }, { v: 'c', t: '坦诚心意 到此不再纠缠' }] },
  { id: 4, q: '聊天中你最看重的是？', options: [{ v: 'a', t: 'TA 的情绪和感受' }, { v: 'b', t: '聊天的节奏和趣味' }, { v: 'c', t: '关系和进度的发展' }] },
  { id: 5, q: '朋友甩来一道恋爱难题，你更倾向怎么解？', options: [{ v: 'a', t: '让彼此都舒服' }, { v: 'b', t: '显得从容有魅力' }, { v: 'c', t: '快速推进关系' }] }
];

export default function LovePalette() {
  const { setActiveTab, handleCopy, copiedId, lovePalette, setLovePalette, showToast } = useContext(AppContext);
  const [step, setStep] = useState(lovePalette ? 2 : 0); // 0=欢迎 1=答题 2=结果
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState(LOCAL_QUESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(lovePalette || null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      api.getAssessmentQuestions().then(list => { if (list && list.length) setQuestions(list); }).catch(() => {});
    }
  }, []);

  const startQuiz = () => { setAnswers([]); setQIndex(0); setStep(1); };

  const pick = (v) => {
    const next = [...answers, { id: questions[qIndex].id, v }];
    setAnswers(next);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      submit(next);
    }
  };

  const submit = async (finalAnswers) => {
    setIsLoading(true);
    const res = await api.submitAssessment(finalAnswers);
    const withType = { ...res, aiSuggestion: res.aiSuggestion || { opening: res.opening, style: res.style } };
    setResult(withType);
    setLovePalette(withType);
    setIsLoading(false);
    setStep(2);
  };

  const goToAI = () => {
    setActiveTab('ai');
    showToast('已携带你的画像去 AI 定制回复');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-pink-50 to-[#F5F7FA] animate-in zoom-in-95 duration-300">
      <div className="love-card px-5 pt-8 pb-3 z-20 shadow-sm relative flex items-center justify-between">
        <ChevronLeft size={24} className="text-gray-800 cursor-pointer hover:text-pink-500" onClick={() => setActiveTab('profile')} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-800">恋爱人格测评</h1>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">对标 Soul · 找到你的恋爱性格</p>
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 scrollbar-hide">

        {step === 0 && (
          <div className="flex flex-col items-center justify-center pt-10 text-center animate-fade-in-up">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-300/50 mb-6 animate-float">
              <HeartPulse size={44} className="text-white animate-heartbeat" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">了解你的恋爱性格</h2>
            <p className="text-gray-500 text-[14px] leading-relaxed mb-8 max-w-[260px]">
              5 道题，测出你的恋爱人格画像，并让 AI 为你定制专属开场白与回复风格。
            </p>
            <button onClick={startQuiz} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-300/50 active:scale-90 transition-transform">
              开始测评（约30秒）
            </button>
            {lovePalette && (
              <button onClick={() => setStep(2)} className="flex items-center mt-3 text-[12px] text-pink-500 font-medium hover:opacity-70"><RotateCcw size={14} className="mr-1"/>重新查看结果</button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] text-gray-500 font-medium">第 {qIndex + 1} / {questions.length} 题</span>
              <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="love-card rounded-3xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-800 mb-6 leading-relaxed">{questions[qIndex]?.q}</h3>
              <div className="space-y-3">
                {questions[qIndex]?.options.map((op, i) => (
                  <button key={op.v} onClick={() => pick(op.v)}
                    className="w-full text-left rounded-2xl border border-gray-100 bg-[#FBFBFF] px-4 py-3.5 hover:border-pink-300 hover:bg-pink-50 active:scale-95 transition-all">
                    <span className="text-[14px] text-gray-700 font-medium">{i + 1}. {op.t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && result && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="text-6xl mb-3 animate-pop">{result.emoji}</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">你是「{result.type}」</h2>
            <div className="flex space-x-2 mt-3 mb-5">
              {(result.traits || []).map((t, i) => (
                <span key={i} className="text-[12px] bg-pink-100/70 text-pink-600 px-3 py-1 rounded-full font-medium animate-pop" style={{ animationDelay: `${i * 80}ms` }}>{t}</span>
              ))}
            </div>

            <div className="w-full love-card rounded-3xl p-5 shadow-sm mb-4">
              <p className="text-[13px] text-gray-600 leading-relaxed">{result.desc}</p>
            </div>

            <div className="w-full bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-5 mb-5 border border-pink-100">
              <div className="flex items-center text-pink-500 font-bold text-[13px] mb-2"><Sparkles size={15} className="mr-1.5"/> AI · 为你定制的开场白</div>
              <p className="text-gray-800 text-[14px] leading-relaxed mb-3">{result.aiSuggestion?.opening || result.opening}</p>
              <button onClick={() => handleCopy('opening', result.aiSuggestion?.opening || result.opening)}
                className="flex items-center text-[12px] font-bold bg-pink-500 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                {copiedId === 'opening' ? <><Check size={13} className="mr-1"/>已复制</> : '复制这句开场'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={goToAI} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-2xl font-bold shadow-md shadow-pink-300/40 active:scale-95 transition-transform flex items-center justify-center">
                带去 AI <Send size={16} className="ml-1.5"/>
              </button>
              <button onClick={startQuiz} className="bg-white text-pink-500 border border-pink-200 py-3 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center">
                重新测评 <RefreshCw size={15} className="ml-1.5"/>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16"><Sparkles size={22} className="animate-spin text-pink-500"/></div>
        )}
      </div>
    </div>
  );
}