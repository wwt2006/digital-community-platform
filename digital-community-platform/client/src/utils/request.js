import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
});

// 请求拦截器：添加token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('请求错误：', error);
    return Promise.reject(error.response?.data || { msg: '网络错误' });
  }
);

export default request;