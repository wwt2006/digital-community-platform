<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>用户登录</span>
          <el-button type="text" @click="$router.push('/register')">没有账号？去注册</el-button>
        </div>
      </template>
      
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

// 登录表单
const loginForm = ref({
  phone: '',
  password: ''
});

// 表单校验规则
const loginRules = ref({
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

// 处理登录
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    
    const res = await request.post('/login', loginForm.value);
    if (res.code === 200) {
      // 保存token和用户信息
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
      
      ElMessage.success('登录成功！');
      router.push('/');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error(err.msg || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>