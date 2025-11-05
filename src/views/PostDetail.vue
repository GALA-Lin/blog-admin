<template>
  <div class="post-detail-page">
    <div class="page-container" v-loading="loading">
      <el-card v-if="post" class="post-card">
        <!-- 文章头部 -->
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>

          <!-- 作者信息 -->
          <div class="author-section">
            <div class="author-info">
              <el-avatar :size="48" :src="post.authorAvatar">
                {{ post.authorName?.charAt(0) }}
              </el-avatar>
              <div class="author-detail">
                <div class="author-name">{{ post.authorName }}</div>
                <div class="post-meta">
                  <span>{{ formatDate(post.publishedAt) }}</span>
                  <span>阅读 {{ post.viewCount }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons" v-if="authStore.isLoggedIn">
              <el-button
                  :type="post.isLiked ? 'primary' : 'default'"
                  @click="handleLike"
                  :loading="liking"
              >
                <el-icon><Star /></el-icon>
                {{ post.isLiked ? '已点赞' : '点赞' }} ({{ post.likeCount }})
              </el-button>
              <el-button
                  :type="post.isFavorited ? 'primary' : 'default'"
                  @click="handleFavorite"
                  :loading="favoriting"
              >
                <el-icon><Collection /></el-icon>
                {{ post.isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="post-content">
          <div class="markdown-body" v-html="renderedContent"></div>
        </div>

        <!-- 文章标签 -->
        <div class="post-tags" v-if="post.tags && post.tags.length > 0">
          <el-tag v-for="tag in post.tags" :key="tag.id" size="large">
            {{ tag.name }}
          </el-tag>
        </div>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comment-section" v-if="post">
        <CommentSection :post-id="post.id" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {getPostDetail} from '@/api/post'
import {checkPostLike, togglePostLike} from '@/api/like'
import {checkFavorite, toggleFavorite} from '@/api/favorite'
import CommentSection from '@/components/comment/CommentSection.vue'
import {ElMessage} from 'element-plus'
import {marked} from 'marked'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const liking = ref(false)
const favoriting = ref(false)
const post = ref(null)

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked(post.value.content)
})

// 加载文章详情
const loadPostDetail = async () => {
  const postId = route.params.id
  loading.value = true

  try {
    post.value = await getPostDetail(postId)

    // 如果用户已登录，检查点赞和收藏状态
    if (authStore.isLoggedIn) {
      await loadInteractionStatus()
    }
  } catch (error) {
    console.error('加载文章失败', error)
    ElMessage.error('文章不存在或已被删除')
    await router.push('/posts')
  } finally {
    loading.value = false
  }
}

// 加载点赞和收藏状态
const loadInteractionStatus = async () => {
  try {
    const [likeStatus, favoriteStatus] = await Promise.all([
      checkPostLike(post.value.id),
      checkFavorite(post.value.id)
    ])

    post.value.isLiked = likeStatus
    post.value.isFavorited = favoriteStatus
  } catch (error) {
    console.error('加载互动状态失败', error)
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 点赞
const handleLike = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    await router.push('/login')
    return
  }

  liking.value = true
  try {
    const result = await togglePostLike(post.value.id)
    post.value.isLiked = result
    post.value.likeCount += result ? 1 : -1
    ElMessage.success(result ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    liking.value = false
  }
}

// 收藏
const handleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    await router.push('/login')
    return
  }

  favoriting.value = true
  try {
    const result = await toggleFavorite(post.value.id)
    post.value.isFavorited = result
    ElMessage.success(result ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('收藏失败', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    favoriting.value = false
  }
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-page {
  min-height: calc(100vh - 80px);
  background: #f5f7fa;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.post-card {
  margin-bottom: 20px;
}

.post-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 30px;
}

.post-title {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1.4;
  margin: 0 0 20px 0;
}

.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.post-meta {
  font-size: 13px;
  color: #909399;
  display: flex;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.post-content {
  padding: 20px 0;
  min-height: 300px;
}

/* Markdown 样式 */
.markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  word-wrap: break-word;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.markdown-body :deep(h1) {
  font-size: 28px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.markdown-body :deep(h2) {
  font-size: 24px;
}

.markdown-body :deep(h3) {
  font-size: 20px;
}

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #e83e8c;
}

.markdown-body :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 16px 0;
  color: #606266;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 16px 0;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 28px;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

.post-tags {
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comment-section {
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .post-title {
    font-size: 24px;
  }

  .author-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>