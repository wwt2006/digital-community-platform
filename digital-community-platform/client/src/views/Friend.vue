<template>
  <div class="friend-page">
    <!-- 左侧：好友管理 -->
    <div class="friend-sidebar">
      <!-- 搜索添加好友 -->
      <el-card class="search-card">
        <template #header>
          <span>添加好友</span>
        </template>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索手机号/昵称"
          @input="handleSearch"
          style="margin-bottom: 10px;"
        ></el-input>
        
        <div v-if="searchResults.length" class="search-result">
          <div class="search-item" v-for="user in searchResults" :key="user.id">
            <el-avatar :src="user.avatar"></el-avatar>
            <div class="search-info">
              <div>{{ user.nickname }}</div>
              <div class="phone">{{ user.phone }}</div>
            </div>
            <el-button 
              size="small" 
              type="primary" 
              @click="sendFriendRequest(user.id)"
              :disabled="user.isFriend"
            >
              {{ user.isFriend ? '已是好友' : '添加好友' }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 好友申请 -->
      <el-card class="request-card" style="margin-top: 10px;">
        <template #header>
          <span>好友申请 ({{ friendRequests.length }})</span>
        </template>
        <div v-if="friendRequests.length" class="request-list">
          <div class="request-item" v-for="req in friendRequests" :key="req.id">
            <el-avatar :src="req.fromUser.avatar"></el-avatar>
            <div class="request-info">
              <div>{{ req.fromUser.nickname }}</div>
              <div class="time">{{ req.createTime }}</div>
            </div>
            <el-button size="small" type="primary" @click="handleRequest(req.id, 'accept')">同意</el-button>
            <el-button size="small" @click="handleRequest(req.id, 'reject')">拒绝</el-button>
          </div>
        </div>
        <div v-else class="empty-tip">暂无好友申请</div>
      </el-card>

      <!-- 我的好友列表 -->
      <el-card class="friend-list-card" style="margin-top: 10px;">
        <template #header>
          <span>我的好友 ({{ friendList.length }})</span>
        </template>
        <div class="friend-item" v-for="friend in friendList" :key="friend.id" @click="selectFriend(friend)">
          <el-avatar :src="friend.avatar">
            <el-tag size="mini" type="success" slot="extra" v-if="friend.online">在线</el-tag>
          </el-avatar>
          <div class="friend-info">
            <div>{{ friend.nickname }}</div>
            <div class="region">{{ friend.province }} {{ friend.city }}</div>
          </div>
          <el-button size="small" type="text" @click.stop="deleteFriend(friend.id)">删除</el-button>
        </div>
        <div v-if="!friendList.length" class="empty-tip">暂无好友，快去添加吧</div>
      </el-card>
    </div>

    <!-- 右侧：聊天区域 -->
    <div class="chat-area" v-if="activeFriend">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <el-avatar :src="activeFriend.avatar"></el-avatar>
        <div class="friend-name">{{ activeFriend.nickname }}</div>
        <el-button size="small" type="text">设置备注</el-button>
      </div>

      <!-- 聊天内容 -->
      <div class="chat-content" ref="chatContentRef">
        <div 
          class="chat-message" 
          :class="{ self: msg.senderId === currentUser.id }"
          v-for="msg in chatHistory" 
          :key="msg.id"
        >
          <el-avatar :size="32" :src="msg.senderId === currentUser.id ? currentUser.avatar : activeFriend.avatar"></el-avatar>
          <div class="message-bubble">
            {{ msg.content }}
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="chat-input">
        <el-input
          v-model="newMessage"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keydown.enter.prevent="sendMessage"
        ></el-input>
        <el-button type="primary" @click="sendMessage" :loading="sending">发送</el-button>
      </div>
    </div>

    <div class="empty-chat" v-else>
      请选择好友开始聊天
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
const loading = ref(false);
const sending = ref(false);

// 搜索相关
const searchKeyword = ref('');
const searchResults = ref([]);

// 好友申请
const friendRequests = ref([]);

// 好友列表
const friendList = ref([]);

// 聊天相关
const activeFriend = ref(null);
const newMessage = ref('');
const chatHistory = ref([]);
const chatContentRef = ref(null);

// 页面加载初始化
onMounted(() => {
  loadFriendRequests();
  loadFriendList();
});

// 搜索用户
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  try {
    const res = await request.get('/friend/search', {
      params: { keyword: searchKeyword.value }
    });
    if (res.code === 200) {
      searchResults.value = res.data;
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 发送好友申请
const sendFriendRequest = async (toUserId) => {
  try {
    const res = await request.post('/friend/request', { toUserId });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      handleSearch(); // 刷新搜索结果
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 加载好友申请
const loadFriendRequests = async () => {
  try {
    const res = await request.get('/friend/requests');
    if (res.code === 200) {
      friendRequests.value = res.data;
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 处理好友申请
const handleRequest = async (requestId, action) => {
  try {
    const res = await request.post('/friend/handle-request', {
      requestId,
      action
    });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      loadFriendRequests(); // 刷新申请列表
      loadFriendList(); // 刷新好友列表
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 加载好友列表
const loadFriendList = async () => {
  try {
    const res = await request.get('/friend/list');
    if (res.code === 200) {
      friendList.value = res.data;
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 选择好友
const selectFriend = async (friend) => {
  activeFriend.value = friend;
  // 加载聊天记录
  await loadChatHistory(friend.id);
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
};

// 加载聊天记录
const loadChatHistory = async (friendId) => {
  try {
    const res = await request.get('/chat/history', {
      params: { friendId }
    });
    if (res.code === 200) {
      chatHistory.value = res.data;
    }
  } catch (err) {
    ElMessage.error(err.msg);
  }
};

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('消息不能为空');
    return;
  }
  
  try {
    sending.value = true;
    const res = await request.post('/chat/send', {
      friendId: activeFriend.value.id,
      content: newMessage.value
    });
    
    if (res.code === 200) {
      chatHistory.value.push(res.data);
      newMessage.value = '';
      scrollToBottom();
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error(err.msg);
  } finally {
    sending.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
  }
};

// 删除好友
const deleteFriend = async (friendId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该好友吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const res = await request.post('/friend/delete', { friendId });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      loadFriendList();
      if (activeFriend.value?.id === friendId) {
        activeFriend.value = null;
      }
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.msg || '取消操作');
    }
  }
};
</script>

<style scoped>
.friend-page {
  display: flex;
  height: calc(100vh - 120px);
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
}

/* 左侧侧边栏 */
.friend-sidebar {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-card, .request-card, .friend-list-card {
  flex-shrink: 0;
}

.search-item, .request-item, .friend-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.search-info, .request-info, .friend-info {
  flex: 1;
  margin: 0 10px;
}

.phone, .region, .time {
  font-size: 12px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* 右侧聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chat-header {
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.friend-name {
  font-weight: bold;
}

.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.chat-message {
  display: flex;
  margin-bottom: 15px;
}

.chat-message.self {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 8px;
  background: #f0f2f5;
  position: relative;
}

.chat-message.self .message-bubble {
  background: #409eff;
  color: #fff;
}

.message-time {
  font-size: 10px;
  color: #999;
  position: absolute;
  bottom: 5px;
  right: 10px;
}

.chat-message.self .message-time {
  color: rgba(255,255,255,0.7);
}

.chat-input {
  padding: 10px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chat-input .el-textarea {
  flex: 1;
}

.empty-chat {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
</style>