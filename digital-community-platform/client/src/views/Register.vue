<template>
  <div class="register-page">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <span>用户注册</span>
          <el-button type="text" @click="$router.push('/login')">已有账号？去登录</el-button>
        </div>
      </template>
      
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="registerForm.checkPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        
        <el-form-item label="所在地区">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-select v-model="registerForm.province" placeholder="省份">
                <el-option label="北京市" value="北京市"></el-option>
                <el-option label="上海市" value="上海市"></el-option>
                <el-option label="广东省" value="广东省"></el-option>
                <el-option label="浙江省" value="浙江省"></el-option>
                <el-option label="江苏省" value="江苏省"></el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-select v-model="registerForm.city" placeholder="城市">
                <el-option label="北京市" value="北京市"></el-option>
                <el-option label="上海市" value="上海市"></el-option>
                <el-option label="广州市" value="广州市"></el-option>
                <el-option label="深圳市" value="深圳市"></el-option>
                <el-option label="杭州市" value="杭州市"></el-option>
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" style="width: 100%;" :loading="loading">注册</el-button>
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
const registerFormRef = ref(null);
const loading = ref(false);

// 注册表单
const registerForm = ref({
  phone: '',
  password: '',
  checkPassword: '',
  nickname: '',
  province: '',
  city: ''
});

// 表单校验规则
const registerRules = ref({
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== registerForm.value.password) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
});

// 处理注册
const handleRegister = async () => {
  try {
    await registerFormRef.value.validate();
    loading.value = true;
    
    const res = await request.post('/register', {
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      nickname: registerForm.value.nickname,
      province: registerForm.value.province,
      city: registerForm.value.city
    });
    
    if (res.code === 200) {
      ElMessage.success('注册成功！请登录');
      router.push('/login');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error(err.msg || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
}

.register-card {
  width: 500px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>