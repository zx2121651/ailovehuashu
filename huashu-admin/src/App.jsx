import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="content" element={<Content />} />
        <Route path="float-scripts" element={<FloatScripts />} />
        <Route path="interactive-stories" element={<InteractiveStoryManagement />} />
        <Route path="blind-box" element={<BlindBoxList />} />
        <Route path="categories" element={<Categories type="SCRIPT" />} />
        <Route path="community-categories" element={<Categories type="POST" />} />
        <Route path="script-tags" element={<ScriptTags />} />
        <Route path="ugc" element={<UGC />} />
        <Route path="settings" element={<Settings />} />
        <Route path="logs" element={<Logs />} />
        <Route path="admins" element={<Admins />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="banners" element={<Banners />} />
        <Route path="orders" element={<Orders />} />
        <Route path="courses" element={<Courses />} />
        <Route path="posts" element={<Posts />} />
        <Route path="comments" element={<Comments />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="distributors" element={<Distributors />} />
        <Route path="withdrawals" element={<WithdrawalAdmin />} />
        <Route path="commissions" element={<CommissionLogs />} />
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