<template>
  <div class="chat-main">
    <div class="chat-header">
      <div class="header-left">
        <div class="chat-avatar">
          <el-image :src="like" style="width: 30px; height: 30px;" />
        </div>
        <div class="chat-info">
          <h2>情绪分析结果</h2>
          <p>根据您的输入，分析出当前的情绪状态</p>
        </div>
      </div>
      <el-button circle @click="$emit('new-session')" title="新建会话">
        <el-icon>
          <Plus />
        </el-icon>
      </el-button>
    </div>

    <div class="chat-messages">
      <div class="message-item ai-message" v-if="messages.length === 0">
        <div class="message-avatar">
          <el-image :src="robotFill" fit="cover" />
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <p>您好！我是您的情绪分析助手。请告诉我您目前的感受，我将为您进行分析。</p>
          </div>
          <div class="message-time">刚刚</div>
        </div>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        :class="['message-item', isUserMessage(msg) ? 'user-message' : 'ai-message']"
      >
        <div class="message-avatar">
          <el-image
            style="width: 18px; height: 18px;"
            :src="isUserMessage(msg) ? users : robotFill"
            fit="cover"
          />
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div v-if="isAiMessage(msg) && isAiTyping && !msg.content" class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>

            <div v-else-if="msg.isError" class="error-message">
              <p>{{ msg.content }}</p>
            </div>

            <MarkdownRenderer v-else-if="isAiMessage(msg) && !msg.isError" :content="msg.content" :is-ai-message="true" />

            <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
          </div>
          <div class="message-time">{{ formatMessageTime(msg) }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <el-input
        class="message-input"
        placeholder="请输入您想分享的..."
        v-model="messageText"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :disabled="isAiTyping"
        maxlength="500"
        show-word-limit
        @keydown.enter.exact.prevent="$emit('send')"
      />
      <el-button class="send-btn" type="primary" @click="$emit('send')">
        <el-icon>
          <Promotion />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Plus, Promotion } from '@element-plus/icons-vue';
import MarkdownRenderer from '../MarkdownRenderer.vue';
import robotFill from '../../assets/images/robot-fill.png';
import users from '../../assets/images/users.png';
import like from '../../assets/images/like.png';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  messages: {
    type: Array,
    default: () => []
  },
  isAiTyping: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'send', 'new-session']);

const messageText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isUserMessage = (msg) => {
  return msg.senderType === 'USER' || msg.senderType === 1 || msg.role === 'user';
};

const isAiMessage = (msg) => {
  return msg.senderType === 'AI' || msg.senderType === 2 || msg.role === 'ai' || !isUserMessage(msg);
};

const formatMessageContent = (content) => {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
};

const formatMessageTime = (msg) => {
  if (isAiMessage(msg) && props.isAiTyping && !msg.content) {
    return '正在输入中';
  }
  return msg.createdAt || msg.time || '';
};
</script>

<style scoped lang="scss">
.chat-main {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(251, 146, 60, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;

  .chat-header {
    background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;

      .chat-avatar {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 1;
      }

      .chat-info {
        h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        p {
          font-size: 14px;
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
    min-height: 0;
    max-height: calc(100vh - 200px);
    scrollbar-width: thin;
    scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

    .message-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        flex-shrink: 0;
      }

      &.ai-message {
        .message-avatar {
          background: linear-gradient(135deg, #fb923c, #f59e0b);
          box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
        }
      }

      &.user-message {
        .message-avatar {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }
      }

      .message-content {
        max-width: 70%;

        .message-bubble {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
          border-radius: 16px;
          padding: 12px 16px;
          position: relative;
          animation: fadeInUp 0.4s ease-out;
          border: 1px solid rgba(251, 146, 60, 0.1);
          box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 0;

            .typing-dot {
              width: 8px;
              height: 8px;
              background: #ccc;
              border-radius: 50%;
              animation: typing 1.5s ease-in-out infinite;

              &:nth-child(2) {
                animation-delay: 0.2s;
              }

              &:nth-child(3) {
                animation-delay: 0.4s;
              }
            }
          }

          .error-message {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border: 1px solid #f87171;
            border-radius: 12px;
            padding: 12px 16px;
            color: #991b1b;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }

  .chat-input {
    border-top: 1px solid rgba(251, 146, 60, 0.1);
    padding: 20px 24px;
    display: flex;
    gap: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
    backdrop-filter: blur(10px);
    flex-shrink: 0;

    .message-input {
      flex: 1;
      width: 100%;

      :deep(textarea) {
        resize: none;
        min-height: 40px;
      }
    }

    .send-btn {
      height: 60px;
      width: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
      border: none !important;
      box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
      transition: all 0.3s ease;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
