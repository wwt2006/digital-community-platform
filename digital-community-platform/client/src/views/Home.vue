<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <el-card class="welcome-card">
      <h2>欢迎来到生活新图景数字化平台</h2>
      <p class="desc">
        {{ isLogin ? `你好，${userInfo.phone}！` : '请登录后体验更多功能' }}
      </p>
    </el-card>

    <!-- 功能入口卡片 -->
    <div class="function-cards">
      <el-card class="function-card" @click="goToFunction">
        <el-icon size="40"><Grid /></el-icon>
        <h3>核心功能</h3>
        <p>社区公告、活动报名、志愿服务</p>
      </el-card>

      <el-card class="function-card" @click="goToFriend" v-if="isLogin">
        <el-icon size="40"><User /></el-icon>
        <h3>好友互动</h3>
        <p>添加好友、实时聊天、分享生活</p>
      </el-card>

      <el-card class="function-card" @click="goToForum" v-if="isLogin">
        <el-icon size="40"><ChatDotRound /></el-icon>
        <h3>社区论坛</h3>
        <p>发布帖子、交流讨论、分享经验</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Grid, User, ChatDotRound } from '@element-plus/icons-vue';

const router = useRouter();
const isLogin = ref(false);
const userInfo = ref({ phone: '' });

// 页面加载时检查登录状态
onMounted(() => {
  const token = localStorage.getItem('token');
  const info = localStorage.getItem('userInfo');
  
  if (token && info) {
    isLogin.value = true;
    userInfo.value = JSON.parse(info);
  }
});

// 跳转到功能页
const goToFunction = () => {
  router.push('/function');
};

// 跳转到好友页
const goToFriend = () => {
  router.push('/friend');
};

// 跳转到论坛页
const goToForum = () => {
  router.push('/forum');
};
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 30px;
  padding: 30px;
  text-align: center;
}

.welcome-card h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.desc {
  font-size: 16px;
  color: #666;
}

.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.function-card {
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.function-card:hover {
  transform: translateY(-5px);
}

.function-card h3 {
  margin: 15px 0 10px;
  color: #2c3e50;
}

.function-card p {
  color: #666;
}
</style>