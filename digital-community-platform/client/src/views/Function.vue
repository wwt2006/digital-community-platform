<template>
  <div class="function-page">
    <h2 class="page-title">核心功能列表</h2>
    
    <div class="function-list">
      <!-- 社区公告 -->
      <el-card class="function-item">
        <div class="function-header">
          <el-icon size="24"><Bell /></el-icon>
          <h3>社区公告</h3>
        </div>
        <div class="function-content">
          <p>查看社区最新通知、政策解读、活动预告</p>
          <el-button type="primary" size="small">查看更多</el-button>
        </div>
      </el-card>

      <!-- 活动报名 -->
      <el-card class="function-item">
        <div class="function-header">
          <el-icon size="24"><Calendar /></el-icon>
          <h3>活动报名</h3>
        </div>
        <div class="function-content">
          <p>报名社区公益活动、文化活动、体育活动</p>
          <el-button type="primary" size="small">立即报名</el-button>
        </div>
      </el-card>

      <!-- 志愿服务 -->
      <el-card class="function-item">
        <div class="function-header">
          <el-icon size="24"><Star /></el-icon>
          <h3>志愿服务</h3>
        </div>
        <div class="function-content">
          <p>参与社区志愿服务、查看服务时长、兑换奖励</p>
          <el-button type="primary" size="small">我要参与</el-button>
        </div>
      </el-card>

      <!-- 便民查询 -->
      <el-card class="function-item">
        <div class="function-header">
          <el-icon size="24"><Search /></el-icon>
          <h3>便民查询</h3>
        </div>
        <div class="function-content">
          <p>查询社保、医保、水电燃气、快递物流信息</p>
          <el-button type="primary" size="small">立即查询</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { Bell, Calendar, Star, Search } from '@element-plus/icons-vue';
</script>

<style scoped>
.function-page {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.function-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.function-item {
  padding: 20px;
}

.function-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.function-header h3 {
  margin-left: 10px;
  color: #2c3e50;
}

.function-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}
</style>