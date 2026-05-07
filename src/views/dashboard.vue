<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="summary-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" v-for="item in summaryCards" :key="item.key">
        <el-card>
          <div class="card-content">
            <div class="avatar" :class="item.className">
              <el-image :src="item.icon" style="width: 40px; height: 40px" fit="contain" />
            </div>
            <div class="info">
              <p class="title">{{ item.title }}</p>
              <p class="number">{{ item.value }}</p>
              <p class="subtitle-title">{{ item.subTitle }}</p>
              <p class="sub-number">{{ item.subValue }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
          <div class="chart-stats">
            <div class="stat-item">
              <p class="stat-label">总会话数</p>
              <p class="stat-value">{{ emotionPanelStats.totalSessions }}</p>
            </div>
            <div class="stat-item">
              <p class="stat-label">平均时长</p>
              <p class="stat-value">{{ (emotionPanelStats.avgDurationMinutes/60).toFixed(2) }} 小时</p>
            </div>
            <div class="stat-item">
              <p class="stat-label">活跃用户</p>
              <p class="stat-value">{{ systemOverview.activeUsers }}</p>
            </div>
          </div>
    <el-row :gutter="20" class="panel-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>情绪趋势</span>
          </template>
          <div ref="emotionChartRef" class="chart-content"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>咨询活动统计</span>
          </template>
          <div ref="consultationChartRef" class="chart-content"></div>
        </el-card>
      </el-col>

      <el-col  >
        <el-card>
          <template #header>
            <span>日活跃用户数</span>
          </template>
          <div ref="userActivityChartRef" class="chart-content"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !hasAnyData" description="暂无可展示的数据" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { getAnalysisData } from '../api/admin';
import usersIcon from '../assets/images/users.png';
import likeIcon from '../assets/images/like.png';
import commentsIcon from '../assets/images/comments.png';
import smileIcon from '../assets/images/smile.png';

const loading = ref(false);
const rawData = ref({});

const emotionChartRef = ref(null);
const consultationChartRef = ref(null);
const userActivityChartRef = ref(null);
let emotionChart = null;
let consultationChart = null;
let userActivityChart = null;

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.records)) return value.records;
  if (value && Array.isArray(value.list)) return value.list;
  return [];
};

const systemOverview = computed(() => rawData.value?.systemOverview || rawData.value?.overview || {});

const emotionTrend = computed(() => {
  const source = rawData.value?.emotionTrend || rawData.value?.trendData || rawData.value?.moodTrend || rawData.value?.emotionTrendData;
  return toArray(source).map((item) => ({
    date: item.date || item.day || item.statDate || '-',
    avgMoodScore: normalizeNumber(item.avgMoodScore ?? item.averageMoodScore ?? item.moodAvg, 0),
    recordCount: normalizeNumber(item.recordCount ?? item.diaryCount ?? item.count, 0)
  }));
});

const consultationTrend = computed(() => {
  const source = rawData.value?.consultationTrend || rawData.value?.dailyTrend || rawData.value?.consultationStats?.dailyTrend || rawData.value?.consultationStats;
  return toArray(source).map((item) => ({
    date: item.date || item.day || item.statDate || '-',
    sessionCount: normalizeNumber(item.sessionCount ?? item.sessions ?? item.count, 0),
    userCount: normalizeNumber(item.userCount ?? item.participantCount ?? item.users, 0)
  }));
});

const userActivityTrend = computed(() => {
  const userActivity = rawData.value?.userActivity;
  const source =
    userActivity?.dailyTrend ||
    userActivity?.trend ||
    userActivity?.records ||
    userActivity?.list ||
    userActivity?.data ||
    userActivity ||
    rawData.value?.userActivityTrend ||
    rawData.value?.activityData ||
    rawData.value?.dailyActiveUsers ||
    rawData.value?.userStats?.dailyActiveUsers;

  return toArray(source).map((item) => ({
    date: item.date || item.day || item.statDate || '-',
    activeUsers: normalizeNumber(item.activeUsers ?? item.userCount ?? item.count, 0)
  }));
});

const summaryCards = computed(() => {
  const overview = systemOverview.value || {};
  return [
    {
      key: 'users',
      title: '总用户数',
      value: normalizeNumber(overview.totalUsers, 0),
      subTitle: '活跃用户数',
      subValue: normalizeNumber(overview.activeUsers, 0),
      icon: usersIcon,
      className: 'users'
    },
    {
      key: 'emotion',
      title: '情绪日志',
      value: normalizeNumber(overview.emotionalLogs, 0),
      subTitle: '今日新增用户',
      subValue: normalizeNumber(overview.newUsers, 0),
      icon: likeIcon,
      className: 'like'
    },
    {
      key: 'consultation',
      title: '咨询会话',
      value: normalizeNumber(overview.consultationSessions, 0),
      subTitle: '今日新增会话',
      subValue: normalizeNumber(overview.todayNewSessions, 0),
      icon: commentsIcon,
      className: 'comments'
    },
    {
      key: 'mood',
      title: '平均情绪评分',
      value: `${normalizeNumber(overview.avgMoodScore, 0)}/10`,
      subTitle: '情绪健康指数',
      subValue: normalizeNumber(overview.emotionHealthIndex ?? overview.healthIndex, 0),
      icon: smileIcon,
      className: 'smile'
    }
  ];
});

