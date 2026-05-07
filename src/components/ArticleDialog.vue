<template>
  <el-dialog
    title="文章详情"
    :model-value="props.modelValue"
    width="50%"
    @update:model-value="onDialogModelUpdate"
    @close="handleClose"
  >
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" label="文章标题" placeholder="请输入文章标题" />
    </el-form-item>
    <el-form-item label="文章分类" prop="categoryId">
        <el-tree-select
            v-model="formData.categoryId"
            :data="props.categoryList"
            :props="{ children: 'children', label: 'label', value: 'value' }"
            placeholder="请选择文章分类"
            style="width: 100%"
        />
    </el-form-item>
    <el-form-item label="文章摘要" prop="summary">
        <el-input type="textarea" v-model="formData.summary" label="文章摘要" placeholder="请输入文章摘要" maxlength="200" show-word-limit style="width: 100% " />
    </el-form-item>
    <el-form-item label="文章标签" prop="tags">
    <el-select v-model="formData.tagArray" label="文章标签" placeholder="请输入文章标签，多个标签用逗号分隔"  multiple  filterable allow-create style="width: 100%">
        <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
        />
    </el-select>
        
</el-form-item>
<!-- 上传封面图 -->
<el-form-item label="封面图" prop="coverImage">
    <el-upload
        v-model:file-list="coverFileList"
        action="#"
        :before-upload="beforeUpload"
        :http-request="handelUploadRequest"
        accept="image/*"
        list-type="picture-card"
        :limit="1"
    >
        <div v-if="coverFileList.length === 0" class="cover-upload-trigger">
            <span>点击上传封面</span>
        </div>
    </el-upload>
</el-form-item>
    <el-form-item label="文章内容" prop="content">
        <RichTextEditor 
        v-model="formData.content" 
        :maxCharCount = "5000"
        @change="handelContentChange"
        @created="handelContentCreated"
        min-height="400px"
        />
    </el-form-item>
  </el-form>

    <template #footer>
      <div class="dialog-footer">
        <!-- <el-button @click="handlePreview">内容预览</el-button> -->
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, reactive, defineEmits, ref, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {uploadFile,createArticle,updateArticle} from '../api/admin';
import { fileBaseUrl } from '../config';
import RichTextEditor from '@/components/RichTextEditor.vue';
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
    categoryList: {
        type: Array,
        default: () => [],
    },
    articleData: {
      type: Object,
      default: null,
    },
});

const formRef = ref(null);
const coverFileList = ref([]);
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
  ],
  categoryId: [
    { required: true, message: '请选择所属分类', trigger: 'change' },
  ],
  content: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const plain = String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim();
        if (!plain) {
          callback(new Error('请输入文章内容'));
          return;
        }
        callback();
      },
      trigger: 'change',
    },
  ],
};
const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

const formData = reactive({
    "title": "",
    "content": "",
    "coverImage": "",
    "categoryId": "",
    "summary": "",
    "tags": "",
    "tagArray": [],
    "id": ""
});

const emit = defineEmits(['update:modelValue', 'success']);

const resetFormData = () => {
  formData.title = '';
  formData.content = '';
  formData.coverImage = '';
  formData.categoryId = '';
  formData.summary = '';
  formData.tags = '';
  formData.tagArray = [];
  formData.id = '';
  coverFileList.value = [];
};

const fillFormData = (article) => {
  if (!article) {
    resetFormData();
    return;
  }

  formData.title = article.title || '';
  formData.content = article.content || '';
  formData.coverImage = article.coverImage || '';
  formData.categoryId = article.categoryId ?? '';
  formData.summary = article.summary || '';
  formData.tags = article.tags || '';
  formData.tagArray = Array.isArray(article.tagArray)
    ? article.tagArray
    : (article.tags ? String(article.tags).split(',').map((tag) => tag.trim()).filter(Boolean) : []);
  formData.id = article.id || '';

  if (formData.coverImage) {
    const normalizedBase = String(fileBaseUrl || '').replace(/\/$/, '');
    const previewUrl = String(formData.coverImage).startsWith('http')
      ? String(formData.coverImage)
      : `${normalizedBase}/${String(formData.coverImage).replace(/^\/+/, '')}`;
    coverFileList.value = [
      {
        name: '封面图',
        url: previewUrl,
        status: 'success',
      },
    ];
  } else {
    coverFileList.value = [];
  }

  nextTick(() => {
    if (editorInstance.value && formData.content) {
      editorInstance.value.setHtml(formData.content);
    }
  });
};

const onDialogModelUpdate = (val) => {
  emit('update:modelValue', val);
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;
    fillFormData(props.articleData);
    formRef.value?.clearValidate();
  }
);

const beforeUpload = (file) => {
    // 这里可以添加对文件的验证，例如限制文件类型和大小
    const isImage = file.type.startsWith('image/');
    const isLt4M = file.size / 1024 / 1024 < 4;

    if (!isImage) {
        ElMessage.error('只能上传图片文件！');
        return false;
    }
    if (!isLt4M) {
        ElMessage.error('图片大小不能超过 4MB！');
        return false;
    }
    return true; // 返回 true 允许上传，返回 false 阻止上传
};

const handelUploadRequest = async (options) => {
  const { file, onSuccess, onError } = options;
  try {
    const businessId = crypto.randomUUID();
    const fileRes = await uploadFile(file, { businessId });
    const payload = fileRes?.data || fileRes || {};
    const filePath = payload.filePath || payload.path || payload.url || payload?.data?.filePath || '';

    if (!filePath) {
      throw new Error('upload response missing filePath');
    }

    const normalizedBase = String(fileBaseUrl || '').replace(/\/$/, '');
    const normalizedPath = String(filePath).startsWith('http')
      ? String(filePath)
      : `${normalizedBase}/${String(filePath).replace(/^\/+/, '')}`;
    const previewUrl = normalizedPath;

    formData.coverImage = filePath;
    coverFileList.value = [
      {
        name: file.name,
        url: previewUrl,
        status: 'success',
      },
    ];

    onSuccess?.({ filePath, url: previewUrl });
  } catch (error) {
    ElMessage.error('封面上传失败，请重试');
    onError?.(error);
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const handlePreview = () => {
  ElMessage.info('内容预览功能待接入');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (_e) {
    ElMessage.warning('请完善必填项后再提交');
    return;
  }

  try {
    const submissionData = {
      ...formData,
      tags: formData.tagArray.join(','),
    };
    delete submissionData.tagArray;

    if (submissionData.id) {
      await updateArticle(submissionData.id, submissionData);
      ElMessage.success('文章更新成功');
    } else {
      await createArticle(submissionData);
      ElMessage.success('文章创建成功');
    }

    emit('success');
    emit('update:modelValue', false);
  } catch (error) {
    console.error('文章提交失败:', error);
    ElMessage.error('文章提交失败，请重试');
  }
};

// onMounted(() => {
//     console.log(categoryList);
    
// });

const handelContentChange = (data) => {
    formData.content = data.html;
    formRef.value?.validateField('content');
};


const editorInstance = ref(null);
const handelContentCreated = (editor) => {
    // 这里可以保存 editorInstance 以便后续使用，例如获取内容或调用编辑器方法
    editorInstance.value = editor;
    if(editor && formData.content) {
        nextTick(() => {
            editor.setHtml(formData.content);
        });
        
    }
};
</script>

<style scoped>
.cover-upload-trigger {
  width: 88px;
  height: 88px;
  background-color: #f2f3f5;
  border: 1px dashed #c9cdd4;
  border-radius: 6px;
  color: #666;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.4;
  padding: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

