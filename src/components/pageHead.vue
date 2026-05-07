
<script setup>
const props = defineProps({
    title: {
        type: String,
        default: '页面标题'
    }
});
</script>

<template>
    <div class="page-head">
        <h1 class="page-title">{{ props.title }}</h1>
            <div class="action-btn">
        <slot name="buttons"></slot>
    </div>
    </div>

</template>
<style lang="scss" scoped>
.page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    .page-title {
        font-size: 24px;
        font-weight: bold;
        color: #1f2937;
    }
}
.action-btn {
    display: flex;
    justify-content: flex-end;
}
</style>
