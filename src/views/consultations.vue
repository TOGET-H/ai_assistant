<template>
  <div class="consultations">
    <PageHead title="咨询记录" />

    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="会话ID" width="140">
        <template #default="scope">
          <span>{{ scope.row.id || scope.row.sessionId || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="会话内容">
        <template #default="scope">
          <div class="session-title">{{ scope.row.sessionTitle || '-' }}</div>
          <div class="session-preview">{{ scope.row.lastMessageContent || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="messageCount" label="消息数" width="100" />
      <el-table-column prop="lastMessageTime" label="时间" width="180" />

      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 20px; display: flex; justify-content: flex-end"
      :current-page="pageParams.pageNum"
      :page-size="pageParams.pageSize"
      layout="total, prev, pager, next, jumper"
      :total="pageParams.total"
      @current-change="handleCurrentChange"
    />

    <el-dialog
      v-model="showDetailDialog"
      title="咨询详情"
      width="70%"
      center
      :close-on-click-modal="false"
    >
      <div class="detail-row">
        <div class="detail-label">用户：</div>
        <div class="detail-value">{{ selectedSession.userNickname || '-' }}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">开始时间：</div>
        <div class="detail-value">{{ selectedSession.startedAt || selectedSession.startTime || '-' }}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">消息数：</div>
        <div class="detail-value">{{ normalizedMessages.length }}</div>
      </div>

      <div class="messages-container">
        <h4>消息记录</h4>
        <div class="messages-list">
          <div v-if="normalizedMessages.length === 0" class="empty-message">暂无消息</div>
          <div
            v-for="(message, index) in normalizedMessages"
            :key="message.id || index"
            :class="['message-item', message.senderType === 1 ? 'user-message' : 'ai-message']"
          >
            <div class="message-header">
              <div class="sender">{{ message.senderNickname || (message.senderType === 1 ? '用户' : 'AI') }}</div>
              <div class="time">{{ message.createdAt || '-' }}</div>
            </div>
            <div class="message-content">{{ message.content || '-' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import PageHead from '../components/pageHead.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { consultationPage, getSessionDetails } from '../api/admin';

const showDetailDialog = ref(false);
const selectedSession = ref({});
const sessionMessages = ref([]);
const tableData = ref([]);

const pageParams = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const normalizedMessages = computed(() => {
  return (sessionMessages.value || []).map((m) => {
    const rawRole = m.senderType ?? m.roleType ?? m.role;
    const isUser = rawRole === 1 || rawRole === 'USER' || rawRole === 'user' || rawRole === 'human';
    return {
      id: m.id || m.messageId,
      senderType: isUser ? 1 : 2,
      senderNickname: m.senderNickname || m.nickname || '',
      createdAt: m.createdAt || m.createTime || m.timestamp || '',
      content: m.content || m.messageContent || m.text || '',
    };
  });
});

const viewDetail = async (row) => {
  const id = row?.id || row?.sessionId;
  if (!id) {
    ElMessage.warning('会话ID不存在，无法查看详情');
    return;
  }

  try {
    const response = await getSessionDetails(id);
    const payload = response?.data || response || {};
    const list = Array.isArray(payload)
      ? payload
      : payload.records || payload.messages || payload.list || [];

    selectedSession.value = { ...row };
    sessionMessages.value = list;
    showDetailDialog.value = true;
  } catch (error) {
    console.error('获取会话详情失败:', error);
    ElMessage.error('获取会话详情失败，请重试');
  }
};

const handleSearch = async () => {
  const response = await consultationPage({
    pageNum: pageParams.pageNum,
    pageSize: pageParams.pageSize,
    currentPage: pageParams.pageNum,
    size: pageParams.pageSize,
  });

  const realData = response?.data || response || {};
  tableData.value = realData.records || [];
  pageParams.total = Number(realData.total || 0);
};

const handleCurrentChange = async (page) => {
  pageParams.pageNum = page;
  await handleSearch();
};

onMounted(async () => {
  await handleSearch();
});
</script>

<style scoped>
.session-title { font-weight: 500; margin-bottom: 4px; }
.session-preview { font-size: 13px; color: #666; }
.detail-row { display: flex; margin-bottom: 8px; }
.detail-label { min-width: 80px; font-weight: 500; }
.messages-container { margin-top: 16px; }
.messages-list { max-height: 420px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; }
.message-item { margin-bottom: 12px; padding: 10px; border-radius: 8px; border: 1px solid #e9ecef; }
.user-message { background: #e8f4fd; }
.ai-message { background: #f0f9f0; }
.message-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.message-content { white-space: pre-wrap; line-height: 1.6; }
.empty-message { text-align: center; color: #999; padding: 20px 0; }
</style>