const emotionPanelStats = computed(() => {
  const consultationStats = rawData.value?.consultationStats || {};
  return {
    totalSessions: normalizeNumber(consultationStats.totalSessions ?? consultationStats.sessionCount, 0),
    avgDurationMinutes: consultationStats.avgDurationMinutes ?? '-',
    activeUsers: normalizeNumber(consultationStats.activeUsers, 0)
  };
});

const hasAnyData = computed(() => {
  return (
    Object.keys(systemOverview.value || {}).length > 0 ||
    emotionTrend.value.length > 0 ||
    consultationTrend.value.length > 0 ||
    userActivityTrend.value.length > 0
  );
});

const renderEmotionChart = () => {
  if (!emotionChartRef.value) return;
  emotionChart = emotionChart || echarts.init(emotionChartRef.value);
  emotionChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均情绪评分', '记录数量'], top: 0, left: 'center' },
    grid: { left: '3%', right: '4%', top: 52, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: emotionTrend.value.map((item) => item.date) },
    yAxis: [
      { type: 'value', name: '评分', min: 0, max: 10 },
      { type: 'value', name: '数量' }
    ],
    series: [
      { name: '平均情绪评分', type: 'line', smooth: true, yAxisIndex: 0, data: emotionTrend.value.map((item) => item.avgMoodScore) },
      { name: '记录数量', type: 'bar', yAxisIndex: 1, data: emotionTrend.value.map((item) => item.recordCount) }
    ]
  });
};

const renderConsultationChart = () => {
  if (!consultationChartRef.value) return;
  consultationChart = consultationChart || echarts.init(consultationChartRef.value);
  consultationChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['会话数量', '参与用户数'], top: 0, left: 'center' },
    grid: { left: '3%', right: '4%', top: 52, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: consultationTrend.value.map((item) => item.date) },
    yAxis: { type: 'value', name: '数量' },
    series: [
      { name: '会话数量', type: 'bar', data: consultationTrend.value.map((item) => item.sessionCount) },
      { name: '参与用户数', type: 'line', smooth: true, data: consultationTrend.value.map((item) => item.userCount) }
    ]
  });
};

const renderUserActivityChart = () => {
  if (!userActivityChartRef.value) return;
  userActivityChart = userActivityChart || echarts.init(userActivityChartRef.value);
  userActivityChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['日活跃用户数'], top: 0, left: 'center' },
    grid: { left: '3%', right: '4%', top: 52, bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: userActivityTrend.value.map((item) => item.date) },
    yAxis: { type: 'value', name: '用户数' },
    series: [
      { name: '日活跃用户数', type: 'line', smooth: true, data: userActivityTrend.value.map((item) => item.activeUsers) }
    ]
  });
};

const renderCharts = async () => {
  await nextTick();
  renderEmotionChart();
  renderConsultationChart();
  renderUserActivityChart();
};

const handleResize = () => {
  emotionChart?.resize();
  consultationChart?.resize();
  userActivityChart?.resize();
};

const loadDashboard = async () => {
  loading.value = true;
  try {
    const res = await getAnalysisData();
    rawData.value = res?.data || res || {};
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    ElMessage.error('获取数据分析信息失败，请稍后重试');
    rawData.value = {};
  } finally {
    loading.value = false;
    await renderCharts();
  }
};

watch([emotionTrend, consultationTrend, userActivityTrend], () => {
  renderCharts();
});

onMounted(() => {
  loadDashboard();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  emotionChart?.dispose();
  consultationChart?.dispose();
  userActivityChart?.dispose();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  .summary-row {
    margin-bottom: 20px;
  }

  .panel-row {
    margin-top: 12px;
  }

  .chart-content {
    width: 100%;
    height: 320px;
  }

  .chart-stats {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    gap: 12px;

    .stat-item {
      flex: 1;
      text-align: center;
      background: #f8fafc;
      border-radius: 8px;
      padding: 10px 8px;
    }

    .stat-label {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }

    .stat-value {
      margin: 6px 0 0;
      color: #303133;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .card-content {
    display: flex;
    align-items: center;

    .avatar {
      margin-right: 12px;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .info {
      .title {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .number {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px;
      }

      .subtitle-title {
        font-size: 12px;
        color: #95a5a6;
      }

      .sub-number {
        margin-top: 2px;
        font-size: 16px;
        font-weight: 600;
        color: #34495e;
      }
    }
  }
}
</style>
