import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, RefreshCw, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [sortTabs, setSortTabs] = useState([]);
  const [newSortTab, setNewSortTab] = useState({ key: '', label: '', sort: '', default: false });
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
    fetchSortTabs();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200 && Object.keys(data.data).length > 0) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const fetchSortTabs = async () => {
    try {
      const res = await fetch('/api/v1/posts/sort-tabs');
      const data = await res.json();
      if (data.success) {
        setSortTabs(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sort tabs', err);
    }
  };

  const handleAddSortTab = () => {
    if (!newSortTab.key || !newSortTab.label || !newSortTab.sort) {
      setToast('请填写完整的排序标签信息');
      return;
    }
    const updatedTabs = [...sortTabs, { ...newSortTab, key: newSortTab.key.trim() }];
    setSortTabs(updatedTabs);
    setNewSortTab({ key: '', label: '', sort: '', default: false });
  };

  const handleRemoveSortTab = (index) => {
    const updatedTabs = sortTabs.filter((_, i) => i !== index);
    setSortTabs(updatedTabs);
  };

  const handleSetDefaultSortTab = (index) => {
    const updatedTabs = sortTabs.map((tab, i) => ({
      ...tab,
      default: i === index
    }));
    setSortTabs(updatedTabs);
  };

  const handleSaveSortTabs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...settings,
          postSortTabs: sortTabs
        })
      });
      const data = await res.json();
      if (data.code === 200) {
        setToast('排序标签已保存！');
      } else {
        setToast('保存失败: ' + data.message);
      }
    } catch (err) {
      console.error('Save failed', err);
      setToast('保存失败，请检查网络');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const [toast, setToast] = useState('');

  // Mock settings state
  const [settings, setSettings] = useState({
    siteName: '话术库精选',
    siteDescription: '最全的高情商聊天话术库，助你脱单！',
    maintenanceMode: false,
    rewardPointsPerSubmission: 10,
    dailyPointsLimit: 50,
    allowNewRegistrations: true,
    notificationEmail: 'admin@huashuku.com',
    DISTRIBUTOR_CONFIG: {
      rates: { 1: 0.30, 2: 0.15, 3: 0.05 },
      requireVip: false
    },
    PAYMENT_CONFIG: {
      wechat: {
        appId: '',
        mchId: '',
        apiV3Key: '',
        privateKey: '',
        certSerialNo: ''
      },
      alipay: {
        appId: '',
        privateKey: '',
        alipayPublicKey: ''
      }
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.code === 200) {
        setToast('设置已成功保存！');
      } else {
        setToast('保存失败: ' + data.message);
      }
    } catch (err) {
      console.error('Save failed', err);
      setToast('保存失败，请检查网络');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDistributorChange = (level, value) => {
    setSettings(prev => ({
      ...prev,
      DISTRIBUTOR_CONFIG: {
        ...prev.DISTRIBUTOR_CONFIG,
        rates: {
          ...prev.DISTRIBUTOR_CONFIG.rates,
          [level]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleDistributorVipToggle = (e) => {
    const { checked } = e.target;
    setSettings(prev => ({
      ...prev,
      DISTRIBUTOR_CONFIG: {
        ...prev.DISTRIBUTOR_CONFIG,
        requireVip: checked
      }
    }));
  };

  const handlePaymentChange = (provider, field, value) => {
    setSettings(prev => ({
      ...prev,
      PAYMENT_CONFIG: {
        ...prev.PAYMENT_CONFIG,
        [provider]: {
          ...(prev.PAYMENT_CONFIG?.[provider] || {}),
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">系统设置</h2>
          <p className="text-slate-500 mt-2">管理全局配置、积分规则与维护模式。</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          保存所有设置
        </button>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center animate-fade-in-down shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'basic'
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          基础设置
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'points'
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          积分与激励
        </button>
        <button
          onClick={() => setActiveTab('distributor')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'distributor'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          分销配置
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'payment'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          支付接口配置
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'community'
              ? 'bg-pink-50 text-pink-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          社区配置
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'advanced'
              ? 'bg-red-50 text-red-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          高级设置
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {activeTab === 'basic' && (
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">基础信息配置</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">站点名称</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">管理员通知邮箱</label>
                <input
                  type="email"
                  name="notificationEmail"
                  value={settings.notificationEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">站点描述 (SEO)</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">UGC 积分激励规则</h3>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start text-blue-800 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-blue-500" />
              <p>当用户的投稿（UGC）被管理员审核通过后，系统将自动向用户发放积分奖励。可以在下方配置单次奖励额度及每日上限。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">投稿通过奖励（积分/条）</label>
                <div className="relative">
                  <input
                    type="number"
                    name="rewardPointsPerSubmission"
                    value={settings.rewardPointsPerSubmission}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    积分
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">每日获取上限</label>
                <div className="relative">
                  <input
                    type="number"
                    name="dailyPointsLimit"
                    value={settings.dailyPointsLimit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    积分
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distributor' && (
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">3 级分销佣金设置</h3>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start text-indigo-800 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-indigo-500" />
              <p>在此配置分销系统的佣金比例（填入小数，例如 0.30 表示 30%）。以及开启门槛控制后，只有成为 VIP 的用户才能获得推广收益。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">1 级分销比例 (直推)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.DISTRIBUTOR_CONFIG?.rates?.[1] || 0}
                    onChange={(e) => handleDistributorChange(1, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">2 级分销比例 (间推)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.DISTRIBUTOR_CONFIG?.rates?.[2] || 0}
                    onChange={(e) => handleDistributorChange(2, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">3 级分销比例</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.DISTRIBUTOR_CONFIG?.rates?.[3] || 0}
                    onChange={(e) => handleDistributorChange(3, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-5 border border-indigo-200 bg-indigo-50/30 rounded-xl">
                <div>
                  <h4 className="text-base font-semibold text-indigo-700">VIP 分销门槛控制</h4>
                  <p className="text-sm text-indigo-500/80 mt-1">开启后，下级发生购买时，只有当上级是 VIP 身份，才能拿对应的提成佣金；否则跳过该上级。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.DISTRIBUTOR_CONFIG?.requireVip || false}
                    onChange={handleDistributorVipToggle}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">微信支付配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">AppID (小程序/公众号)</label>
                <input
                  type="text"
                  value={settings.PAYMENT_CONFIG?.wechat?.appId || ''}
                  onChange={(e) => handlePaymentChange('wechat', 'appId', e.target.value)}
                  placeholder="wx..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">MCH_ID (商户号)</label>
                <input
                  type="text"
                  value={settings.PAYMENT_CONFIG?.wechat?.mchId || ''}
                  onChange={(e) => handlePaymentChange('wechat', 'mchId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">APIv3 Key</label>
                <input
                  type="password"
                  value={settings.PAYMENT_CONFIG?.wechat?.apiV3Key || ''}
                  onChange={(e) => handlePaymentChange('wechat', 'apiV3Key', e.target.value)}
                  placeholder="API v3 密钥"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">商户证书序列号 (Cert Serial No)</label>
                <input
                  type="text"
                  value={settings.PAYMENT_CONFIG?.wechat?.certSerialNo || ''}
                  onChange={(e) => handlePaymentChange('wechat', 'certSerialNo', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">商户私钥 (apiclient_key.pem 内容)</label>
                <textarea
                  value={settings.PAYMENT_CONFIG?.wechat?.privateKey || ''}
                  onChange={(e) => handlePaymentChange('wechat', 'privateKey', e.target.value)}
                  rows="4"
                  placeholder="-----BEGIN PRIVATE KEY-----..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 resize-y font-mono text-xs"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mt-12">支付宝配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">AppID (支付宝应用)</label>
                <input
                  type="text"
                  value={settings.PAYMENT_CONFIG?.alipay?.appId || ''}
                  onChange={(e) => handlePaymentChange('alipay', 'appId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">应用私钥</label>
                <textarea
                  value={settings.PAYMENT_CONFIG?.alipay?.privateKey || ''}
                  onChange={(e) => handlePaymentChange('alipay', 'privateKey', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 resize-y font-mono text-xs"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">支付宝公钥</label>
                <textarea
                  value={settings.PAYMENT_CONFIG?.alipay?.alipayPublicKey || ''}
                  onChange={(e) => handlePaymentChange('alipay', 'alipayPublicKey', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 resize-y font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-pink-100 pb-4">
              <h3 className="text-xl font-bold text-pink-600">社区排序标签配置</h3>
              <button
                onClick={handleSaveSortTabs}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm shadow-pink-500/30 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                保存排序标签
              </button>
            </div>

            <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-start text-pink-800 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-pink-500" />
              <p>配置社区动态页面的排序标签，如"最新"、"最热"等。用户可以点击这些标签来切换不同的排序方式。必须设置一个默认选中的标签。</p>
            </div>

            {/* 现有排序标签列表 */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">当前排序标签</h4>
              {sortTabs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  暂无排序标签，请添加
                </div>
              ) : (
                <div className="space-y-3">
                  {sortTabs.map((tab, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-pink-300 transition-colors">
                      <GripVertical className="w-5 h-5 text-slate-300" />
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">标识(key)</label>
                          <input
                            type="text"
                            value={tab.key}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">显示名称</label>
                          <input
                            type="text"
                            value={tab.label}
                            onChange={(e) => {
                              const updated = [...sortTabs];
                              updated[index].label = e.target.value;
                              setSortTabs(updated);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">排序方式</label>
                          <select
                            value={tab.sort}
                            onChange={(e) => {
                              const updated = [...sortTabs];
                              updated[index].sort = e.target.value;
                              setSortTabs(updated);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all text-sm"
                          >
                            <option value="new">最新发布</option>
                            <option value="hot">最热</option>
                            <option value="urgent">急诊</option>
                            <option value="featured">精华</option>
                            <option value="following">关注</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="defaultSortTab"
                              checked={tab.default}
                              onChange={() => handleSetDefaultSortTab(index)}
                              className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="text-sm text-slate-600">默认选中</span>
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSortTab(index)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 添加新排序标签 */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">添加新排序标签</h4>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">标识(key) *</label>
                  <input
                    type="text"
                    value={newSortTab.key}
                    onChange={(e) => setNewSortTab({ ...newSortTab, key: e.target.value })}
                    placeholder="如: hot, latest"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">显示名称 *</label>
                  <input
                    type="text"
                    value={newSortTab.label}
                    onChange={(e) => setNewSortTab({ ...newSortTab, label: e.target.value })}
                    placeholder="如: 最热, 最新"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">排序方式 *</label>
                  <select
                    value={newSortTab.sort}
                    onChange={(e) => setNewSortTab({ ...newSortTab, sort: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-sm bg-white"
                  >
                    <option value="">请选择</option>
                    <option value="new">最新发布</option>
                    <option value="hot">最热</option>
                    <option value="urgent">急诊</option>
                    <option value="featured">精华</option>
                    <option value="following">关注</option>
                  </select>
                </div>
                <button
                  onClick={handleAddSortTab}
                  className="flex items-center px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-red-600 border-b border-red-100 pb-4">危险与高级操作</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div>
                  <h4 className="text-base font-semibold text-slate-800">允许新用户注册</h4>
                  <p className="text-sm text-slate-500 mt-1">关闭后，前端注册入口将失效，仅允许已有账号登录。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowNewRegistrations"
                    checked={settings.allowNewRegistrations}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-5 border border-red-200 bg-red-50/30 rounded-xl">
                <div>
                  <h4 className="text-base font-semibold text-red-700">系统维护模式</h4>
                  <p className="text-sm text-red-500/80 mt-1">开启后，前端将显示维护页面（除后台和白名单 IP 外无法访问）。</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;