import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Plus, CheckCircle, XCircle, Search, ToggleLeft, ToggleRight, Loader } from 'lucide-react';

const Courses = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    cover: '',
    link: '',
    isRecommended: false,
    tags: '',
    rating: 0,
    students: 0
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        desc: course.desc,
        cover: course.cover,
        link: course.link || '',
        isRecommended: course.isRecommended,
        tags: course.tags.join(', '),
        rating: course.rating,
        students: course.students
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        desc: '',
        cover: '',
        link: '',
        isRecommended: false,
        tags: '',
        rating: 5,
        students: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      rating: parseFloat(formData.rating),
      students: parseInt(formData.students, 10)
    };

    try {
      if (editingCourse) {
        await fetch(`/api/v1/admin/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/v1/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Submit error:', err);
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个课程吗？')) return;
    try {
      await fetch(`/api/v1/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      console.error('Delete error:', err);
      alert('删除失败');
    }
  };

  const toggleRecommend = async (id, currentStatus) => {
    try {
      await fetch(`/api/v1/admin/courses/${id}/recommend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isRecommended: !currentStatus })
      });
      fetchCourses();
    } catch (err) {
      console.error('Toggle recommend error:', err);
      alert('切换推荐状态失败');
    }
  };

  const filteredCourses = courses.filter(c => c.title.includes(search) || c.desc.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">课程管理</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} className="mr-2" />
          新增课程
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索课程名称或简介..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 text-slate-400">
            <Loader className="animate-spin mr-2" /> 加载中...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium rounded-tl-xl">封面</th>
                  <th className="p-4 font-medium">课程名称</th>
                  <th className="p-4 font-medium">外部链接</th>
                  <th className="p-4 font-medium">推荐状态</th>
                  <th className="p-4 font-medium rounded-tr-xl">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">暂无数据</td>
                  </tr>
                ) : filteredCourses.map(course => (
                  <tr key={course.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <img src={course.cover || 'https://via.placeholder.com/150'} alt="cover" className="w-16 h-10 object-cover rounded shadow-sm" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{course.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{course.desc}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {course.link ? (
                        <a href={course.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate inline-block max-w-[150px]">{course.link}</a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleRecommend(course.id, course.isRecommended)}
                        className={`flex items-center space-x-1 ${course.isRecommended ? 'text-green-600' : 'text-slate-400'}`}
                      >
                        {course.isRecommended ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        <span className="text-sm">{course.isRecommended ? '推荐中' : '未推荐'}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-3">
                        <button onClick={() => handleOpenModal(course)} className="text-blue-600 hover:text-blue-800 transition-colors" title="编辑">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="text-rose-500 hover:text-rose-700 transition-colors" title="删除">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingCourse ? '编辑课程' : '新增课程'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-lg p-1 shadow-sm">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">课程标题</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">封面图片链接</label>
                    <input required type="url" value={formData.cover} onChange={e => setFormData({...formData, cover: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">课程简介</label>
                  <textarea required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">外部链接 (点击跳转)</label>
                  <input type="url" placeholder="可选，跳转到微信文章或视频链接" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">标签 (逗号分隔)</label>
                    <input type="text" placeholder="如: 撩妹,恋爱" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">评分</label>
                    <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">学习人数</label>
                    <input type="number" value={formData.students} onChange={e => setFormData({...formData, students: e.target.value})} className="w-full border border-slate-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="isRecommended" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                  <label htmlFor="isRecommended" className="text-sm font-medium text-slate-700">设为推荐 (将在App首页展示)</label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">取消</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-sm shadow-blue-600/20">
                    <CheckCircle size={18} className="mr-2" /> 保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
