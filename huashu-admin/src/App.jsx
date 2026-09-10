import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PERMISSIONS } from './utils/permissions';
import PermissionGuard from './components/PermissionGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Content from './pages/Content';
import Categories from './pages/Categories';
import UGC from './pages/UGC';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Admins from './pages/Admins';
import Feedback from './pages/Feedback';
import Banners from './pages/Banners';
import Orders from './pages/Orders';
import Courses from './pages/Courses';
import Comments from './pages/Comments';
import Posts from './pages/Posts';
import Distributors from './pages/distributor/Distributors';
import WithdrawalAdmin from './pages/distributor/WithdrawalAdmin';
import CommissionLogs from './pages/distributor/CommissionLogs';
import Notifications from './pages/Notifications';
import BlindBoxList from './pages/BlindBoxList';
import FloatScripts from './pages/FloatScripts';
import InteractiveStoryManagement from './pages/InteractiveStoryManagement';
import ScriptTags from './pages/ScriptTags';
import AdminLayout from './layouts/AdminLayout';
import Forbidden from './pages/Forbidden';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 路由级权限守卫：未授权则跳转 403 页面
const GuardRoute = ({ permission, children }) => (
  <PermissionGuard permission={permission} fallback={<Navigate to="/403" replace />}>
    {children}
  </PermissionGuard>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="403" element={<Forbidden />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<GuardRoute permission={PERMISSIONS.USER_VIEW}><Users /></GuardRoute>} />
        <Route path="content" element={<Content />} />
        <Route path="float-scripts" element={<GuardRoute permission={PERMISSIONS.OPS_MANAGE}><FloatScripts /></GuardRoute>} />
        <Route path="interactive-stories" element={<InteractiveStoryManagement />} />
        <Route path="blind-box" element={<GuardRoute permission={PERMISSIONS.OPS_MANAGE}><BlindBoxList /></GuardRoute>} />
        <Route path="categories" element={<Categories type="SCRIPT" />} />
        <Route path="community-categories" element={<GuardRoute permission={PERMISSIONS.CONTENT_MODERATE}><Categories type="POST" /></GuardRoute>} />
        <Route path="script-tags" element={<ScriptTags />} />
        <Route path="ugc" element={<GuardRoute permission={PERMISSIONS.UGC_REVIEW}><UGC /></GuardRoute>} />
        <Route path="settings" element={<GuardRoute permission={PERMISSIONS.SYSTEM_MANAGE}><Settings /></GuardRoute>} />
        <Route path="logs" element={<GuardRoute permission={PERMISSIONS.SYSTEM_MANAGE}><Logs /></GuardRoute>} />
        <Route path="admins" element={<GuardRoute permission={PERMISSIONS.SYSTEM_MANAGE}><Admins /></GuardRoute>} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="banners" element={<GuardRoute permission={PERMISSIONS.OPS_MANAGE}><Banners /></GuardRoute>} />
        <Route path="orders" element={<GuardRoute permission={PERMISSIONS.ORDER_VIEW}><Orders /></GuardRoute>} />
        <Route path="courses" element={<Courses />} />
        <Route path="posts" element={<GuardRoute permission={PERMISSIONS.CONTENT_MODERATE}><Posts /></GuardRoute>} />
        <Route path="comments" element={<GuardRoute permission={PERMISSIONS.CONTENT_MODERATE}><Comments /></GuardRoute>} />
        <Route path="notifications" element={<GuardRoute permission={PERMISSIONS.SYSTEM_MANAGE}><Notifications /></GuardRoute>} />
        <Route path="distributors" element={<GuardRoute permission={PERMISSIONS.COMMISSION_REVIEW}><Distributors /></GuardRoute>} />
        <Route path="withdrawals" element={<GuardRoute permission={PERMISSIONS.COMMISSION_REVIEW}><WithdrawalAdmin /></GuardRoute>} />
        <Route path="commissions" element={<GuardRoute permission={PERMISSIONS.COMMISSION_REVIEW}><CommissionLogs /></GuardRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;