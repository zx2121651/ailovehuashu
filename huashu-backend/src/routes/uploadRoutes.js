const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');

const uploadDir = path.join(__dirname, '../../public/uploads');

// 组合鉴权中间件：允许普通用户或者管理员
const combinedAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }

  const token = authHeader.replace('Bearer ', '');

  // 验证用户 token
  try {
    const userDecoded = jwt.verify(token, process.env.JWT_SECRET || 'huashu_user_secret_key_2026');
    req.user = userDecoded;
    return next();
  } catch (err) {
    // 若不是用户 token，尝试验证 admin token
    try {
      const adminDecoded = jwt.verify(token, process.env.JWT_SECRET || 'huashu_admin_super_secret_key_2026');
      req.admin = adminDecoded.admin;
      return next();
    } catch (adminErr) {
      return res.status(401).json({ code: 401, message: '认证失败，请重新登录' });
    }
  }
};

// Ensure directory exists
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos and images
});

// 单文件上传，可接受 'file' 字段，必须鉴权
router.post('/', combinedAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ code: 400, message: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: 'No file uploaded' });
  }

  // 返回可以通过静态服务访问的 URL
  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    code: 200,
    message: 'Upload successful',
    data: {
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

module.exports = router;
