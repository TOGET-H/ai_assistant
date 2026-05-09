import axios from 'axios';
import { ElMessage } from 'element-plus';

// axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (String(data?.code) === '200') {
      return data;
    }

    ElMessage.error(data?.message || data?.msg || '请求失败');
    return Promise.reject(new Error(data?.message || data?.msg || '请求失败'));
  },
  (error) => {
    console.error(error);
    ElMessage.error(error?.message || '网络异常，请稍后重试');
    return Promise.reject(error);
  }
);

export default service;
