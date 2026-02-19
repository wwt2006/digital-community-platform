<template>
  <div class="forum-page">
    <div class="forum-header">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="推荐" name="recommend" />
        <el-tab-pane label="关注" name="follow" />
        <el-tab-pane label="最新" name="latest" />
      </el-tabs>
      
      <div class="forum-actions">
        <el-dropdown trigger="click" @command="handleMyAction">
          <span class="my-btn">我的</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="myPosts">我发表的帖子</el-dropdown-item>
              <el-dropdown-item command="myLikes">我点赞的帖子</el-dropdown-item>
              <el-dropdown-item command="myReplies">别人回复我的帖子</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button type="primary" @click="showPublishDialog = true">发布帖子</el-button>
      </div>
    </div>
    
    <div class="post-list">
      <el-card v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-header">
          <el-avatar :size="32" :src="post.avatar" />
          <div class="author-info">
            <span class="author-name">{{ post.isAnonymous ? '匿名用户' : post.authorName }}</span>
            <span class="post-time">{{ formatTime(post.createTime) }}</span>
          </div>
        </div>
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-desc">{{ post.content }}</p>
          <div class="post-tags">
            <el-tag v-for="tag in post.tags" :key="tag" size="small" class="tag">{{ tag }}</el-tag>
          </div>
        </div>
        <div class="post-actions">
          <el-button type="link" @click="handleLike(post.id)">
            {{ post.likes }} 点赞
          </el-button>
          <el-button type="link" @click="openReplyDialog(post.id)">
            <el-icon><ChatDotRound /></el-icon> {{ post.replyCount }} 评论
          </el-button>
          <el-button type="link">
            <el-icon><Share /></el-icon> 分享
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 发布帖子弹窗 -->
    <el-dialog v-model="showPublishDialog" title="发布帖子" width="600px">
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="publishForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="publishForm.content" placeholder="分享你的想法..." rows="6" />
        </el-form-item>
        <el-form-item label="话题">
          <el-select v-model="publishForm.topic" placeholder="选择话题">
            <el-option label="综合讨论" value="综合" />
            <el-option label="热点资讯" value="热点" />
            <el-option label="同城生活" value="同城" />
          </el-select>
        </el-form-item>
        <el-form-item label="匿名发布">
          <el-switch v-model="publishForm.isAnonymous" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </template>
    </el-dialog>
    
    <!-- 回复弹窗 -->
    <el-dialog v-model="showReplyDialog" title="回复帖子" width="500px">
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input type="textarea" v-model="replyForm.content" placeholder="输入回复内容..." rows="4" />
        </el-form-item>
        <el-form-item label="匿名回复">
          <el-switch v-model="replyForm.isAnonymous" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleReply">回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Share } from '@element-plus/icons-vue'
import axios from 'axios'

const activeTab = ref('recommend')
const showPublishDialog = ref(false)
const currentPostId = ref(null)

const publishForm = ref({
  title: '',
  content: '',
  topic: '',
  isAnonymous: false
})

const replyForm = ref({
  content: '',
  isAnonymous: false
})

const posts = ref([])
const filteredPosts = computed(() => {
  // 根据 activeTab 过滤帖子
  if (activeTab.value === 'recommend') {
    return posts.value
  } else if (activeTab.value === 'follow') {
    return posts.value.filter(post => post.isFollowed)
  } else if (activeTab.value === 'latest') {
    return [...posts.value].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  }
  return posts.value
})

const formatTime = (time) => {
  if (!time) return '未知'
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const fetchPosts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/forum/post/list')
    if (res.data.code === 200) {
      posts.value = res.data.data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorName: post.author_name,
        avatar: post.avatar || '',
        isAnonymous: post.is_anonymous === 1,
        tags: post.tags ? post.tags.split(',') : [],
        likes: post.likes,
        replyCount: post.reply_count,
        createTime: post.create_time,
        isFollowed: post.is_followed === 1
      }))
    }
  } catch (err) {
    console.error('获取帖子列表失败', err)
    ElMessage.error('获取帖子列表失败')
  }
}

const handleTabClick = (tab) => {
  // 切换标签页时重新加载帖子
  fetchPosts()
}

const handleMyAction = (cmd) => {
  switch (cmd) {
    case 'myPosts':
      fetchMyPosts()
      break
    case 'myLikes':
      fetchMyLikes()
      break
    case 'myReplies':
      fetchMyReplies()
      break
  }
}

