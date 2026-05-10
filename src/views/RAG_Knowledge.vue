<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-icon size="34">
          <Reading />
        </el-icon>
        <div>
          <h1>心理知识库</h1>
          <p>精选心理健康文章，帮助你更好地理解情绪与自我照护。</p>
        </div>
      </div>
    </div>

    <div class="content" v-if="!selectedArticle">
      <aside class="recommend-section">
        <div class="section-title">
          <el-icon>
            <Star />
          </el-icon>
          <span>推荐阅读</span>
        </div>
        <div class="recommend-list" v-loading="recommendLoading">
          <div
            class="recommend-item"
            v-for="article in recommendList"
            :key="article.id"
            @click="openArticle(article)"
          >
            <div class="recommend-title">{{ getArticleTitle(article) }}</div>
            <div class="read-count">
              <span>{{ getCategoryName(article) }}</span>
              <span>{{ getReadCount(article) }} 阅读</span>
            </div>
          </div>
          <el-empty v-if="!recommendLoading && recommendList.length === 0" description="暂无推荐" :image-size="80" />
        </div>
      </aside>

      <main class="article-list" v-loading="listLoading">
        <div
          class="article-item"
          v-for="article in articleList"
          :key="article.id"
          @click="openArticle(article)"
        >
          <el-image class="cover" :src="getArticleCover(article)" fit="cover" />
          <div class="info">
            <div class="title">
              <h3>{{ getArticleTitle(article) }}</h3>
              <el-tag size="small" type="warning">{{ getCategoryName(article) }}</el-tag>
            </div>
            <p class="summary">{{ getArticleSummary(article) }}</p>
            <div class="meta">
              <span>{{ getAuthorName(article) }}</span>
              <span>{{ getReadCount(article) }} 阅读</span>
              <span>{{ getPublishTime(article) }}</span>
            </div>
          </div>
        </div>
        <el-empty v-if="!listLoading && articleList.length === 0" description="暂无文章" />
      </main>
    </div>

    <div class="pagination-wrapper" v-if="!selectedArticle">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :current-page="pageParams.currentPage"
        :page-size="pageParams.size"
        :total="pageParams.total"
        @current-change="handlePageChange"
      />
    </div>

    <div class="articleDetail-container" v-else>
      <div class="content">
        <div class="diary-card" v-loading="detailLoading">
          <el-button text type="primary" @click="selectedArticle = null">返回知识库</el-button>
          <div class="sub-title">
            <el-tag class="category-tag" type="warning">{{ getCategoryName(selectedArticle) }}</el-tag>
            <div class="flex-box">
              <div class="item">
                <el-icon>
                  <View />
                </el-icon>
                <span>{{ getReadCount(selectedArticle) }} 阅读</span>
              </div>
              <div class="item">
                <el-icon>
                  <Clock />
                </el-icon>
                <span>{{ getPublishTime(selectedArticle) }}</span>
              </div>
            </div>
          </div>

          <h2 class="article-title">{{ getArticleTitle(selectedArticle) }}</h2>

          <div class="summary-content" v-if="getArticleSummary(selectedArticle)">
            {{ getArticleSummary(selectedArticle) }}
          </div>

          <div class="content-wrapper">
            <MarkdownRenderer :content="getArticleContent(selectedArticle)" />
          </div>

          <div class="tags-content" v-if="getTags(selectedArticle).length">
            <div class="tags-title">文章标签</div>
            <div class="tags-list">
              <el-tag v-for="tag in getTags(selectedArticle)" :key="tag" type="info">{{ tag }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { Clock, Reading, Star, View } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import { getKnowledgeDetails, getKnowledgeList } from '../api/admin';

const defaultCover = 'https://file.itndedu.com/psychology_ai.png';

const articleList = ref([]);
const recommendList = ref([]);
const selectedArticle = ref(null);
const listLoading = ref(false);
const recommendLoading = ref(false);
const detailLoading = ref(false);

const pageParams = reactive({
  currentPage: 1,
  size: 5,
  total: 0
});

const getRecordsPayload = (res) => {
  const data = res?.data || res || {};
  const realData = data.records ? data : (data.data || data);
  return {
    records: realData.records || realData.list || [],
    total: realData.total || realData.count || 0
  };
};

const loadArticleList = async () => {
  listLoading.value = true;
  try {
    const res = await getKnowledgeList({
      sortField: 'readCount',
      sortDirection: 'desc',
      currentPage: String(pageParams.currentPage),
      size: String(pageParams.size)
    });
    const { records, total } = getRecordsPayload(res);
    articleList.value = Array.isArray(records) ? records : [];
    pageParams.total = Number(total);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    articleList.value = [];
    pageParams.total = 0;
    ElMessage.error('获取文章列表失败');
  } finally {
    listLoading.value = false;
  }
};

const loadRecommendList = async () => {
  recommendLoading.value = true;
  try {
    const res = await getKnowledgeList({
      sortField: 'readCount',
      sortDirection: 'desc',
      currentPage: '1',
      size: '5'
    });
    const { records } = getRecordsPayload(res);
    recommendList.value = Array.isArray(records) ? records : [];
  } catch (error) {
    console.error('获取推荐阅读失败:', error);
    recommendList.value = [];
  } finally {
    recommendLoading.value = false;
  }
};

const openArticle = async (article) => {
  const articleId = article?.id || article?.articleId;
  if (!articleId) return;

  detailLoading.value = true;
  selectedArticle.value = article;
  try {
    const res = await getKnowledgeDetails(articleId);
    selectedArticle.value = res?.data || res || article;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    ElMessage.error('获取文章详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const handlePageChange = (page) => {
  pageParams.currentPage = page;
  loadArticleList();
};

const getArticleTitle = (article) => article?.title || article?.articleTitle || '未命名文章';
const getArticleCover = (article) => article?.coverUrl || article?.cover || article?.imageUrl || defaultCover;
const getCategoryName = (article) => article?.categoryName || article?.category || '心理知识';
const getAuthorName = (article) => article?.authorName || article?.author || '心理AI助手';
const getReadCount = (article) => article?.readCount ?? article?.views ?? article?.viewCount ?? 0;
const getPublishTime = (article) => article?.publishedAt || article?.updatedAt || article?.createdAt || '-';
const getArticleSummary = (article) => article?.summary || article?.description || article?.contentPreview || '';
const getArticleContent = (article) => article?.content || article?.articleContent || article?.body || article?.summary || '暂无正文内容';

const getTags = (article) => {
  const tags = article?.tags || article?.tagArray;
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags).split(/[，,]/).map((tag) => tag.trim()).filter(Boolean);
};

onMounted(() => {
  loadArticleList();
  loadRecommendList();
});
</script>

<style scoped lang="scss">
.knowledge-container {
  min-height: 100%;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;
    gap: 16px;

    .item {
      display: flex;
      align-items: center;

      span {
        margin-left: 5px;
      }
    }
  }

  .header-section {
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 1200px;
      margin: 0 auto;

      h1 {
        margin: 0 0 6px;
        font-size: 30px;
      }

      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }

  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      min-height: 400px;

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;

          .recommend-title {
            color: #111827;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.5;
          }

          .read-count {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .cover {
          width: 160px;
          height: 110px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .info {
          margin-left: 20px;
          flex: 1;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;

            h3 {
              margin: 0;
              color: #111827;
              font-size: 20px;
            }
          }

          .summary {
            margin: 12px 0;
            color: #6b7280;
            line-height: 1.7;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .meta {
            display: flex;
            gap: 16px;
            color: #9ca3af;
            font-size: 13px;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }

  .articleDetail-container {
    .content {
      margin: 0 auto;
      width: 980px;
      padding: 20px;
      display: block;

      .diary-card {
        margin-bottom: 20px;
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

        .sub-title {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .category-tag {
            margin-right: 20px;
          }
        }

        .article-title {
          font-size: 28px;
          font-weight: bold;
          color: #111827;
          margin-top: 30px;
          margin-bottom: 10px;
        }

        .summary-content {
          background: rgba(126, 211, 33, 0.1);
          border-left: 4px solid #7ed321;
          padding: 10px 15px;
          border-radius: 0 8px 8px 0;
          position: relative;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .content-wrapper {
          font-size: 15px;
          color: #374151;
        }

        .tags-content {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;

          .tags-title {
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          }

          .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
        }
      }
    }
  }
}
</style>
