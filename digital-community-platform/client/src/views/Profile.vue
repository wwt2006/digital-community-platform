<template>
  <div class="profile-page">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <div class="profile-header">
        <!-- 仅自己可修改头像 -->
        <el-upload
          v-if="isSelf"
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
        >
          <el-avatar :size="80" :src="userInfo.avatar"></el-avatar>
          <div class="avatar-tip">更换头像</div>
        </el-upload>
        <!-- 他人主页仅显示头像 -->
        <el-avatar v-else :size="80" :src="userInfo.avatar"></el-avatar>
        
        <div class="profile-info">
          <h2>{{ userInfo.nickname || userInfo.phone }}</h2>
          <p>所在地区：{{ userInfo.province }} {{ userInfo.city }}</p>
          <p v-if="isSelf">注册时间：{{ userInfo.registerTime }}</p>
        </div>
      </div>
      
      <!-- 仅自己可编辑资料 -->
      <el-button v-if="isSelf" type="primary" @click="showEditDialog = true" style="margin-top: 20px;">
        编辑个人资料
      </el-button>
    </el-card>

    <!-- 编辑资料弹窗（仅自己可见） -->
    <el-dialog v-if="isSelf" v-model="showEditDialog" title="编辑个人资料" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入新昵称"></el-input>
        </el-form-item>
        <el-form-item label="所在省份">
          <el-select v-model="editForm.province" placeholder="请选择省份">
            <el-option label="北京市" value="北京市"></el-option>
            <el-option label="上海市" value="上海市"></el-option>
            <el-option label="广东省" value="广东省"></el-option>
            <el-option label="浙江省" value="浙江省"></el-option>
            <el-option label="江苏省" value="江苏省"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所在城市">
          <el-select v-model="editForm.city" placeholder="请选择城市">
            <el-option label="北京市" value="北京市"></el-option>
            <el-option label="上海市" value="上海市"></el-option>
            <el-option label="广州市" value="广州市"></el-option>
            <el-option label="深圳市" value="深圳市"></el-option>
            <el-option label="杭州市" value="杭州市"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 留言板（仅好友可留言） -->
    <el-card class="message-board" style="margin-top: 20px;">
      <template #header>
        <span>留言板</span>
      </template>
      
      <!-- 仅好友/自己可留言 -->
      <el-input
        v-if="canLeaveMessage"
        v-model="newMessage"
        type="textarea"
        :rows="3"
        placeholder="写下你的留言..."
        style="margin-bottom: 10px;"
      ></el-input>
      <el-button v-if="canLeaveMessage" type="primary" @click="addMessage">提交留言</el-button>
      
      <!-- 无权限提示 -->
      <div v-else class="no-permission">
        <el-icon><Lock /></el-icon>
        仅好友可留言，请先添加对方为好友
      </div>
      
      <!-- 留言列表 -->
      <div class="message-list" style="margin-top: 20px;">
        <div class="message-item" v-for="msg in messageList" :key="msg.id">
          <div class="message-header">
            <el-avatar :size="24" :src="msg.avatar"></el-avatar>
            <span class="message-author">{{ msg.author }}</span>
            <span class="message-time">{{ msg.time }}</span>
          </div>
          <p class="message-content">{{ msg.content }}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
const targetUserId = route.query.userId || currentUser.id; // 目标用户ID（自己/好友）

// 状态管理
const userInfo = ref({});
const isSelf = ref(false);
const canLeaveMessage = ref(false);
const showEditDialog = ref(false);
const editForm = ref({ nickname: '', province: '', city: '' });
const newMessage = ref('');
const messageList = ref([]);

// 页面加载时初始化
onMounted(() => {
  loadUserInfo();
  loadMessages();
  checkPermission();
});

// 加载用户信息
const loadUserInfo = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const targetUser = users.find(u => u.id == targetUserId);
  if (!targetUser) {
    ElMessage.error('用户不存在');
    router.push('/friend');
    return;
  }
  
  userInfo.value = targetUser;
  isSelf.value = targetUser.id == currentUser.id;
  
  // 初始化编辑表单
  if (isSelf.value) {
    editForm.value = {
      nickname: targetUser.nickname,
      province: targetUser.province,
      city: targetUser.city
    };
  }
};

// 检查留言权限（仅好友/自己可留言）
const checkPermission = () => {
  if (isSelf.value) {
    canLeaveMessage.value = true; // 自己可留言
    return;
  }
  
  // 检查是否是好友
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const currentUserInfo = users.find(u => u.id == currentUser.id);
  canLeaveMessage.value = currentUserInfo.friends.includes(Number(targetUserId));
};

// 加载留言列表
const loadMessages = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const targetUser = users.find(u => u.id == targetUserId);
  messageList.value = targetUser.messages || [];
};

// 更换头像（仅自己）
const beforeAvatarUpload = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    // 更新本地头像
    userInfo.value.avatar = e.target.result;
    
    // 保存到localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id == currentUser.id);
    users[userIndex].avatar = e.target.result;
    localStorage.setItem('users', JSON.stringify(users));
    
    // 更新登录信息
    currentUser.avatar = e.target.result;
    localStorage.setItem('userInfo', JSON.stringify(currentUser));
    
    ElMessage.success('头像更换成功！');
  };
  reader.readAsDataURL(file);
  return false; // 阻止默认上传
};

// 保存个人资料（仅自己）
const saveProfile = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.id == currentUser.id);
  
  // 更新用户信息
  users[userIndex].nickname = editForm.value.nickname;
  users[userIndex].province = editForm.value.province;
  users[userIndex].city = editForm.value.city;
  
  // 保存到localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // 更新当前用户信息
  userInfo.value.nickname = editForm.value.nickname;
  userInfo.value.province = editForm.value.province;
  userInfo.value.city = editForm.value.city;
  
  // 更新登录信息
  currentUser.nickname = editForm.value.nickname;
  currentUser.province = editForm.value.province;
  currentUser.city = editForm.value.city;
  localStorage.setItem('userInfo', JSON.stringify(currentUser));
  
  ElMessage.success('个人资料更新成功！');
  showEditDialog.value = false;
};

// 提交留言（仅好友/自己）
const addMessage = () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('留言内容不能为空！');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const targetIndex = users.findIndex(u => u.id == targetUserId);
  
  // 创建新留言
  const newMsg = {
    id: Date.now(),
    author: currentUser.nickname || currentUser.phone,
    avatar: currentUser.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    time: new Date().toLocaleString('zh-CN'),
    content: newMessage.value
  };
  
  // 添加到留言列表
  if (!users[targetIndex].messages) users[targetIndex].messages = [];
  users[targetIndex].messages.push(newMsg);
  
  // 保存到localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // 刷新留言列表
  messageList.value.push(newMsg);
  newMessage.value = '';
  ElMessage.success('留言成功！');
};
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  padding: 30px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-info {
  margin-left: 20px;
}

.profile-info h2 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.profile-info p {
  color: #666;
}

.avatar-uploader {
  position: relative;
  cursor: pointer;
}

.avatar-tip {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.message-board {
  padding: 20px;
}

.no-permission {
  text-align: center;
  padding: 20px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.message-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.message-author {
  margin-left: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.message-time {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

.message-content {
  color: #666;
  line-height: 1.5;
}
</style>