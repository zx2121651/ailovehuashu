const jwt = require('jsonwebtoken');

const JWT_SECRET = 'huashu_user_secret_key_2026';

const payload = {
  userId: 'mentor_id_123',
  name: '官方特聘导师',
  role: 'MENTOR'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
console.log(token);
