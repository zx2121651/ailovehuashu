const fs = require('fs');
const path = 'huashu-admin/src/pages/InteractiveStoryManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add AI icons
const importRegex = /import { Plus, Edit, Trash2, ListTree, Save, X, ChevronRight, ChevronDown } from 'lucide-react';/;
content = content.replace(importRegex, "import { Plus, Edit, Trash2, ListTree, Save, X, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';");

// 2. Add AI Modal State
const stateRegex = /const \[showStoryModal, setShowStoryModal\] = useState\(false\);/;
content = content.replace(stateRegex, `const [showStoryModal, setShowStoryModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);`);

// 3. Add AI generate handler
const handlerRegex = /const fetchStories = async \(\) => {/;
const aiHandler = `const handleAiGenerate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const theme = formData.get('theme');
    if (!theme) return toast.error('请输入剧情主题');

    setIsAiGenerating(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/stories/generate\`, {
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
  };\n\n  `;
content = content.replace(handlerRegex, aiHandler + "const fetchStories = async () => {");

// 4. Add AI Generate Button next to "新增剧本"
const btnRegex = /<button\s*onClick={\(\) => { setEditingStory\(null\); setShowStoryModal\(true\); }}\s*className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 flex items-center"\s*>\s*<Plus className="w-4 h-4 mr-2" \/> 新增剧本\s*<\/button>/;
const aiBtn = `<div className="flex space-x-3">
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
        </div>`;
content = content.replace(btnRegex, aiBtn);

// 5. Add AI Modal JSX at the end before </div>
const aiModalJSX = `{/* AI 剧本生成 Modal */}
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
    </div>`;
content = content.replace(/<\/div>\s*<style>/, aiModalJSX + "\n    <style>");
// Fallback if <style> doesn't exist
if (!content.includes('AI 剧本生成 Modal')) {
   content = content.replace(/<\/div>\s*\);\s*}\s*export default InteractiveStoryManagement;/g, aiModalJSX + "\n  );\n}\n\nexport default InteractiveStoryManagement;");
}

fs.writeFileSync(path, content, 'utf8');
