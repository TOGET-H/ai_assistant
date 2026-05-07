import axios from "axios";
import router from "../router";

//axios实例
const service = axios.create({
  baseURL: '/api', // api的base_url
  timeout: 5000 // 请求超时时间
});

//请求拦截器
service.interceptors.request.use(
  config => {
    //在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] =token; //将token添加到请求头中
    }
    return config;
  }
    ,error => {
    //对请求错误做些什么
    console.log(error);
    return Promise.reject(error);
  }
);
//响应拦截器
service.interceptors.response.use(
  response => {
    //对响应数据做点什么
    const{data,config} = response;
    if(data.code ==='200'){
        return response.data;
    }
    else{
    if(data.code === '-1'){
      if(!config.url.includes('/login')){
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        ElementUI.Message.error('登录过期，请重新登录');
        window.location.href = '/auth/login';
      }
    }else{
        ElementUI.Message.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message || '请求失败'));
    }
    
  }
}
    ,error => {
    //对响应错误做点什么
    console.log(error);
    return Promise.reject(error);
  }

);
export default service;