import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Check,
  X,
  Clock,
  MessageSquare,
  User,
  Download,
  Save,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";

const UGC = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [currentContribution, setCurrentContribution] = useState(null);
  const [approveForm, setApproveForm] = useState({ categoryId: "", type: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/v1/admin/categories?type=SCRIPT", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success || data.code === 200) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setApproveForm((prev) => ({
              ...prev,
              categoryId: data.data[0].id,
            }));
          }
        }
      } catch (err) {}
    };
    fetchCategories();
  }, [token]);

  const openApproveModal = (contribution) => {
    setCurrentContribution(contribution);
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
    setCurrentContribution(null);
    setApproveForm((prev) => ({ ...prev, type: "" }));
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!approveForm.categoryId || !approveForm.type) {
      alert("请选择分类并输入话术类型");
      return;
    }
    handleReview(
      currentContribution.id,
      "approve",
      "",
      approveForm.categoryId,
      approveForm.type,
    );
    closeApproveModal();
  };

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/admin/contributions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.code === 200 || data.success) {
        setContributions(data.data.list || data.data);
      } else {
        setError("加载审核列表失败");
      }
    } catch (err) {
      setError("服务器连接错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [token]);

  const handleReview = async (
    id,
    action,
    reason = "",
    categoryId = null,
    type = null,
  ) => {
    try {
      const response = await fetch(`/api/v1/admin/contributions/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason, categoryId, type }),
      });

      const data = await response.json();

      if (data.code === 200 || data.success) {
        // Refresh the list
        fetchContributions();
      } else {
        alert("操作失败: " + (data.message || "未知错误"));
      }
    } catch (err) {
      alert("网络错误，无法提交审核结果");
    }
  };

  const filteredContributions = contributions.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            UGC 投稿审核
          </h2>
          <p className="text-slate-500 mt-2">
            审核用户提交的原创话术，丰富平台话术库。
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === "pending" ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            待审核
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === "approved" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            已通过
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === "rejected" ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-100/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            已拒绝
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${statusFilter === "all" ? "bg-slate-100 text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            全部
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-12 text-center text-slate-500">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-16 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Check size={24} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-600">
              目前没有需要处理的投稿
            </p>
            <p className="text-sm mt-1">您已经完成了所有的审核工作！</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredContributions.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 p-6 hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Content Area */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3 text-sm text-slate-500 mb-3 border-b border-slate-50 pb-3">
                      <div className="flex items-center font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md">
                        <User size={14} className="mr-1.5 text-slate-400" />
                        <span>
                          {item.user?.name || item.userId || "未知用户"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1.5 text-slate-400" />
                        <span>
                          {item.time ||
                            new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          item.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                            : item.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-100/50"
                              : "bg-amber-50 text-amber-700 border border-amber-100/50 shadow-sm"
                        }`}
                      >
                        {item.status === "approved"
                          ? "已通过"
                          : item.status === "rejected"
                            ? "已拒绝"
                            : "待审核"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute top-3 left-3 text-slate-300">
                          <MessageSquare size={16} />
                        </div>
                        <div className="bg-white border border-slate-200 p-4 pl-10 rounded-xl text-slate-800 font-medium shadow-sm leading-relaxed">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                            情境 / 问题
                          </span>
                          {item.question}
                        </div>
                      </div>

                      <div className="relative ml-6">
                        <div className="absolute top-3 left-3 text-blue-300 transform scale-x-[-1]">
                          <MessageSquare size={16} />
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 p-4 pl-10 rounded-xl text-blue-900 shadow-sm leading-relaxed relative before:absolute before:-left-3 before:top-1/2 before:-mt-2 before:border-y-8 before:border-y-transparent before:border-r-8 before:border-r-blue-100">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">
                            提供的话术回复
                          </span>
                          {item.answer}
                        </div>
                      </div>
                    </div>

                    {item.status === "rejected" && item.reason && (
                      <div className="text-sm text-rose-600 mt-4 bg-rose-50 p-3 rounded-xl border border-rose-100/50 flex items-start">
                        <span className="font-bold mr-2 mt-0.5 whitespace-nowrap">
                          拒绝原因：
                        </span>
                        <span>{item.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex md:flex-col gap-3 mt-4 md:mt-0 md:min-w-[140px]">
                    {item.status === "pending" ? (
                      <>
                        <button
                          onClick={() => openApproveModal(item)}
                          className="flex items-center justify-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 w-full"
                        >
                          <Check size={16} />
                          <span>通过入库</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason =
                              window.prompt("请输入拒绝原因 (可选):");
                            if (reason !== null) {
                              handleReview(item.id, "reject", reason);
                            }
                          }}
                          className="flex items-center justify-center space-x-1.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full"
                        >
                          <X size={16} />
                          <span>拒绝采用</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-sm font-medium text-slate-400 py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        已处理完毕
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">通过并入库</h3>
              <button
                onClick={closeApproveModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  选择分类
                </label>
                <select
                  value={approveForm.categoryId}
                  onChange={(e) =>
                    setApproveForm({
                      ...approveForm,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  话术类型 (如: 高情商、幽默、化解)
                </label>
                <input
                  type="text"
                  value={approveForm.type}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="请输入话术类型标签"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeApproveModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>确认入库</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UGC;
