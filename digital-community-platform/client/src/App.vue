<template>
  <div id="app">
    <!-- 顶部导航栏（所有页面必须显示） -->
    <Navbar />
    <!-- 页面内容区域 -->
    <el-main class="app-main">
      <router-view></router-view>
    </el-main>
  </div>
</template>

<script setup>
// 必须引入导航栏组件
import Navbar from './components/Navbar.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
}
</style>