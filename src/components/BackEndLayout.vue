<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>
<template>
  <div class="backend-layout">
    <el-container class="main-container">
        <Sidebar></Sidebar>
      <el-container>
        <el-header>
          <Navbar></Navbar>
        </el-header>
        <el-main class="main-content">
          <div class="content-container">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>

.backend-layout {
    height: 100%;
    width: 100%;
    .main-container {
        height: 100%;
        width: 100%;
    }
    
}
.el-container {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.main-content {
        flex: 1;
        .content-container {
            padding: 20px;
            background-color: #fff;
            min-height: calc(100% - 74px);
        }
    }
</style>