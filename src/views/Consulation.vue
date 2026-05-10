<template>
    <div class="consultation-container">
        <div class="sidebar">
            <div class="ai-assistant-info">
                <div class="breathing-circle">
                    <el-image :src="robotFill" fit="cover"></el-image>
                </div>
                <div class="assistant-name">AI咨询助手</div>
                <div class="online-status">
                    <span class="status-dot"></span>
                    在线
                </div>
            </div>

            <div class="emotion-garden">
                <div class="garden-header">
                    <div class="garden-title">情绪花园</div>
                </div>
                <div class="emotion-info">
                    <div class="emotion-name">{{ currentEmotion.primaryEmotion }}</div>
                    <div class="emotion-score">{{ currentEmotion.emotionScore }}</div>
                </div>
                <div class="warm-tips">
                    <div class="emotion-status-text">
                        <span class="status-label">今天感觉 </span>
                        <span class="status-emotion">{{ currentEmotion.isNegative || currentEmotion.riskLevel > 0 ? '需要关注' : '很不错' }}</span>
                    </div>
                    <div class="emotion-intensity">
                        <span class="intensity-dots">
                            <span class="dot" v-for="(dot, index) in 3" :key="index"
                                :class="{ active: index < getIntensityClass(currentEmotion.emotionScore) }"></span>
                        </span>
                        <span class="intensity-text">{{ getRiskLevelText(currentEmotion.riskLevel) }}</span>
                    </div>
                    <div class="warm-suggestion" v-if="currentEmotion.suggestion">
                        <div class="suggestion-icon">💝</div>
                        <div class="suggestion-content">
                            <div class="suggestion-title">给你的小建议哦：</div>
                            <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
                        </div>
                    </div>


                    <!-- // -->

                        <div class="healing-actions" v-if="healingActions.length > 0">
                            <div class="actions-title">
                                <span>治愈小行动</span>
                            </div>
                            <div class="actions-list">
                                <div class="action-item" v-for="(action, idx) in healingActions" :key="idx">
                                    <div class="action-icon">✨</div>
                                    <div class="action-text">{{ action }}</div>
                                </div>
                            </div>
                        </div>

                    <div class="risk-notice" v-if="riskNotice" :class="`risk-level-${riskNotice.level}`">
                        <div class="notice-icon">{{ riskNotice.icon }}</div>
                        <div class="notice-content">
                            <div class="notice-title">{{ riskNotice.title }}</div>
                            <div class="notice-text">{{ riskNotice.text }}</div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="session-history">
                <div class="section-title">
                    <span>会话列表</span>
                </div>
                <div class="session-list">
                    <!-- 会话列表项 -->
                    <div class="session-item" v-for="session in sessionList" :key="session.id"
                        @click="handelSessionClick(session)">
                        <div class="session-info">

                            <div class="session-title">
                                <span>{{ session.sessionTitle }}</span>
                                <div class="session-meta">
                                    <span class="session-time">{{ session.startedAt }}</span>
                                </div>
                                <div class="session-preview">{{ session.lastMessageContent }}</div>
                            </div>
                            <div class="session-actions">
                                <el-button type="danger" text icon="Delete"
                                    @click.stop="handeldeleteSession(session.id)" />
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
                                    {{ ((session.durationMinutes / 60).toFixed(1)) || 0 }}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat-main">
            <div class="chat-header">
                <div class="header-left">
                    <div class="chat-avatar">
                        <el-image :src="like" style="width: 30px; height: 30px;"></el-image>
                    </div>
                    <div class="chat-info">
                        <h2>情绪分析结果</h2>
                        <p>根据您的输入，分析出当前的情绪状态</p>
                    </div>
                </div>
                <el-button circle @click="CreatNewSession" title="新建会话" class="send-btn">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-button>

            </div>

            <div class="chat-messages">
                <div class="message-item ai-message" v-if="messages.length === 0">
                    <div class="message-avatar">
                        <el-image :src="robotFill" fit="cover"></el-image>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>您好！我是您的情绪分析助手。请告诉我您目前的感受，我将为您进行分析。</p>
                        </div>
                        <div class="message-time">刚刚</div>
                    </div>
                </div>


                <div v-for="(msg, index) in messages" :key="msg.id || index"
                    :class="['message-item', isUserMessage(msg) ? 'user-message' : 'ai-message']">
                    <div class="message-avatar">
                        <el-image style="width: 18px; height: 18px;" :src="isUserMessage(msg) ? users : robotFill"
                            fit="cover"></el-image>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">

                            <div v-if="msg.senderType === 2 && isAiTying && !msg.content" class="typing-indicator">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>

                            </div>

                            <div v-else-if="msg.isError" class="error-message">
                                <p>{{ msg.content }}</p>
                            </div>

                            <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError" :content="msg.content"
                                :is-ai-message="true" />

                            <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"> </p>

                        </div>
                        <div class="message-time">{{ msg.senderType === 2 && !msg.isAiTying ? '正在输入中' : msg.createdAt }}
                        </div>
                    </div>
                </div>
            </div>


            <div>
                <!-- 输入框和发送按钮 -->
                <div class="chat-input">
                    <el-input class="message-input" placeholder="请输入您想分享的..." @keyup.enter="sendMessage"
                        v-model="userMessage" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
                        :disabled="isAiTying" maxlength="500" show-word-limit></el-input>
                    <el-button class="send-btn" type="primary" @click="sendMessage">
                        <el-icon>
                            <Promotion />
                        </el-icon>
                    </el-button>
                </div>

            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import robotFill from '../assets/images/robot-fill.png';
