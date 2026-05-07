<template>
  <el-form ref="ruleFo">
    <el-row>
      <!-- 循环 + 每一项用 el-col 布局 -->
      <el-col
        v-for="item in formItem"
        :key="item.prop"
        v-bind="item.col || { xs: 24, sm: 12, md: 8, lg: 6, xl: 4 }" 
      >
        <!-- 👆 修改 1：直接在模板里设置默认布局，避免修改 props -->
        
        <el-form-item :label="item.label" :prop="item.prop">
          
          <!-- 分支 1：如果是普通下拉框 el-select -->
          <template v-if="item.comp === 'el-select'">
            <el-select 
              v-model="FormData[item.prop]" 
              v-bind="item" 
              style="width: 200px"
            >
              <el-option 
                v-for="opt in item.options" 
                :key="opt.value" 
                :label="opt.label" 
                :value="opt.value" 
              />
            </el-select>
          </template>

          <!-- 分支 2：如果是树形下拉框 el-tree-select -->
          <template v-else-if="item.comp === 'el-tree-select'">
            <el-tree-select 
              v-model="FormData[item.prop]" 
              v-bind="item" 
              :data="item.options" 
              style="width: 200px"
            />
            <!-- 👆 注意这里巧妙地把 item.options 赋值给了 :data -->
          </template>

          <!-- 分支 3：如果是普通的 el-input 等其他组件 -->
          <template v-else>
            <component
              :is="item.comp"
              v-bind="item"
              v-model="FormData[item.prop]"
              style="width: 200px"
            />
          </template>

        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

  <div class="button-group">
    <el-button type="primary" @click="handleSearch">搜索</el-button>
    <el-button @click="handleReset">重置</el-button>
  </div>
</template>

<script setup>
import { defineProps, reactive, defineEmits, watch } from 'vue'

const emit = defineEmits(['search', 'reset'])
const FormData = reactive({})

const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  }
})

// 监听配置变化 → 自动初始化表单
watch(
  () => props.formItem,
  (val) => {
    val.forEach((item) => {
      // 删除了修改 item.col 的逻辑，移到了模板的 v-bind 中处理
      // 只保留初始化表单值的逻辑
      if (FormData[item.prop] === undefined) {
        FormData[item.prop] = ''
      }
    })
  },
  { immediate: true }
)

// 搜索
const handleSearch = () => {
  emit('search', FormData)
}

// 重置
const handleReset = () => {
  props.formItem.forEach((item) => {
    FormData[item.prop] = ''
  })
  emit('reset')
  emit('search', FormData) // 通常重置后会自动触发一次全新搜索
}
</script>