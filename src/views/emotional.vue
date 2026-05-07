<template>
  <div class="emotional">
    <PageHead title="情绪分析" />
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="记录ID" width="100" />
      <el-table-column prop="userId" label="用户ID" width="120" />
      <el-table-column prop="diaryDate" label="日记日期" width="120" />
      <el-table-column prop="moodScore" label="情绪评分" width="180">
        <template #default="scope">
          <el-rate v-model="scope.row.moodScore" disabled :max="10"></el-rate>
        </template>
      </el-table-column>
      <el-table-column prop="moodScore" label="生活指标" width="180">
        <template #default="scope">
          <div>
            <p>睡眠：{{ scope.row.sleepQuality }}/5</p>
            <p>压力：{{ scope.row.stressLevel }}/5</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="dominantEmotion" label="主导情绪" width="120" />
      <el-table-column prop="emotionTriggers" label="情绪触发因素" width="180" />
      <el-table-column prop="diaryContentPreview" label="日记内容" min-width="180" show-overflow-tooltip />

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button type="primary" text @click="handleEdit(scope.row)">详情</el-button>
          <el-button type="danger" text @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 20px; display: flex; justify-content: flex-end"
      :page-size="pageParams.size"
      layout="total, prev, pager, next, jumper"
      :total="pageParams.total"
      @change="handleChange"
    />

    <emotionDialog v-model="detailDialogVisible" :detail="currentDetail" :ai-data="aiData" />
  </div>
</template>
<script setup>
import PageHead from '../components/pageHead.vue';
import TableSearch from '../components/TableSearch.vue';
import emotionDialog from '../components/emotionDialog.vue';
import { getEmotionalData, deleteEmotionalData } from '../api/admin';
import { onMounted, ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const tableData = ref([]);
const formItem = [
  { comp: 'el-input', label: '用户ID', prop: 'userId', placeholder: '请输入用户ID' },
  {
    comp: 'el-select',
    label: '情绪分数',
    prop: 'moodScore',
    placeholder: '请选择情绪分数',
    options: [
      { label: '低分（1-3）', value: '1-3' },
      { label: '中分（4-6）', value: '4-6' },
      { label: '高分（7-10）', value: '7-10' }
    ]
  }
];

const pageParams = reactive({
  currentPage: 1,
  size: 10,
  total: 0
});

const detailDialogVisible = ref(false);
const currentDetail = ref(null);
const aiData = ref(null);

const parseJsonSafe = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const handleEdit = (row) => {
  currentDetail.value = row;
  aiData.value = parseJsonSafe(row?.aiEmotionAnalysis);
  detailDialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await deleteEmotionalData(row.id);
      tableData.value = tableData.value.filter((item) => item !== row);
      ElMessage.success('删除成功');
    }).catch(() => {
      // 取消删除
    });
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const handleChange = (val) => {
  pageParams.currentPage = val;
  handleSearch();
};

const handleSearch = async (formData = {}) => {
  const params = {
    ...pageParams,
    ...formData
  };

  try {
    const res = await getEmotionalData(params);
    const realData = res.data || res;
    const records = realData.records || [];
    const total = realData.total || 0;

    pageParams.total = Number(total);
    tableData.value = records;
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

onMounted(() => {
  handleSearch();
});
</script>
