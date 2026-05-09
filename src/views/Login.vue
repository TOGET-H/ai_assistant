<template>
    <div class="login-page">
        <div class="background-effects">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>
        <div class="container">
            <div class="title">
                <div class="back-home">
                    <el-icon><Back /></el-icon>
                    <span >返回首页</span>
                </div>
                <div class="login-title">
                    <h2>欢迎回来</h2>
                    <p>请登录您的账户继续</p>
                </div>
            </div>
            <div class="form-container">
                <el-form
                 ref="ruleFormRef"
                 :model="formData"
                 :rules="rules"
                 label-position="top"
                 size="large"
                >
                    <el-form-item prop="username">
                        <template #label>
                            <span class="form-label">用户名</span>
                        </template>
                        <el-input
                            v-model="formData.username"
                            placeholder="请输入用户名"
                            :prefix-icon="User"
                            clearable
                        />
                    </el-form-item>
                    <el-form-item prop="password">
                        <template #label>
                            <span class="form-label">密码</span>
                        </template>
                        <el-input
                            v-model="formData.password"
                            type="password"
                            placeholder="请输入密码"
                            :prefix-icon="Lock"
                            show-password
                            clearable
                        />
                    </el-form-item>
                    <div class="form-options">
                        <!-- <el-checkbox v-model="rememberMe">记住我</el-checkbox> -->
                    </div>
                    <el-form-item>
                        <el-button type="primary" class="login-button" @click="submitForm">
                            登 录
                        </el-button>
                    </el-form-item>
                    <div class="register-link">
                        <span>还没有账户？</span>
                        <router-link to="/auth/register">立即注册</router-link>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { login } from '../api/admin';
import { useRouter } from 'vue-router';
const router = useRouter();
const ruleFormRef = ref();
const formData = ref({
    username: '',
    password: ''
});
const rememberMe = ref(false);

const submitForm = () => {
    ruleFormRef.value.validate((valid) => {
        if (valid) {
            console.log('表单验证成功');
            login(formData.value).then(response => {
                // 注意：如果你的 api 已经拦截并返回了 data，这里直接用 response 即可。
                // 如果是原生的 axios 响应，数据通常在 response.data 里。
                // 这里假设你需要从 response 中取 data：
                const data = response.data || response; 
                
                console.log('后端返回的数据:', data);
                
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
                    
                    // 根据角色跳转
                    if (data.userInfo.userType === 2) {
                        router.push('/back/dashboard');
                    } else {
                        router.push('/');
                    }
                } else {
                    console.error('登录失败: 未返回token');
                    // 处理登录失败的逻辑，例如显示错误消息等
                }
            }).catch(error => {
                console.error('登录失败:', error);
                // 处理登录失败的逻辑，例如显示错误消息等
            });
        } else {
            console.log('表单验证失败');
            return false;
        }
    });
}

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
    ]
}
</script>

<style scoped>
.login-page {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-effects {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.circle-1 {
    width: 300px;
    height: 300px;
    top: -100px;
    right: -100px;
    animation-delay: 0s;
}

.circle-2 {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: -50px;
    animation-delay: 2s;
}

.circle-3 {
    width: 150px;
    height: 150px;
    bottom: 20%;
    right: 10%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

.container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 420px;
    padding: 20px;
}

.title {
    text-align: center;
    margin-bottom: 30px;
}

.back-home {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    transition: all 0.3s ease;
}

.back-home:hover {
    color: #fff;
    transform: translateX(-5px);
}

.back-home span {
    margin-left: 6px;
}

.login-title h2 {
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-title p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
}

.form-container {
    width: 100%;
    background: #fff;
    padding: 40px 35px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-label {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
}

:deep(.el-form-item) {
    margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
    padding: 12px 16px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e5e7eb inset;
    transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #667eea inset !important;
}

:deep(.el-input__inner) {
    font-size: 15px;
}

:deep(.el-input__prefix) {
    color: #9ca3af;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

:deep(.el-checkbox__label) {
    color: #6b7280;
    font-size: 14px;
}

.login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.login-button:active {
    transform: translateY(0);
}

.register-link {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
    color: #6b7280;
}

.register-link a {
    color: #667eea;
    font-weight: 500;
    margin-left: 5px;
    transition: color 0.3s ease;
}

.register-link a:hover {
    color: #764ba2;
    text-decoration: underline;
}
</style>