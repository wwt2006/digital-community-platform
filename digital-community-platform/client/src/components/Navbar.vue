<template>
  <div class="navbar-wrapper">
    <!-- 平台标题行 -->
    <div class="navbar-title">生活新图景数字化平台</div>

    <!-- 功能栏行（等比例分布） -->
    <div class="navbar-menu-wrapper">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        class="navbar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="1" route="/">首页</el-menu-item>
        <el-menu-item index="2" route="/function">功能</el-menu-item>
        <el-menu-item index="3" route="/friend">好友</el-menu-item>
        <el-menu-item index="4" route="/forum">论坛</el-menu-item>
      </el-menu>

      <!-- 右上角：登录/个人中心/退出 -->
      <div class="navbar-right">
        <el-button
          v-if="!isLogin"
          type="primary"
          size="small"
          @click="goToLogin"
        >
          登录/注册
        </el-button>
        <template v-else>
          <el-button type="text" class="profile-btn" @click="goToProfile">
            <el-icon><User /></el-icon> 个人主页
          </el-button>
          <el-button type="text" class="logout-btn" @click="handleLogout">
            退出
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const isLogin = ref(false);
const activeIndex = ref('1');

// 监听路由变化，更新选中状态
watch(() => route.path, (newPath) => {
  const menuMap = {
    '/': '1',
    '/function': '2',
    '/friend': '3',
    '/forum': '4',
    '/profile': '5'
  };
  activeIndex.value = menuMap[newPath] || '1';
});

onMounted(() => {
  checkLoginStatus();
  // 初始化选中状态
  const menuMap = {
    '/': '1',
    '/function': '2',
    '/friend': '3',
    '/forum': '4',
    '/profile': '5'
  };
  activeIndex.value = menuMap[route.path] || '1';
});

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  isLogin.value = !!token;
};

const handleMenuSelect = (index) => {
  const pathMap = {
    '1': '/',
    '2': '/function',
    '3': '/friend',
    '4': '/forum'
  };
  if (pathMap[index]) {
    router.push(pathMap[index]);
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToProfile = () => {
  router.push('/profile');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  isLogin.value = false;
  ElMessage.success('退出登录成功！');
  router.push('/');
};
</script>

<style scoped>
.navbar-wrapper {
  background-color: #2c3e50;
  color: #fff;
  padding: 0 20px;
}

.navbar-title {
  font-size: 18px;
  font-weight: bold;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-menu-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-menu {
  flex: 1;
  background-color: transparent !important;
  border-bottom: none !important;
  display: flex;
}

/* 强制等比例分布 */
.navbar-menu .el-menu-item {
  color: #fff !important;
  height: 50px !important;
  line-height: 50px !important;
  flex: 1;
  text-align: center;
  border-bottom: 2px solid transparent !important;
  background-color: transparent !important;
}

/* 选中时只加白线，字体不变白 */
.navbar-menu .el-menu-item.is-active {
  border-bottom: 2px solid #fff !important;
  color: #fff !important;
  background-color: transparent !important;
}

/* 鼠标 hover 时也不改变背景 */
.navbar-menu .el-menu-item:hover {
  background-color: transparent !important;
  color: #fff !important;
}

.navbar-right {
  margin-left: 20px;
  display: flex;
  gap: 10px;
}

.profile-btn, .logout-btn {
  color: #fff !important;
}
</style>