import users from '../assets/images/users.png';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import like from '../assets/images/like.png';
import { newMessage, getSessionList, getSessionDetails, deleteSession, getSessionMessages, getSessionEmotion } from '../api/admin';
import { ChatRound, Clock, Plus, Promotion } from '@element-plus/icons-vue';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
const userMessage = ref('');
const isAiTying = ref(false);
const currentSession = ref(null);
const messages = ref([]);
const sessionList = ref([]);


const defaultEmotion = {
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    suggestion: '保持积极的心态，适当运动，和朋友聊聊天，都是不错的选择哦！',
    improvementSuggestions: [],
    riskLevel: 0,
    riskDescription: ''
};

const createDefaultEmotion = () => ({
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

const normalizeEmotionData = (payload) => {
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

//情绪花园
const currentEmotion = ref(createDefaultEmotion());

const healingActions = computed(() => currentEmotion.value.improvementSuggestions || []);

const getRiskLevelText = (riskLevel) => {
    const riskTextMap = {
        0: '正常',
        1: '关注',
        2: '预警',
        3: '危机'
    };
    return riskTextMap[Number(riskLevel)] || '未知';
};

const riskNotice = computed(() => {
    const level = Number(currentEmotion.value.riskLevel || 0);
    const text = currentEmotion.value.riskDescription;

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
});

const loadSessionEmotion=(sessionId)=>{
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
}

const getIntensityClass = (score) => {
   if (score >= 61) {
        return 3; // 高强度显示所有点
    } else if (score >= 31) {
        return 2; // 中强度显示前两个点
    } else {
        return 1; // 低强度只显示第一个点
    }
};


const formatMessageContent = (content) => {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
};

const isUserMessage = (msg) => {
    return msg.senderType === 'USER' || msg.senderType === 1 || msg.role === 'user';
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



const handeldeleteSession = (sessionId) => {
    ElMessageBox.confirm('确定要删除这个会话吗？', '删除会话', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        deleteSession(sessionId).then(() => {
            ElMessage.success('会话已删除');
            getSessionPage();
            // 如果删除的是当前会话，新建一个临时会话
            if (currentSession.value?.sessionId === sessionId) {
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
    currentSession.value = {
        sessionId: session.id || session.sessionId,
        status: 'ACTIVE',
        sessionTitile: session.sessionTitle || session.sessionTitile
    };

    getSessionMessages(session.id).then(res => {
        const data = res.data || res;
        const list = data.records || data.data || data;
        messages.value = (Array.isArray(list) ? list : []).map(msg => ({
            id: msg.id,
            role: msg.senderType === 'USER' || msg.senderType === 1 ? 'user' : 'ai',
            content: msg.content || msg.message || '',
            time: msg.createdAt || msg.createTime || ''
        }));
    }).catch(err => {
        console.error('获取会话消息失败:', err);
        messages.value = [];
    });
    const sessionData = {
        sessionId: "session_" + session.id,
        status: 'ACTIVE',
        sessionTitile: session.sessionTitle
    };
    currentSession.value = sessionData;
    loadSessionEmotion(session.id);
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


const startAiResponse = (sessionId, userMessage) => {
    isAiTying.value = true;

    messages.value.push({
        id: 'ai_' + Date.now(),
        senderType: 2,
        content: '',
        createdAt: new Date().toLocaleTimeString(),
        isError: false
    });
    const aiMessage = messages.value[messages.value.length - 1];

    const token = localStorage.getItem('token');

    fetchEventSource('/api/psychological-chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Token': token || ''
        },
        body: JSON.stringify({
            sessionId: String(sessionId),
            userMessage: userMessage
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

    const sendMessage = () => {
        const text = userMessage.value.trim();
        if (text === '') {
            return;
        }

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

        .ai-assistant-info {
            margin-bottom: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(251, 146, 60, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;

            .breathing-circle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 12px;
                animation: breathing 4s ease-in-out infinite;
                box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
                position: relative;
            }

            .assistant-name {
                font-size: 16px;
                font-weight: 700;
                background: linear-gradient(135deg, #fb923c, #f59e0b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                background-clip: text;
                margin: 0 0 12px;
            }

            .online-status {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #059669;
                font-size: 12px;
                font-weight: 600;

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #059669;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                    box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
                }
            }
        }

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

                        .session-actions {
                            position: absolute;
                            top: 10px;
                            right: 12px;
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

        .emotion-garden {
            background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            min-height: 300px;

            .garden-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                position: relative;
                z-index: 2;

                .garden-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #8b4513;
                }
            }

            .emotion-info {
                margin: 0 auto;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                color: #fff;

                .emotion-name {
                    font-size: 15px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 2px;
                }

                .emotion-score {
                    font-size: 14px;
                    font-weight: 700;
                    opacity: 0.9;
                }
            }

            .warm-tips {
                text-align: center;
                margin-bottom: 16px;

                .emotion-status-text {
                    margin-bottom: 12px;

                    .status-label {
                        font-size: 14px;
                        color: #8b7355;
                        margin-right: 8px;
                    }

                    .status-emotion {
                        font-size: 16px;
                        font-weight: 600;
                        padding: 4px 12px;
                        border-radius: 16px;
                        display: inline-block;
                    }
                }

                .emotion-intensity {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;

                    .intensity-dots {
                        display: flex;
                        gap: 4px;

                        .dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #e0e0e0;
                            transition: all 0.3s ease;

                            &.active {
                                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                                transform: scale(1.2);
                                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
                            }
                        }
                    }

                    .intensity-text {
                        font-size: 12px;
                        color: #8b7355;
                        font-weight: 500;
                    }
                }

                .warm-suggestion {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

                    .suggestion-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }

                    .suggestion-content {
                        text-align: left;
                        flex: 1;

                        .suggestion-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #8b7355;
                            margin-bottom: 6px;
                        }

                        .suggestion-text {
                            font-size: 13px;
                            color: #6b5b47;
                            line-height: 1.5;
                        }
                    }
                }

                .healing-actions {
                    margin-bottom: 16px;

                    .actions-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #8b7355;
                        margin-bottom: 16px;
                    }

                    .actions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .action-item {
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
                            border-radius: 12px;
                            padding: 12px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                            text-align: left;

                            .action-icon {
                                font-size: 14px;
                                color: #ffd700;
                                flex-shrink: 0;
                            }

                            .action-text {
                                font-size: 12px;
                                color: #6b5b47;
                                line-height: 1.4;
                                flex: 1;
                            }
                        }
                    }
                }

                .risk-notice {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
                    border-radius: 12px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                    text-align: left;

                    .notice-icon {
                        font-size: 14px;
                        color: #ffd700;
                        flex-shrink: 0;
                    }

                    .notice-content {
                        flex: 1;

                        .notice-title {
                            font-size: 12px;
                            font-weight: 600;
                            color: #6b5b47;
                            line-height: 1.4;
                            margin-bottom: 4px;
                        }

                        .notice-text {
                            font-size: 12px;
                            color: #6b5b47;
                            line-height: 1.4;
                        }
                    }
                }
            }
        }
    }

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

                        /* 错误消息样式 */
                        .error-message {
                            background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
                            border: 1px solid #F87171;
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #991B1B;
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

            .input-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #78716c;
                font-weight: 500;
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
}

@keyframes breathing {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
    }
    50% {
        transform: scale(1.08);
        box-shadow: 0 8px 32px rgba(251, 146, 60, 0.4);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
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
