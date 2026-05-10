<template>
  <div class="session-history">
    <div class="section-title">
      <span>会话列表</span>
    </div>
    <div class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id || session.sessionId"
        :class="['session-item', { active: isActive(session) }]"
        @click="$emit('select', session)"
      >
        <div class="session-info">
          <div class="session-title">
            <span>{{ session.sessionTitle }}</span>
            <div class="session-meta">
              <span class="session-time">{{ session.startedAt }}</span>
            </div>
            <div class="session-preview">{{ session.lastMessageContent }}</div>
          </div>
          <div class="session-actions">
            <el-button type="danger" text icon="Delete" @click.stop="$emit('delete', getSessionId(session))" />
          </div>
          <div class="session-stats">
            <span>
              <el-icon>
                <ChatRound />
              </el-icon>
              {{ session.messageCount || 0 }}
            </span>
            <span>
              <el-icon>
                <Clock />
              </el-icon>
              {{ formatDuration(session.durationMinutes) }}h
            </span>
          </div>
        </div>
      </div>
      <div class="no-sessions-text" v-if="sessions.length === 0">暂无会话</div>
    </div>
  </div>
</template>

<script setup>
import { ChatRound, Clock } from '@element-plus/icons-vue';

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  activeSessionId: {
    type: [String, Number],
    default: ''
  }
});

defineEmits(['select', 'delete']);

const getSessionId = (session) => session.id || session.sessionId;

const isActive = (session) => {
  const activeId = String(props.activeSessionId || '');
  return [session.id, session.sessionId, `session_${session.id}`].some((id) => String(id || '') === activeId);
};

const formatDuration = (durationMinutes) => {
  const value = Number(durationMinutes);
  return Number.isFinite(value) ? (value / 60).toFixed(1) : '0.0';
};
</script>

<style scoped lang="scss">
.session-history {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  min-height: 250px;
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .session-list {
    overflow-y: auto;
    max-height: 200px;
    scrollbar-width: thin;
    scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

    .session-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        background: #f8f9ff;
        border-color: #e6f0ff;
      }

      &.active {
        background: #e6f0ff;
        border-color: #4096ff;
      }

      .session-info {
        flex: 1;

        .session-title {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .session-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;

            .session-time {
              font-size: 12px;
              color: #999;
            }
          }

          .session-preview {
            width: 200px;
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .session-actions {
          position: absolute;
          top: 10px;
          right: 12px;
        }

        .session-stats {
          display: flex;
          align-items: center;
          gap: 12px;

          span {
            font-size: 12px;
            color: #999;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .no-sessions-text {
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  }
}
</style>
