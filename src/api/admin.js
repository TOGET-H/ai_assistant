import service from "../utils/request";

export function login(data) {
    return service.post('/user/login', data);
}

export function categoryTree() {
    return service.get('/knowledge/category/tree');
}

export function articlePage(params) {
    return service.get('/knowledge/article/page', { params });
}

export function uploadFile(file,businessInfo) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessType', "ARTICLE");
    formData.append('businessId', JSON.stringify(businessInfo.businessId));
    formData.append('businessField', "cover");
    return service.post('/file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}


export function createArticle(data) {
    return service.post('/knowledge/article', data);
}


export function updateArticle(id, data) {
    return service.put(`/knowledge/article/${id}`, data);
}

export function updateStatus(id, data) {
    return service.put(`/knowledge/article/${id}/status`, data);
}

export function deleteArticle(id) {
    return service.delete(`/knowledge/article/${id}`);
}

// 咨询会话

export function consultationPage(params) {
    return service.get('/psychological-chat/sessions', { params });
}

export function getSessionDetails(sessionId) {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`);
}


export function getEmotionalData(params) {
    return service.get(`/emotion-diary/admin/page`, { params }  );
}


export function deleteEmotionalData(id) {
    return service.delete(`/emotion-diary/admin/${id}`);
}

export function getAnalysisData() {
    return service.get(`/data-analytics/overview`);
}


export function logOut() {
    return service.post('/user/logout');
}

//用户端

export function register(data) {
    return service.post('/user/add', data);
}

export function newMessage(data) {
    return service.post('/psychological-chat/session/start', data);
}


export function getSessionList(params) {
    return service.get('/psychological-chat/sessions', { params });
}

export function deleteSession(id) {
    return service.delete(`/psychological-chat/sessions/${id}`);
}

export function getSessionMessages(sessionId) {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`);
}

export function getSessionEmotion(sessionId) {
    return service.get(`/psychological-chat/session/${sessionId}/emotion`);
}

export function emotionalDiary(data) {
    return service.post('/emotion-diary', data);
}

export function getKnowledgeList(params) {
    return service.get('/knowledge/article/page', { params });
}

export function getKnowledgeDetails(articleId) {
    return service.get(`/knowledge/article/${articleId}`);
}
