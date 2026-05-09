<script setup>
import PageHead from '../components/pageHead.vue';
import TableSearch from '../components/TableSearch.vue';
import { categoryTree, articlePage, updateStatus , deleteArticle} from '../api/admin';
import { ref, onMounted, reactive } from 'vue';
import { Timer } from '@element-plus/icons-vue';
import ArticleDialog from '../components/ArticleDialog.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 分页参数
const pageParams = reactive({
  currentPage: 1,
  size: 10,
  total: 1,
});

const categoryMap = reactive({});
const categoryList = ref([]);
const tableData = ref([]);
const dialogVisible = ref(false);
const currentArticle = ref(null);
const formItem = ref([
  {
    comp: 'el-input',
    label: '文章标题',
    prop: 'title',
    placeholder: '请输入文章标题',
  },
  {
    comp: 'el-tree-select',
    label: '文章分类',
    prop: 'categoryId',
    placeholder: '请选择文章分类',
    options: [],
    props: { checkStrictly: true },
  },
  {
    comp: 'el-select',
    label: '文章状态',
    prop: 'status',
    placeholder: '请选择文章状态',
    options: [
      { label: '草稿', value: 0 },
      { label: '已发布', value: 1 },
      { label: '已删除', value: 2 },
    ],
  },
]);

const handleSearch = async (formData = {}) => {
  const params = {
    currentPage: pageParams.currentPage,
    size: pageParams.size,
    current: pageParams.currentPage,
    pageNum: pageParams.currentPage,
    pageSize: pageParams.size,
    ...formData,
  };

  try {
    const res = await articlePage(params);
    const realData = res?.data?.records
      ? res.data
      : (res?.data || res || {});
    const records = realData.records || realData.list || [];
    const total = realData.total || realData.count || 0;

    pageParams.total = Number(total);
    tableData.value = Array.isArray(records) ? records : [];
  } catch (error) {
    console.error('搜索失败:', error);
    pageParams.total = 0;
    tableData.value = [];
    ElMessage.error('获取文章列表失败');
  }
};

const handleReset = () => {
  console.log('重置搜索条件');
};

const changeArticleStatus = async (row, status) => {
  await updateStatus(row.id, { status });
  await handleSearch();
};

const handlePublish = (row) => {
  ElMessageBox.confirm('确定要发布这篇文章吗？', '发布确认', {
    confirmButtonText: '发布',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await changeArticleStatus(row, 1);
      ElMessage.success('发布成功');
    })
    .catch(() => {
      // 用户取消
    });
};

const handleUnPublish = (row) => {
  ElMessageBox.confirm('确定要下线这篇文章吗？', '下线确认', {
    confirmButtonText: '下线',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await changeArticleStatus(row, 2);
      ElMessage.success('下线成功');
    })
    .catch(() => {
      // 用户取消
    });
};

const handleChange = (val) => {
  pageParams.currentPage = val;
  handleSearch();
};

const handleCreate = () => {
  currentArticle.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  currentArticle.value = { ...row };
  dialogVisible.value = true;
};


const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这篇文章吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'danger',
  })
    .then(async () => {
      await deleteArticle(row.id);
      ElMessage.success('删除成功');
       handleSearch();
    })
    .catch(() => {
      // 用户取消
    });
};

const formatCategoryTree = (nodes) => {
  if (!nodes || nodes.length === 0) return [];

  return nodes.map((item) => {
    categoryMap[item.id] = item.categoryName;

    const formattedNode = {
      label: item.categoryName,
      value: item.id,
    };

    if (item.children && item.children.length > 0) {
      formattedNode.children = formatCategoryTree(item.children);
    }

    return formattedNode;
  });
};

onMounted(async () => {
  await handleSearch();

  try {
    const data = await categoryTree();
    const categoryData = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
    const formattedData = formatCategoryTree(categoryData);

    formItem.value[1].options = formattedData;
    categoryList.value = formattedData;
    console.log('分类树数据:', categoryList);
  } catch (error) {
    console.error('获取分类树失败:', error);
    formItem.value[1].options = [];
    categoryList.value = [];
  }
});
</script>

<template>
  <div class="knowledge">
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="primary">修改</el-button>
      </template>
    </PageHead>

    <TableSearch :formItem="formItem" @search="handleSearch" @reset="handleReset" />

    <el-table :data="tableData" style="width: 100%; margin-top: 20px">
      <el-table-column label="文章标题" min-width="200">
        <template #default="scope">
          <div
            style="display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          >
            <el-icon style="margin-right: 5px"><Timer /></el-icon>
            <span :title="scope.row.title" style="overflow: hidden; text-overflow: ellipsis">
              {{ scope.row.title }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="分类" min-width="140">
        <template #default="scope">
          {{ scope.row.categoryName || categoryMap[scope.row.categoryId] || '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="authorName" label="作者" min-width="120" />

      <el-table-column label="阅读量" min-width="100">
        <template #default="scope">
          {{ scope.row.readCount ?? scope.row.views ?? 0 }}
        </template>
      </el-table-column>

         <el-table-column label="发布时间" min-width="100">
        <template #default="scope">
          {{ scope.row.updatedAt || scope.row.createdAt || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button type="primary" text @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="success" v-if="scope.row.status === 0 ||scope.row.status === 2" text @click="handlePublish(scope.row)">发布</el-button>
          <el-button type="warning" v-if="scope.row.status === 1" text @click="handleUnPublish(scope.row)">下线</el-button>
          <el-button type="danger" text @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

        <!-- 分页 -->
        <el-pagination
        style="margin-top: 20px; display: flex; justify-content: flex-end"
    :page-size="pageParams.size"
    layout="total, prev, pager, next, jumper"
    :total="pageParams.total"
    @change = "handleChange"
    />

    <ArticleDialog v-model="dialogVisible" :categoryList="categoryList" :article-data="currentArticle" @success="handleSearch" />
  </div>
</template>
