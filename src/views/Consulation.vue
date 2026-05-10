<template>
  <div class="consultation-container">
    <div class="sidebar">
      <ConsultationAssistantInfo />
      <EmotionGarden :emotion="currentEmotion" />
      <SessionHistory
        :sessions="sessionList"
        :active-session-id="currentSession?.sessionId"
        @select="handelSessionClick"
        @delete="handeldeleteSession"
      />
    </div>

    <ConsultationChatPanel
      v-model="userMessage"
      :messages="messages"
      :is-ai-typing="isAiTying"
      @send="sendMessage"
      @new-session="CreatNewSession"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  newMessage,
  getSessionList,
  deleteSession,
  getSessionMessages,
  getSessionEmotion
} from '../api/admin';
import ConsultationAssistantInfo from '../components/consultation/ConsultationAssistantInfo.vue';
import EmotionGarden from '../components/consultation/EmotionGarden.vue';
import SessionHistory from '../components/consultation/SessionHistory.vue';
import ConsultationChatPanel from '../components/consultation/ConsultationChatPanel.vue';
import { createDefaultEmotion, normalizeEmotionData } from '../utils/emotion';

const userMessage = ref('');
const isAiTying = ref(false);
const currentSession = ref(null);
const messages = ref([]);
const sessionList = ref([]);
const currentEmotion = ref(createDefaultEmotion());

const loadSessionEmotion = (sessionId) => {
  if (!sessionId) {
    currentEmotion.value = createDefaultEmotion();
    return;
  }

  getSessionEmotion(sessionId).then(res => {
    const data = res.data || res;
    if (data) {
      currentEmotion.value = normalizeEmotionData(data);
    }
  }).catch(err => {
    console.error('获取情绪数据失败:', err);
    currentEmotion.value = createDefaultEmotion();
  });
};

const appendUserMessage = (content) => {
  messages.value.push({
    id: 'user_' + Date.now(),
    senderType: 1,
    role: 'user',
    content,
    createdAt: new Date().toLocaleTimeString()
  });
};

const appendAiMessage = () => {
  messages.value.push({
    id: 'ai_' + Date.now(),
    senderType: 2,
    role: 'ai',
    content: '',
    createdAt: new Date().toLocaleTimeString(),
    isError: false
  });
  return messages.value[messages.value.length - 1];
};

const getSessionPage = () => {
  getSessionList({
    pageNum: 1,
    pageSize: 10
  }).then(res => {
    const list = res.data?.records || res.records || res.data || res;
    sessionList.value = Array.isArray(list) ? list : [];
  }).catch(err => {
    console.error('获取会话列表失败:', err);
  });
};

const CreatNewSession = () => {
  currentSession.value = {
    sessionId: Date.now(),
    status: 'TEMP',
    sessionTitile: '新会话'
  };
  messages.value = [];
  currentEmotion.value = createDefaultEmotion();
};

const handeldeleteSession = (sessionId) => {
  ElMessageBox.confirm('确定要删除这个会话吗？', '删除会话', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSession(sessionId).then(() => {
      ElMessage.success('会话已删除');
      getSessionPage();
      if (currentSession.value?.sessionId === sessionId || currentSession.value?.sessionId === `session_${sessionId}`) {
        CreatNewSession();
      }
    }).catch(err => {
      ElMessage.error('删除失败');
      console.error(err);
    });
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const handelSessionClick = (session) => {
  const sessionId = session.id || session.sessionId;
  currentSession.value = {
    sessionId: `session_${sessionId}`,
    status: 'ACTIVE',
    sessionTitile: session.sessionTitle || session.sessionTitile
  };

  getSessionMessages(sessionId).then(res => {
    const data = res.data || res;
    const list = data.records || data.data || data;
    messages.value = (Array.isArray(list) ? list : []).map(msg => ({
      id: msg.id,
      senderType: msg.senderType,
      role: msg.senderType === 'USER' || msg.senderType === 1 ? 'user' : 'ai',
      content: msg.content || msg.message || '',
      createdAt: msg.createdAt || msg.createTime || ''
    }));
  }).catch(err => {
    console.error('获取会话消息失败:', err);
    messages.value = [];
  });

  loadSessionEmotion(sessionId);
};

const startNewSession = (text) => {
  const sessionParams = {
    initialMessage: text,
    sessionTitle: '心理咨询AI助手-' + new Date().toLocaleString()
  };

  newMessage(sessionParams).then(res => {
    const data = res.data || res;
    const sessionData = {
      sessionId: data.sessionId || data.id,
      status: data.status || 'ACTIVE',
      sessionTitile: data.sessionTitle || sessionParams.sessionTitle
    };
    Object.assign(currentSession.value, sessionData);
    getSessionPage();
    startAiResponse(currentSession.value.sessionId, text);
  }).catch(err => {
    ElMessage.error('发送失败，请重试');
    console.error(err);
    isAiTying.value = false;
  });
};

const startAiResponse = (sessionId, text) => {
  isAiTying.value = true;
  const aiMessage = appendAiMessage();
  const token = localStorage.getItem('token');

  fetchEventSource('/api/psychological-chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Token: token || ''
    },
    body: JSON.stringify({
      sessionId: String(sessionId),
      userMessage: text
    }),
    onopen(response) {
      console.log('[SSE] 连接建立, status:', response.status);
      if (!response.ok) {
        aiMessage.isError = true;
        aiMessage.content = '连接失败: HTTP ' + response.status;
        throw new Error('HTTP ' + response.status);
      }
    },
    onmessage(event) {
      const raw = event.data.trim();
      if (!raw) return;
      if (event.event === 'done' || raw === '[DONE]') {
        isAiTying.value = false;
        loadSessionEmotion(sessionId);
        return;
      }

      try {
        const payload = JSON.parse(raw);
        console.log('[SSE] 收到:', payload);
        if (String(payload.code) === '200' && payload.data) {
          const chunk = payload.data.content || payload.data.message || payload.data.text || '';
          aiMessage.content += chunk;
        } else if (payload.content) {
          aiMessage.content += payload.content;
        } else if (payload.data) {
          aiMessage.content += typeof payload.data === 'string' ? payload.data : '';
        } else {
          aiMessage.isError = true;
          aiMessage.content = payload.message || payload.msg || 'AI响应出错了';
          isAiTying.value = false;
        }
      } catch {
        aiMessage.content += raw;
      }
    },
    onerror(err) {
      console.error('[SSE] 错误:', err);
      aiMessage.isError = true;
      aiMessage.content = '连接发生错误，请稍后再试';
      isAiTying.value = false;
      throw err;
    },
    onclose() {
      console.log('[SSE] 连接关闭');
      isAiTying.value = false;
      loadSessionEmotion(sessionId);
    }
  });
};

const sendFollowUp = (text) => {
  startAiResponse(currentSession.value.sessionId, text);
};

const sendMessage = () => {
  const text = userMessage.value.trim();
  if (text === '') return;

  if (isAiTying.value) {
    ElMessage.warning('AI正在输入，请稍后...');
    return;
  }

  if (!currentSession.value) {
    ElMessage.error('会话未初始化，请刷新页面');
    return;
  }

  appendUserMessage(text);
  userMessage.value = '';
  isAiTying.value = true;

  if (currentSession.value.status === 'TEMP') {
    startNewSession(text);
  } else {
    sendFollowUp(text);
  }
};

onMounted(() => {
  CreatNewSession();
  getSessionPage();
});
</script>

<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;
  }
}
</style>
