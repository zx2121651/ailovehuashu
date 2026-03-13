import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, ListTree, Save, X, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = '/api/v1/admin'; // TODO: env variable

function InteractiveStoryManagement() {
  const { token: adminToken } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 模态框状态
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);

  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null);
  const [targetNodeIdForChoice, setTargetNodeIdForChoice] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      fetchNodes(selectedStory.id);
    }
  }, [selectedStory]);

  const headers = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const theme = formData.get('theme');
    if (!theme) return toast.error('请输入剧情主题');

    setIsAiGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/interactive-stories/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ theme })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowAiModal(false);
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('AI 生成请求失败');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/interactive-stories`, { headers });
      const data = await res.json();
      if (data.success) setStories(data.data);
    } catch (error) {
      toast.error('加载剧本失败');
    }
    setIsLoading(false);
  };

  const fetchNodes = async (storyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/interactive-story-nodes?storyId=${storyId}`, { headers });
      const data = await res.json();
      if (data.success) setNodes(data.data);
    } catch (error) {
      toast.error('加载节点失败');
    }
  };

  // --- Story Actions ---
  const handleSaveStory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      isPremium: formData.get('isPremium') === 'true',
      pointsRequired: parseInt(formData.get('pointsRequired')) || 0,
    };

    const method = editingStory?.id ? 'PUT' : 'POST';
    const url = editingStory?.id ? `${API_BASE_URL}/interactive-stories/${editingStory.id}` : `${API_BASE_URL}/interactive-stories`;

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) {
        toast.success('保存成功');
        setShowStoryModal(false);
        fetchStories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('确定要删除这个剧本及其所有剧情节点吗？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/interactive-stories/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        toast.success('删除成功');
        if (selectedStory?.id === id) setSelectedStory(null);
        fetchStories();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // --- Node Actions ---
  const handleSaveNode = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      storyId: selectedStory.id,
      name: formData.get('name'),
      speakerName: formData.get('speakerName'),
      content: formData.get('content'),
      imageUrl: formData.get('imageUrl'),
      isEnd: formData.get('isEnd') === 'true',
    };

    const method = editingNode?.id ? 'PUT' : 'POST';
    const url = editingNode?.id ? `${API_BASE_URL}/interactive-story-nodes/${editingNode.id}` : `${API_BASE_URL}/interactive-story-nodes`;

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) {
        toast.success('保存成功');
        setShowNodeModal(false);
        fetchNodes(selectedStory.id);
      }
    } catch (error) {
      toast.error('保存节点失败');
    }
  };

  // --- Choice Actions ---
  const handleSaveChoice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nodeId: targetNodeIdForChoice,
      content: formData.get('content'),
      nextNodeId: formData.get('nextNodeId') ? parseInt(formData.get('nextNodeId')) : null,
      affectionChange: parseInt(formData.get('affectionChange')) || 0,
    };

    const method = editingChoice?.id ? 'PUT' : 'POST';
    const url = editingChoice?.id ? `${API_BASE_URL}/interactive-story-choices/${editingChoice.id}` : `${API_BASE_URL}/interactive-story-choices`;

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) {
        toast.success('保存成功');
        setShowChoiceModal(false);
        fetchNodes(selectedStory.id);
      }
    } catch (error) {
      toast.error('保存选项失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">情感互动剧本管理</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 flex items-center shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" /> AI 一键生成剧本
          </button>
          <button
            onClick={() => { setEditingStory(null); setShowStoryModal(true); }}
            className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> 手动新增
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：剧本列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium">剧本列表</div>
          <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
            {stories.map(story => (
              <div
                key={story.id}
                className={`p-4 cursor-pointer hover:bg-rose-50 transition-colors ${selectedStory?.id === story.id ? 'bg-rose-50 border-l-4 border-rose-500' : ''}`}
                onClick={() => setSelectedStory(story)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{story.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{story.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${story.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {story.status}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        节点数: {story._count?.nodes || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingStory(story); setShowStoryModal(true); }} className="p-1 text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：节点与选项管理 */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
          {selectedStory ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-medium">[{selectedStory.title}] 的节点关系图</span>
                <button
                  onClick={() => { setEditingNode(null); setShowNodeModal(true); }}
                  className="text-rose-500 text-sm font-medium hover:text-rose-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> 添加节点
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {nodes.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">暂无节点，请先添加一个初始节点。</div>
                ) : (
                  nodes.map((node, index) => (
                    <div key={node.id} className="border border-gray-200 rounded-lg p-4 bg-white relative shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded mr-2">ID: {node.id}</span>
                          <h4 className="font-bold text-gray-800">{node.name || '未命名节点'} {node.isEnd && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">结局节点</span>}</h4>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingNode(node); setShowNodeModal(true); }} className="text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                          <button onClick={async () => {
                              if(window.confirm('删除节点?')) {
                                  await fetch(`${API_BASE_URL}/interactive-story-nodes/${node.id}`, { method:'DELETE', headers});
                                  fetchNodes(selectedStory.id);
                              }
                          }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-3 border border-gray-100">
                        {node.speakerName && <span className="font-bold text-rose-500 mr-2">{node.speakerName}:</span>}
                        {node.content}
                      </div>

                      {/* 选项列表 */}
                      {!node.isEnd && (
                        <div className="pl-4 border-l-2 border-rose-200 space-y-2">
                          <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                            <span>玩家选项分支：</span>
                            <button
                              onClick={() => { setTargetNodeIdForChoice(node.id); setEditingChoice(null); setShowChoiceModal(true); }}
                              className="text-rose-500 hover:underline flex items-center"
                            >
                              <Plus className="w-3 h-3 mr-1" /> 添加选项
                            </button>
                          </div>
                          {node.choices?.map(choice => (
                            <div key={choice.id} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded text-sm">
                              <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-400 mr-1" />
                                <span>{choice.content}</span>
                                <span className="ml-3 text-xs text-gray-500">
                                  跳转 ➔ <span className="font-bold text-gray-800">{choice.nextNodeId ? `节点 ID: ${choice.nextNodeId}` : '结束'}</span>
                                </span>
                                {choice.affectionChange !== 0 && (
                                  <span className={`ml-2 text-xs ${choice.affectionChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    好感度 {choice.affectionChange > 0 ? '+' : ''}{choice.affectionChange}
                                  </span>
                                )}
                              </div>
                              <button onClick={() => { setTargetNodeIdForChoice(node.id); setEditingChoice(choice); setShowChoiceModal(true); }} className="text-gray-400 hover:text-blue-500">修改</button>
                            </div>
                          ))}
                          {node.choices?.length === 0 && <div className="text-xs text-gray-400 italic">未配置选项，剧情将在此卡住</div>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              请在左侧选择一个剧本以查看节点详情
            </div>
          )}
        </div>
      </div>

      {/* 剧本 Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingStory ? '编辑剧本' : '新增剧本'}</h3>
              <button onClick={() => setShowStoryModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveStory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">剧本标题</label>
                <input name="title" defaultValue={editingStory?.title} required className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">简介</label>
                <textarea name="description" defaultValue={editingStory?.description} className="w-full border p-2 rounded" rows="3" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">状态</label>
                  <select name="status" defaultValue={editingStory?.status || 'DRAFT'} className="w-full border p-2 rounded">
                    <option value="ACTIVE">上架 (ACTIVE)</option>
                    <option value="DRAFT">草稿 (DRAFT)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">需要积分</label>
                  <input type="number" name="pointsRequired" defaultValue={editingStory?.pointsRequired || 0} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowStoryModal(false)} className="px-4 py-2 border rounded text-gray-600">取消</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 节点 Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingNode ? '编辑节点' : '新增节点'}</h3>
              <button onClick={() => setShowNodeModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveNode} className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">节点名称 (仅后台可见)</label>
                  <input name="name" defaultValue={editingNode?.name} placeholder="例如：初始场景" className="w-full border p-2 rounded" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">讲述人 (可选)</label>
                  <input name="speakerName" defaultValue={editingNode?.speakerName} placeholder="如: 旁白/对方" className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">剧情内容文本</label>
                <textarea name="content" defaultValue={editingNode?.content} required className="w-full border p-2 rounded" rows="4" placeholder="在这里输入这一段的情境描述或对方说的话..." />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="isEnd" value="true" defaultChecked={editingNode?.isEnd} className="rounded text-rose-500" />
                  <span className="text-sm font-medium text-red-600">这是一个结局节点 (不提供选项)</span>
                </label>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowNodeModal(false)} className="px-4 py-2 border rounded text-gray-600">取消</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 选项 Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingChoice ? '编辑选项' : '新增选项'}</h3>
              <button onClick={() => setShowChoiceModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveChoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">选项文字内容</label>
                <input name="content" defaultValue={editingChoice?.content} required className="w-full border p-2 rounded" placeholder="例如：微笑并打招呼" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">跳转到的下一节点ID</label>
                  <select name="nextNodeId" defaultValue={editingChoice?.nextNodeId || ''} className="w-full border p-2 rounded">
                    <option value="">-- 结束剧本 --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>ID: {n.id} - {n.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">好感度变动</label>
                  <input type="number" name="affectionChange" defaultValue={editingChoice?.affectionChange || 0} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowChoiceModal(false)} className="px-4 py-2 border rounded text-gray-600">取消</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    {/* AI 剧本生成 Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold flex items-center text-gray-800">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" /> AI 自动创作剧本
              </h3>
              {!isAiGenerating && <button onClick={() => setShowAiModal(false)}><X className="w-5 h-5 text-gray-400" /></button>}
            </div>
            <form onSubmit={handleAiGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">想生成什么主题的互动故事？</label>
                <textarea
                  name="theme"
                  required
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  rows="3"
                  placeholder="例如：男主去相亲，遇到了极品绿茶，如何高情商化解？"
                  disabled={isAiGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">AI 会自动为您生成包含 5-10 个节点的网状分支剧情，以及对应的好感度打分逻辑。</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAiModal(false)} disabled={isAiGenerating} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">取消</button>
                <button type="submit" disabled={isAiGenerating} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center">
                  {isAiGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在创作中...</> : '立即生成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveStoryManagement;
