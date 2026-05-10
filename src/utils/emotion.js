export const defaultEmotion = {
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  suggestion: '保持积极的心态，适当运动，和朋友聊聊天，都是不错的选择哦！',
  improvementSuggestions: [],
  riskLevel: 0,
  riskDescription: ''
};

export const createDefaultEmotion = () => ({
  ...defaultEmotion,
  improvementSuggestions: [...defaultEmotion.improvementSuggestions]
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

const normalizeNumber = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'negative', '是', '负向'].includes(normalized)) return true;
    if (['false', '0', 'no', 'positive', '否', '正向'].includes(normalized)) return false;
  }
  return fallback;
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const parsed = parseJsonSafe(value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return normalizeList(Object.values(parsed));
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n；;。]+/)
      .map((item) => item.replace(/^\s*\d+[.、]\s*/, '').trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeRiskLevel = (value, emotionScore, isNegative) => {
  if (value !== undefined && value !== null && value !== '') {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      return Math.max(0, Math.min(3, numberValue));
    }

    const riskMap = {
      NORMAL: 0,
      NONE: 0,
      LOW: 1,
      CONCERN: 1,
      ATTENTION: 1,
      MEDIUM: 2,
      WARNING: 2,
      HIGH: 3,
      CRISIS: 3,
      DANGER: 3,
      正常: 0,
      无: 0,
      低风险: 1,
      关注: 1,
      中风险: 2,
      预警: 2,
      高风险: 3,
      危机: 3
    };
    const normalized = String(value).trim().toUpperCase();
    return riskMap[normalized] ?? riskMap[String(value).trim()] ?? 0;
  }

  if (emotionScore < 31) return 3;
  if (emotionScore < 61 && isNegative) return 2;
  return 0;
};

export const normalizeEmotionData = (payload) => {
  const rawPayload = parseJsonSafe(payload) || payload || {};
  const nestedAnalysis =
    parseJsonSafe(rawPayload.aiEmotionAnalysis) ||
    parseJsonSafe(rawPayload.aiAnalysis) ||
    parseJsonSafe(rawPayload.emotionAnalysis) ||
    rawPayload.analysis ||
    {};
  const data = {
    ...rawPayload,
    ...(typeof nestedAnalysis === 'object' ? nestedAnalysis : {})
  };

  const emotionScore = normalizeNumber(
    data.emotionScore ?? data.score ?? data.moodScore,
    defaultEmotion.emotionScore
  );
  const isNegative = normalizeBoolean(data.isNegative ?? data.negative, emotionScore < 61);
  const riskLevel = normalizeRiskLevel(data.riskLevel ?? data.riskStatus ?? data.risk, emotionScore, isNegative);

  return {
    primaryEmotion: data.primaryEmotion || data.aiEmotion || data.dominantEmotion || defaultEmotion.primaryEmotion,
    emotionScore,
    isNegative,
    suggestion: data.suggestion || data.recommendation || '',
    improvementSuggestions: normalizeList(
      data.improvementSuggestions ??
      data.improvementSuggestion ??
      data.healingActions ??
      data.actions
    ),
    riskLevel,
    riskDescription: data.riskDescription || data.riskDesc || data.riskMessage || ''
  };
};

export const getRiskLevelText = (riskLevel) => {
  const riskTextMap = {
    0: '正常',
    1: '关注',
    2: '预警',
    3: '危机'
  };
  return riskTextMap[Number(riskLevel)] || '未知';
};

export const createRiskNotice = (emotion) => {
  const level = Number(emotion?.riskLevel || 0);
  const text = emotion?.riskDescription;

  if (level <= 0 && !text) {
    return null;
  }

  const fallbackTextMap = {
    1: '您当前的情绪状态需要关注，请注意调节。',
    2: '您当前的情绪状态处于预警状态，请优先照顾自己的感受。',
    3: '您当前的情绪状态处于危机状态，建议及时寻求专业帮助。'
  };

  return {
    level,
    icon: level >= 3 ? '⚠️' : '💡',
    title: level >= 3 ? '风险提示' : level === 2 ? '预警提示' : '温馨提示',
    text: text || fallbackTextMap[level] || '请关注当前的情绪变化，必要时寻求支持。'
  };
};
