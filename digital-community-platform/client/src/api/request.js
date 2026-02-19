import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端服务地址
  timeout: 5000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data; // 直接返回后端的json数据
  },
  error => {
    return Promise.reject(error);
  }
);

export default request;