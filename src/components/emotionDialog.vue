<template>
  <el-dialog
    v-model="dialogVisible"
    title="情绪分析详情"
    width="860px"
    :close-on-click-modal="false"
  >
    <div v-if="detail" class="detail-wrapper">
      <div class="detail-section">
        <h4>用户信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ detail.id ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detail.userId ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detail.username || detail.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="日记日期">{{ detail.diaryDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updatedAt || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>情绪状态</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="情绪评分">
            <el-rate :model-value="detail.moodScore || 0" disabled :max="10" />
          </el-descriptions-item>
          <el-descriptions-item label="生活指标">
            <div>
              <p>睡眠：{{ detail.sleepQuality ?? '-' }}/5</p>
              <p>压力：{{ detail.stressLevel ?? '-' }}/5</p>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="主导情绪">
            <el-tag :type="getEmotionTagType(detail.dominantEmotion || detail.originalEmotion)">
              {{ detail.dominantEmotion || detail.originalEmotion || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="AI识别情绪">
            <el-tag :type="getAiEmotionTagType(parsedAiData.primaryEmotion || detail.aiEmotion)">
              {{ parsedAiData.primaryEmotion || detail.aiEmotion || '-' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="情绪指数">
            <span :style="{ color: getEmotionScoreColor(Number(parsedAiData.emotionScore || detail.emotionScore || 0)), fontWeight: 600 }">
              {{ parsedAiData.emotionScore ?? detail.emotionScore ?? '-' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskLevelTagType(parsedAiData.riskLevel ?? detail.riskLevel)">
              {{ getRiskLevelText(parsedAiData.riskLevel ?? detail.riskLevel) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>日记内容</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="触发因素">
            <div class="text-content">{{ detail.emotionTriggers || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="日记内容">
            <div class="text-content">{{ detail.diaryContent || detail.diaryContentPreview || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>AI情绪分析结果</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析状态">
            <el-tag :type="getAiStatusTagType(detail.aiAnalysisStatus)">{{ getAiStatusText(detail.aiAnalysisStatus) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分析时间">{{ detail.aiAnalysisUpdatedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="情绪标签">{{ parsedAiData.label || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风险描述">{{ parsedAiData.riskDescription || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容长度">{{ detail.contentLength ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="负向情绪">
            {{ typeof parsedAiData.isNegative === 'boolean' ? (parsedAiData.isNegative ? '是' : '否') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="关键词" :span="2">
            <div v-if="keywordList.length" class="tags-wrap">
              <el-tag v-for="(keyword, index) in keywordList" :key="`${keyword}-${index}`" size="small" type="info">
                {{ keyword }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>专业建议</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="AI建议">
            <div class="text-content">{{ parsedAiData.suggestion || detail.recommendation || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="改进建议">
            <div v-if="improvementList.length" class="text-content">
              <p v-for="(item, index) in improvementList" :key="`improve-${index}`">{{ index + 1 }}. {{ item }}</p>
            </div>
            <div v-else class="text-content">-</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  detail: {
    type: Object,
    default: null
  },
  aiData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

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

const parsedAiData = computed(() => {
  return (
    props.aiData ||
    parseJsonSafe(props.detail?.aiEmotionAnalysis) ||
    parseJsonSafe(props.detail?.aiAnalysis) ||
    {}
  );
});

const keywordList = computed(() => {
  const keywords = parsedAiData.value?.keywords;
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  if (typeof keywords === 'string') {
    return keywords
      .split(/[，,、\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
});

const improvementList = computed(() => {
  const suggestions = parsedAiData.value?.improvementSuggestions;
  if (!suggestions) return [];
  if (Array.isArray(suggestions)) return suggestions.filter(Boolean);
  if (typeof suggestions === 'string') {
    return suggestions
      .split(/[\n；;。]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
});

const getEmotionTagType = (emotion) => {
  const emotionTypes = {
    快乐: 'success',
    平静: 'success',
    兴奋: 'warning',
    愤怒: 'danger',
    悲伤: 'info',
    焦虑: 'warning',
    疲惫: 'info'
  };
  return emotionTypes[emotion] || 'info';
};

const getAiEmotionTagType = (emotion) => {
  const emotionTagMap = {
    快乐: 'success',
    平静: 'success',
    兴奋: 'warning',
    满足: 'success',
    愤怒: 'danger',
    悲伤: 'info',
    焦虑: 'warning',
    恐惧: 'danger',
    沮丧: 'info',
    压力: 'warning',
    疲惫: 'info'
  };
  return emotionTagMap[emotion] || 'info';
};

const getEmotionScoreColor = (score) => {
  if (score >= 80) return '#f56c6c';
  if (score >= 60) return '#e6a23c';
  if (score >= 40) return '#909399';
  return '#67c23a';
};

const getRiskLevelTagType = (riskLevel) => {
  const riskTagMap = {
    0: 'success',
    1: 'info',
    2: 'warning',
    3: 'danger'
  };
  return riskTagMap[riskLevel] || 'info';
};

const getRiskLevelText = (riskLevel) => {
  const riskTextMap = {
    0: '正常',
    1: '关注',
    2: '预警',
    3: '危机'
  };
  return riskTextMap[riskLevel] ?? '未知风险等级';
};

const getAiStatusTagType = (status) => {
  const map = {
    COMPLETED: 'success',
    PENDING: 'info',
    PROCESSING: 'warning',
    FAILED: 'danger'
  };
  return map[status] || 'info';
};

const getAiStatusText = (status) => {
  const map = {
    COMPLETED: '已完成',
    PENDING: '待分析',
    PROCESSING: '分析中',
    FAILED: '分析失败'
  };
  return map[status] || status || '-';
};
</script>

<style scoped>
.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section h4 {
  margin: 0 0 10px;
  font-size: 15px;
  color: #303133;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
