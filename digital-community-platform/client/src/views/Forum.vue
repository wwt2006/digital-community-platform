<template>
  <div class="forum-page">
    <h2 class="page-title">社区论坛</h2>

    <!-- 分类标签 -->
    <el-tabs v-model="activeTab" class="forum-tabs">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="生活分享" name="life"></el-tab-pane>
      <el-tab-pane label="社区公告" name="notice"></el-tab-pane>
      <el-tab-pane label="求助问答" name="help"></el-tab-pane>
      <el-tab-pane label="活动招募" name="activity"></el-tab-pane>
    </el-tabs>

    <!-- 发布帖子按钮 -->
    <el-button type="primary" class="publish-btn" @click="publishPost">
      <el-icon><Pen /></el-icon> 发布帖子
    </el-button>

    <!-- 帖子列表 -->
    <el-card class="post-list-card" v-for="post in postList" :key="post.id">
      <div class="post-header">
        <el-avatar :src="post.authorAvatar"></el-avatar>
        <div class="post-author">
          <h4>{{ post.authorName }}</h4>
          <p>{{ post.createTime }}</p>
        </div>
      </div>
      <div class="post-content">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-desc">{{ post.content }}</p>
      </div>
      <div class="post-footer">
        <el-button size="small" type="text"><el-icon><Thumb /></el-icon> {{ post.likes }} 点赞</el-button>
        <el-button size="small" type="text"><el-icon><ChatDotRound /></el-icon> {{ post.comments }} 评论</el-button>
        <el-button size="small" type="text"><el-icon><Share /></el-icon> 分享</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Pen, Thumb, ChatDotRound, Share } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 激活的标签
const activeTab = ref('all');

// 模拟帖子列表
const postList = ref([
  {
    id: 1,
    authorName: '张三',
    authorAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createTime: '2026-02-14 10:00',
    title: '社区周末公益植树活动，欢迎报名！',
    content: '本周末上午9点，社区将组织公益植树活动，地点在社区公园，有意向的居民可以报名参加，一起为社区添绿！',
    likes: 56,
    comments: 12
  },
  {
    id: 2,
    authorName: '李四',
    authorAvatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a5494058f5063c01jpeg.png',
    createTime: '2026-02-13 15:30',
    title: '求助：家里的水管漏水了，求推荐靠谱的维修师傅',
    content: '家里的水管突然漏水了，物业暂时没人，求邻居推荐靠谱的维修师傅，在线等，挺急的！',
    likes: 28,
    comments: 35
  },
  {
    id: 3,
    authorName: '王五',
    authorAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createTime: '2026-02-12 08:45',
    title: '分享一下我做的社区美食，欢迎大家品尝',
    content: '昨天做了一些手工包子，味道还不错，有需要的邻居可以来我家尝尝，顺便交流一下厨艺～',
    likes: 89,
    comments: 42
  }
]);

// 发布帖子
const publishPost = () => {
  ElMessage.info('发布帖子功能开发中，敬请期待！');
};
</script>

<style scoped>
.forum-page {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.forum-tabs {
  margin-bottom: 20px;
}

.publish-btn {
  margin-bottom: 20px;
}

.post-list-card {
  margin-bottom: 20px;
  padding: 20px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.post-author {
  margin-left: 10px;
}

.post-author h4 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.post-author p {
  font-size: 12px;
  color: #666;
}

.post-title {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.post-desc {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-footer {
  display: flex;
  gap: 20px;
  color: #666;
}
</style>