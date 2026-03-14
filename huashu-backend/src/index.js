require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 引入路由模块
const userRoutes = require('./routes/userRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const aiRoutes = require('./routes/aiRoutes');
const actionRoutes = require('./routes/actionRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const courseRoutes = require('./routes/courseRoutes');
const commentRoutes = require('./routes/commentRoutes');
const postRoutes = require('./routes/postRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const floatScriptRoutes = require('./routes/floatScripts');
const storyRoutes = require('./routes/storyRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 全局中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 application/json 格式的请求体
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 基础健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Huashu Backend API is running' });
});

// 挂载 API 路由前缀 /api/v1
app.use('/api/v1', userRoutes);
app.use('/api/v1', scriptRoutes);
app.use('/api/v1', aiRoutes);
app.use('/api/v1', actionRoutes);
app.use('/api/v1', serviceRoutes);
app.use('/api/v1/commission', commissionRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1', favoriteRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/float-scripts', floatScriptRoutes);
app.use('/api/v1', storyRoutes);

// Admin Routes
app.use('/api/v1/admin', adminRoutes);

// 全局 404 处理
app.use((req, res, next) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 恋爱话术库后端服务已启动!`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`=================================`);
});
