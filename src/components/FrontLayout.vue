<template>
  <div class="frontend-layout">
    <header class="navbar-wrapper">
      <div class="navbar-container">
        <div class="brand-section">
          <img class="brand-logo" :src="robotFill" alt="心理健康AI助手" />
          <h1 class="brand-name">心理健康AI助手</h1>
        </div>

        <nav class="nav-section">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/consulation" class="nav-link" v-if="isLogin">AI咨询</router-link>
          <router-link to="/emotional-diary" class="nav-link" v-if="isLogin">情绪日记</router-link>
          <router-link to="/knowledge" class="nav-link">知识库</router-link>
          <el-button size="small" @click="handleLogin">
            {{ isLogin ? '退出登录' : '登录' }}
          </el-button>
          <el-button size="small" @click="handleRegister" v-if="!isLogin">注册</el-button>
        </nav>
      </div>
    </header>

    <main class="main-container">
      <router-view />
    </main>

    <footer class="footer-container">
      <div class="footer-bottom">&copy; 2026 心理健康AI助手. All rights reserved.</div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import robotFill from '../assets/images/logo.png';

const router = useRouter();
const isLogin = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  isLogin.value = !!token;
});

const handleLogin = () => {
  if (isLogin.value) {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    isLogin.value = false;
    router.push('/auth/login');
  } else {
    router.push('/auth/login');
  }
};

const handleRegister = () => {
  router.push('/auth/register');
};
</script>

<style lang="scss" scoped>
.frontend-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.navbar-wrapper {
  border-bottom: 1px solid #e5e7eb;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.brand-logo {
  width: 50px;
  height: 50px;
  display: block;
}

.brand-name {
  margin: 0 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #4b5563;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
}

.nav-link:hover {
  color: #4a90e2;
}

.main-container {
  flex: 1;
}

.footer-container {
  background: #1f2937;
  color: #fff;
  padding: 15px 0;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;
}
</style>
