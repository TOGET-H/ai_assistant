<script setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router'   
import { useAdminStore } from '../stores/admin';
import logoUrl from '../assets/images/logo.png'

const router = useRouter()  
console.log(router);


const SelectMenu = (path) => {
  const currentPath = router.options.routes[0].path
  const fullPath = `${currentPath}/${path}`
  console.log(fullPath);
  
  router.push(fullPath)
}

const isCollapse = computed(() => useAdminStore().iscollapse)



</script>
<template>
 <el-menu
        :collapse="isCollapse"
        :collapse-transition="false"
        default-active="2"
        class="menu-style"
      >
      <div class="brand">
        <el-image :src="logoUrl" alt="logo" class="brand-image" />
        <div v-show="!isCollapse" class="info-card">
            <h1 class="brand-title">AI心理健康智能助手</h1>
            <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
        <el-menu-item   @click="SelectMenu(item.path)" v-for="item in router.options.routes[0].children" :key="item.name" :index="item.path" >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta.title }}</span>
        </el-menu-item>
    
      </el-menu>
</template>

<style lang="scss" scoped>
.menu-style {
  height: 100%;
  
  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    
    .brand-image {
      width: 50px;
      height: 50px;
      margin-right: 10px;
      border-radius: 8px;
    }
    
    .info-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .brand-title {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
      }
      
      .brand-subtitle {
        font-size: 11px;
        margin: 0;
      }
    }
  }
}
</style>