const fetchMyPosts = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.get('http://localhost:3000/forum/post/my', {
      params: { userId }
    })
    if (res.data.code === 200) {
      posts.value = res.data.data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorName: post.author_name,
        avatar: post.avatar || '',
        isAnonymous: post.is_anonymous === 1,
        tags: post.tags ? post.tags.split(',') : [],
        likes: post.likes,
        replyCount: post.reply_count,
        createTime: post.create_time,
        isFollowed: post.is_followed === 1
      }))
    }
  } catch (err) {
    console.error('获取我的帖子失败', err)
    ElMessage.error('获取我的帖子失败')
  }
}

const fetchMyLikes = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.get('http://localhost:3000/forum/like/my', {
      params: { userId }
    })
    if (res.data.code === 200) {
      posts.value = res.data.data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorName: post.author_name,
        avatar: post.avatar || '',
        isAnonymous: post.is_anonymous === 1,
        tags: post.tags ? post.tags.split(',') : [],
        likes: post.likes,
        replyCount: post.reply_count,
        createTime: post.create_time,
        isFollowed: post.is_followed === 1
      }))
    }
  } catch (err) {
    console.error('获取我点赞的帖子失败', err)
    ElMessage.error('获取我点赞的帖子失败')
  }
}

const fetchMyReplies = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.get('http://localhost:3000/forum/reply/my', {
      params: { userId }
    })
    if (res.data.code === 200) {
      posts.value = res.data.data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorName: post.author_name,
        avatar: post.avatar || '',
        isAnonymous: post.is_anonymous === 1,
        tags: post.tags ? post.tags.split(',') : [],
        likes: post.likes,
        replyCount: post.reply_count,
        createTime: post.create_time,
        isFollowed: post.is_followed === 1
      }))
    }
  } catch (err) {
    console.error('获取别人回复我的帖子失败', err)
    ElMessage.error('获取别人回复我的帖子失败')
  }
}

const handleLike = async (postId) => {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.post('http://localhost:3000/forum/post/like', {
      postId,
      userId
    })
    if (res.data.code === 200) {
      ElMessage.success('点赞成功')
      // 更新本地点赞数
      const post = posts.value.find(p => p.id === postId)
      if (post) post.likes++
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (err) {
    console.error('点赞失败', err)
    ElMessage.error('点赞失败')
  }
}

const openReplyDialog = (postId) => {
  currentPostId.value = postId
  replyForm.value = { content: '', isAnonymous: false }
  showReplyDialog.value = true
}

const handleReply = async () => {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.post('http://localhost:3000/forum/post/reply', {
      postId: currentPostId.value,
      userId,
      content: replyForm.value.content.trim(),
      isAnonymous: replyForm.value.isAnonymous ? 1 : 0
    })
    if (res.data.code === 200) {
      ElMessage.success('回复成功')
      showReplyDialog.value = false
      // 更新本地回复数
      const post = posts.value.find(p => p.id === currentPostId.value)
      if (post) post.replyCount++
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (err) {
    console.error('回复失败', err)
    ElMessage.error('回复失败')
  }
}

const handlePublish = async () => {
  if (!publishForm.value.title.trim() || !publishForm.value.content.trim()) {
    ElMessage.warning('请输入标题和内容')
    return
  }
  
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo')).id
    const res = await axios.post('http://localhost:3000/forum/post/publish', {
      userId,
      title: publishForm.value.title.trim(),
      content: publishForm.value.content.trim(),
      topic: publishForm.value.topic,
      isAnonymous: publishForm.value.isAnonymous ? 1 : 0
    })
    if (res.data.code === 200) {
      ElMessage.success('发布成功')
      showPublishDialog.value = false
      // 刷新帖子列表
      fetchPosts()
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (err) {
    console.error('发布失败', err)
    ElMessage.error('发布失败')
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.forum-page {
  padding: 20px;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forum-actions {
  display: flex;
  gap: 10px;
}

.my-btn {
  cursor: pointer;
  color: #666;
  padding: 0 10px;
}

.my-btn:hover {
  color: #409eff;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.author-info {
  margin-left: 10px;
}

.author-name {
  display: block;
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-title {
  margin: 0 0 10px 0;
  color: #2563eb;
  font-size: 18px;
}

.post-desc {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.post-tags {
  margin-bottom: 15px;
}

.tag {
  margin-right: 5px;
}

.post-actions {
  display: flex;
  gap: 20px;
  color: #666;
}
</style>