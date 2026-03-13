import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const Withdrawal = () => {
  const { setActiveTab } = useContext(AppContext);
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
       try {
          const api = await import('../../services/api');
          const data = await api.getDistributorInfo();
          if (data) setBalance(data.balance);
       } catch (_err) {
        console.error(_err);}
    };
    fetchInfo();

  }, []);

  const handleWithdraw = async () => {
    if (!amount || amount <= 0 || amount > balance) return alert('请输入有效的提现金额');
    if (!account || !name) return alert('请完善收款信息');

    setLoading(true);
    try {
      const api = await import('../../services/api');
      const data = await api.applyWithdrawal(parseFloat(amount), { type: 'alipay', account, name });

      if (data.code === 200) {
        setSuccess(true);
      } else {
        alert(data.message || '提现申请失败');
      }
    } catch (_err) {
        console.error(_err);
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
        <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">申请已提交</h2>
        <p className="text-slate-500 mb-8">工作人员将在 1-3 个工作日内处理您的提现申请</p>
        <button
          onClick={() => setActiveTab('distributor')}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          返回分销中心
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3">
        <button onClick={() => setActiveTab('distributor')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">申请提现</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <p className="text-sm text-slate-500 mb-4">提现金额</p>
          <div className="flex items-end border-b border-slate-200 pb-2 mb-3">
            <span className="text-3xl font-medium text-slate-800 mb-1 mr-2">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-4xl font-bold text-slate-800 outline-none bg-transparent placeholder-slate-200"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">可提现余额 ¥{balance.toFixed(2)}</span>
            <button
              onClick={() => setAmount(balance)}
              className="text-indigo-600 font-medium active:opacity-70"
            >
              全部提现
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <h3 className="font-medium text-slate-800 mb-4">收款账户 (支付宝)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">支付宝账号</label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入支付宝账号"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">真实姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入账号对应真实姓名"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || !account || !name}
            className="w-full py-3.5 bg-indigo-600 disabled:bg-indigo-300 text-white rounded-xl font-medium shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            {loading ? '提交中...' : '确认提现'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;