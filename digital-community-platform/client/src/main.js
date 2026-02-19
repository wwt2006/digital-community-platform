import { createApp } from 'vue';
import ElementPlus from 'element-plus'; // 引入Element Plus
import 'element-plus/dist/index.css'; // 引入Element Plus样式
import App from './App.vue';
import router from './router'; // 引入路由
import request from './api/request'; // 引入封装的axios

// 创建Vue应用
const app = createApp(App);

// 全局挂载axios，所有页面可通过 this.$http 调用
app.config.globalProperties.$http = request;

// 挂载插件
app.use(ElementPlus);
app.use(router);

// 挂载到页面
app.mount('#app');