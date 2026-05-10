<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image class="header-icon" :src="like" alt="Emotional Diary" />
        <h1>情绪日记</h1>
      </div>
    </div>

    <div class="content">
      <div class="diary-card">
        <div class="title">今日情绪评分</div>
        <div class="section">
          <p>您今天的情绪如何？（1-10）</p>
          <div class="rate">
            <el-rate
              v-model="diaryForm.moodScore"
              :max="10"
              :texts="emotionStatus"
              show-text
              text-color="#374151"
            />
          </div>
        </div>
      </div>

      <div class="diary-card">
        <div class="title">主要情绪</div>
        <div class="section">
          <p>选择一个最贴近您当前状态的情绪标签</p>
          <div class="emotion-grid">
            <button
              v-for="emotion in emotionOpinions"
              :key="emotion.name"
              type="button"
              :class="['emotion-card', { selected: diaryForm.dominantEmotion === emotion.name }]"
              @click="handleEmotionSelect(emotion.name)"
            >
              <el-image class="emotion-icon" :src="emotion.url" fit="contain" />
              <span class="emotion-name">{{ emotion.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="diary-card" v-if="diaryForm.dominantEmotion">
        <div class="selected-emotion">
          当前选择：
          <el-tag type="success" size="large">{{ diaryForm.dominantEmotion }}</el-tag>
        </div>
      </div>


      <!-- 详细记录 -->
       <div class="diary-card">
        <div class="title">详细记录</div>
        <div class="detail-form">
            <div class="form-group">
              <label>情绪触发因素：</label>
              <el-input
                v-model="diaryForm.emotionTriggers"
                type="textarea"
                placeholder="请输入可能影响您情绪的事件或想法..."
                :rows="3"
              />
            </div>
            <div class="form-group">
              <label>情绪日记：</label>
              <el-input
                v-model="diaryForm.diaryContent"
                type="textarea"
                placeholder="请输入您的情绪日记..."
                :rows="4"
              />
            </div>

            <!-- 睡眠质量 -->
            <div class="form-group">
              <label>睡眠质量：</label>
              <el-slider
                v-model="diaryForm.sleepQuality"
                :min="0"
                :max="10"
                show-input
              />
            </div>
            <!-- 压力水平 -->
            <div class="form-group">
              <label>压力水平：</label>
              <el-slider
                v-model="diaryForm.stressLevel"
                :min="0"
                :max="10"
                show-input
              />
            </div>
          </div>
          <el-button type="primary" :loading="isSubmitting" @click="submitDiary">提交日记</el-button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { dayjs, ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import like from '@/assets/images/like.png';
import sad from '@/assets/images/悲伤.png';
import anxious from '@/assets/images/焦虑.png';
import surprised from '@/assets/images/惊讶.png';
import happy from '@/assets/images/开心.png';
import confused from '@/assets/images/困惑.png';
import tired from '@/assets/images/疲惫.png';
import calm from '@/assets/images/平静.png';
import excited from '@/assets/images/兴奋.png';
import { emotionalDiary } from '@/api/admin';

const isSubmitting = ref(false);

const diaryForm = reactive({
  diaryDate: dayjs().format('YYYY-MM-DD'),
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: 0,
  stressLevel: 0
});

const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福'];

const emotionOpinions = [
  { name: '悲伤', url: sad },
  { name: '焦虑', url: anxious },
  { name: '惊讶', url: surprised },
  { name: '开心', url: happy },
  { name: '困惑', url: confused },
  { name: '疲惫', url: tired },
  { name: '平静', url: calm },
  { name: '兴奋', url: excited }
];

const handleEmotionSelect = (emotion) => {
  diaryForm.dominantEmotion = emotion;
};

const buildDiaryPayload = () => ({
  diaryDate: diaryForm.diaryDate,
  moodScore: Number(diaryForm.moodScore),
  dominantEmotion: diaryForm.dominantEmotion,
  emotionTriggers: diaryForm.emotionTriggers.trim(),
  diaryContent: diaryForm.diaryContent.trim(),
  sleepQuality: Number(diaryForm.sleepQuality),
  stressLevel: Number(diaryForm.stressLevel)
});

const validateDiaryForm = (payload) => {
  if (!payload.diaryDate) return '记录日期不能为空';
  if (!Number.isInteger(payload.moodScore) || payload.moodScore < 1 || payload.moodScore > 10) return '请选择 1-10 的情绪评分';
  if (!payload.dominantEmotion) return '请选择主要情绪';
  if (!payload.emotionTriggers) return '请输入情绪触发因素';
  if (!payload.diaryContent) return '请输入今日感想';
  if (!Number.isInteger(payload.sleepQuality)) return '请选择睡眠质量';
  if (!Number.isInteger(payload.stressLevel)) return '请选择压力水平';
  return '';
};

const submitDiary = async () => {
  const payload = buildDiaryPayload();
  const errorMessage = validateDiaryForm(payload);
  if (errorMessage) {
    ElMessage.warning(errorMessage);
    return;
  }

  try {
    isSubmitting.value = true;
    await emotionalDiary(payload);
    ElMessage.success('情绪日记提交成功');
  } catch (error) {
    console.error('提交情绪日记失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.emotionDiary-container {
  min-height: 100%;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .header-section {
    background: linear-gradient(135deg, #7ed321 0%, #f5a623 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 980px;
      margin: 0 auto;

      .header-icon {
        width: 48px;
        height: 48px;
      }

      h1 {
        margin: 0;
        font-size: 30px;
        font-weight: 700;
      }
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 15px;
        }

        .rate {
          :deep(.el-rate__text) {
            min-width: 72px;
            margin-left: 16px;
            padding: 4px 12px;
            border-radius: 999px;
            background: #f0fdf4;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
          }
        }
      }

      .emotion-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;

        .emotion-card {
          width: 100%;
          height: 112px;
          padding: 15px;
          border: 2px solid #e5e7eb;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #f9fafb;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .emotion-icon {
            width: 46px;
            height: 46px;
          }

          .emotion-name {
            display: block;
            margin-top: 10px;
            color: #374151;
            font-size: 15px;
            font-weight: 500;
          }

          &:hover {
            border-color: #7ed321;
            background: #f0fdf4;
          }

          &.selected {
            border-color: #7ed321;
            background: #f0fdf4;
            transform: translateY(-3px);
            box-shadow: 0 8px 18px rgba(126, 211, 33, 0.18);
          }
        }
      }

      .selected-emotion {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #374151;
        font-weight: 600;
      }
    }
  }
}
</style>
