const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 密钥（生产环境要改）
const JWT_SECRET = 'your-secret-key-2026';

// 数据存储文件
const USERS_FILE = path.join(__dirname, 'data/users.json');
const FRIEND_REQUESTS_FILE = path.join(__dirname, 'data/friendRequests.json');
const CHATS_FILE = path.join(__dirname, 'data/chats.json');

// 初始化数据文件夹
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// 初始化JSON文件
const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};
initFile(USERS_FILE, []);
initFile(FRIEND_REQUESTS_FILE, []);
initFile(CHATS_FILE, {});

// 工具函数：读取/写入JSON
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// 中间件：验证token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未登录' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: 'token失效' });
  }
};

// ====================== 用户接口 ======================
// 注册
app.post('/api/register', (req, res) => {
  const { phone, password, nickname, province, city } = req.body;
  if (!phone || !password || !nickname) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const users = readJSON(USERS_FILE);
  if (users.some(u => u.phone === phone)) {
    return res.status(400).json({ code: 400, msg: '手机号已注册' });
  }

  // 加密密码
  const salt = bcrypt.genSaltSync(10);
  const hashedPwd = bcrypt.hashSync(password, salt);

  const newUser = {
    id: uuidv4(),
    phone,
    password: hashedPwd,
    nickname,
    province: province || '未选择',
    city: city || '未选择',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    friends: [], // 好友ID列表
    online: false // 在线状态
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.json({ code: 200, msg: '注册成功', data: { id: newUser.id, phone, nickname } });
});

// 登录
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  // 验证密码
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ code: 400, msg: '密码错误' });
  }

  // 生成token
  const token = jwt.sign(
    { id: user.id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 更新在线状态
  user.online = true;
  writeJSON(USERS_FILE, users);

  res.json({
    code: 200,
    msg: '登录成功',
    data: {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        province: user.province,
        city: user.city
      }
    }
  });
});

// 获取当前用户信息
app.get('/api/user/info', authMiddleware, (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  res.json({
    code: 200,
    data: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      province: user.province,
      city: user.city
    }
  });
});

// 更新个人信息
app.post('/api/user/update', authMiddleware, (req, res) => {
  const { nickname, avatar, province, city } = req.body;
  const users = readJSON(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  // 更新信息
  if (nickname) users[userIndex].nickname = nickname;
  if (avatar) users[userIndex].avatar = avatar;
  if (province) users[userIndex].province = province;
  if (city) users[userIndex].city = city;

  writeJSON(USERS_FILE, users);

  res.json({ code: 200, msg: '更新成功', data: users[userIndex] });
});

// ====================== 好友接口 ======================
// 搜索用户（手机号/昵称）
app.get('/api/friend/search', authMiddleware, (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ code: 400, msg: '请输入搜索关键词' });
  }

  const users = readJSON(USERS_FILE);
  const results = users
    .filter(u => 
      u.id !== req.user.id && 
      (u.phone.includes(keyword) || u.nickname.includes(keyword))
    )
    .map(u => ({
      id: u.id,
      phone: u.phone,
      nickname: u.nickname,
      avatar: u.avatar,
      online: u.online,
      isFriend: u.friends.includes(req.user.id)
    }));

  res.json({ code: 200, data: results });
});

// 发送好友申请
app.post('/api/friend/request', authMiddleware, (req, res) => {
  const { toUserId } = req.body;
  if (!toUserId) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const users = readJSON(USERS_FILE);
  const fromUser = users.find(u => u.id === req.user.id);
  const toUser = users.find(u => u.id === toUserId);

  if (!toUser) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  // 检查是否已是好友
  if (fromUser.friends.includes(toUserId)) {
    return res.status(400).json({ code: 400, msg: '已是好友' });
  }

  const requests = readJSON(FRIEND_REQUESTS_FILE);
  // 检查是否已发送申请
  if (requests.some(r => 
    r.fromUserId === req.user.id && 
    r.toUserId === toUserId && 
    r.status === 'pending'
  )) {
    return res.status(400).json({ code: 400, msg: '已发送好友申请' });
  }

  // 创建申请
  const newRequest = {
    id: uuidv4(),
    fromUserId: req.user.id,
    toUserId,
    status: 'pending', // pending/accepted/rejected
    createTime: new Date().toLocaleString()
  };

  requests.push(newRequest);
  writeJSON(FRIEND_REQUESTS_FILE, requests);

  res.json({ code: 200, msg: '好友申请已发送' });
});

