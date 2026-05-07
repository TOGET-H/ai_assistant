<template>
    <div class="auth-layout">
        <div class="left-section">
            <div class="content">
                <h2 class="title">心理AI助手</h2>
                <p class="text">关注心理健康，从心开始</p>
                <div class="robot">
                    <el-image :src="robotImage" style="width: 100px; height: 100px" fit="contain" />
                </div>
            </div>
        </div>
        <div class="right-section">
            <router-view></router-view>
        </div>

    </div>
    
</template>

<script setup>
import robotImage from '../assets/images/robot-fill.png'
</script>

<style scoped>
.auth-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.left-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    background: linear-gradient(135deg, #667eea 50%, #764ba2 100%);
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.title {
    margin-bottom: 20px;
    font-size: 40px;
    font-weight: bold;
    color: #fff;
}

.text {
    margin-bottom: 30px;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
}

.robot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.right-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    background-color: #fff;
    overflow-y: auto;
}
</style>