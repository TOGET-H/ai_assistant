<script setup>
import { computed } from 'vue';
import { Expand, ArrowDown } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAdminStore } from '../stores/admin';
import { logOut } from '../api/admin';
import userAvatar from '../assets/images/user.jpg';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const pageTitle = computed(() => route.meta?.title || '后台管理');

const userName = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo.nickname || userInfo.username || '用户';
  } catch {
    return '用户';
  }
});

const handleCollapse = () => {
  adminStore.toggleCollapse();
};

const handleCommand = async (command) => {
  if (command === 'profile' || command === 'settings') {
    ElMessage.info('功能开发中');
    return;
  }

  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });

      await logOut();
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      ElMessage.success('退出登录成功');
      router.push('/auth/login');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('退出登录失败:', error);
        ElMessage.error('退出登录失败');
      }
    }
  }
};
</script>

<template>
  <div class="navbar">
    <div class="flex-box left-side">
      <el-button @click="handleCollapse" text>
        <el-icon><Expand /></el-icon>
      </el-button>
      <p class="page-title">{{ pageTitle }}</p>
    </div>

    <div class="flex-box right-side">
      <el-dropdown @command="handleCommand">
        <div class="user-trigger">
          <el-avatar :size="32" :src="userAvatar" />
          <span class="user-name">{{ userName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人资料</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.flex-box {
  display: flex;
  align-items: center;
}

.left-side {
  .page-title {
    margin-left: 16px;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }
}

.user-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  .user-name {
    margin: 0 8px;
    font-weight: 600;
    color: #374151;
  }
}
</style>