// 获取好友申请列表
app.get('/api/friend/requests', authMiddleware, (req, res) => {
  const requests = readJSON(FRIEND_REQUESTS_FILE);
  const users = readJSON(USERS_FILE);

  // 筛选当前用户收到的申请
  const myRequests = requests
    .filter(r => r.toUserId === req.user.id && r.status === 'pending')
    .map(r => {
      const fromUser = users.find(u => u.id === r.fromUserId);
      return {
        id: r.id,
        fromUser: {
          id: fromUser.id,
          nickname: fromUser.nickname,
          avatar: fromUser.avatar,
          phone: fromUser.phone
        },
        createTime: r.createTime
      };
    });

  res.json({ code: 200, data: myRequests });
});

// 处理好友申请（同意/拒绝）
app.post('/api/friend/handle-request', authMiddleware, (req, res) => {
  const { requestId, action } = req.body; // action: accept/reject
  if (!requestId || !action) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const requests = readJSON(FRIEND_REQUESTS_FILE);
  const requestIndex = requests.findIndex(r => r.id === requestId && r.toUserId === req.user.id);
  
  if (requestIndex === -1) {
    return res.status(400).json({ code: 400, msg: '申请不存在' });
  }

  const request = requests[requestIndex];
  if (action === 'accept') {
    // 同意：互相添加好友
    const users = readJSON(USERS_FILE);
    const fromUserIndex = users.findIndex(u => u.id === request.fromUserId);
    const toUserIndex = users.findIndex(u => u.id === request.toUserId);

    users[fromUserIndex].friends.push(request.toUserId);
    users[toUserIndex].friends.push(request.fromUserId);
    writeJSON(USERS_FILE, users);

    request.status = 'accepted';
  } else if (action === 'reject') {
    // 拒绝
    request.status = 'rejected';
  } else {
    return res.status(400).json({ code: 400, msg: '操作无效' });
  }

  requests[requestIndex] = request;
  writeJSON(FRIEND_REQUESTS_FILE, requests);

  res.json({ code: 200, msg: action === 'accept' ? '已同意好友申请' : '已拒绝好友申请' });
});

// 获取我的好友列表
app.get('/api/friend/list', authMiddleware, (req, res) => {
  const users = readJSON(USERS_FILE);
  const currentUser = users.find(u => u.id === req.user.id);
  
  if (!currentUser) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  // 组装好友信息
  const friendList = currentUser.friends.map(friendId => {
    const friend = users.find(u => u.id === friendId);
    return {
      id: friend.id,
      nickname: friend.nickname,
      avatar: friend.avatar,
      phone: friend.phone,
      online: friend.online,
      province: friend.province,
      city: friend.city
    };
  }).filter(Boolean);

  res.json({ code: 200, data: friendList });
});

// 删除好友
app.post('/api/friend/delete', authMiddleware, (req, res) => {
  const { friendId } = req.body;
  if (!friendId) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const users = readJSON(USERS_FILE);
  const currentUserIndex = users.findIndex(u => u.id === req.user.id);
  const friendUserIndex = users.findIndex(u => u.id === friendId);

  if (currentUserIndex === -1 || friendUserIndex === -1) {
    return res.status(400).json({ code: 400, msg: '用户不存在' });
  }

  // 互相删除
  users[currentUserIndex].friends = users[currentUserIndex].friends.filter(id => id !== friendId);
  users[friendUserIndex].friends = users[friendUserIndex].friends.filter(id => id !== req.user.id);
  
  writeJSON(USERS_FILE, users);
  res.json({ code: 200, msg: '删除好友成功' });
});

// ====================== 聊天接口 ======================
// 获取聊天记录
app.get('/api/chat/history', authMiddleware, (req, res) => {
  const { friendId } = req.query;
  if (!friendId) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  const chats = readJSON(CHATS_FILE);
  const chatKey = [req.user.id, friendId].sort().join('_'); // 保证key唯一
  const history = chats[chatKey] || [];

  res.json({ code: 200, data: history });
});

// 发送消息
app.post('/api/chat/send', authMiddleware, (req, res) => {
  const { friendId, content } = req.body;
  if (!friendId || !content) {
    return res.status(400).json({ code: 400, msg: '参数不全' });
  }

  // 检查是否是好友
  const users = readJSON(USERS_FILE);
  const currentUser = users.find(u => u.id === req.user.id);
  if (!currentUser.friends.includes(friendId)) {
    return res.status(400).json({ code: 400, msg: '非好友无法发送消息' });
  }

  const chats = readJSON(CHATS_FILE);
  const chatKey = [req.user.id, friendId].sort().join('_');
  
  // 创建消息
  const newMsg = {
    id: uuidv4(),
    senderId: req.user.id,
    receiverId: friendId,
    content,
    time: new Date().toLocaleString()
  };

  if (!chats[chatKey]) {
    chats[chatKey] = [];
  }
  chats[chatKey].push(newMsg);
  writeJSON(CHATS_FILE, chats);

  res.json({ code: 200, msg: '消息发送成功', data: newMsg });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});