<template>
  <div class="my-posts-page">
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">我的文章</h1>
        <el-button type="primary" @click="goToEditor">
          <el-icon><EditPen /></el-icon>
          写文章
        </el-button>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="已发布" name="published" />
        <el-tab-pane label="草稿" name="draft" />
      </el-tabs>

      <!-- 文章列表 -->
      <div class="post-list" v-loading="loading">
        <el-card
            class="post-item"
            v-for="post in postList"
            :key="post.id"
            shadow="hover"
        >
          <div class="post-content" @click="goToPostDetail(post.id)">
            <div class="post-main">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-summary">{{ post.summary || '暂无摘要' }}</p>

              <div class="post-meta">
                <el-tag :type="getStatusType(post.status)" size="small">
                  {{ getStatusText(post.status) }}
                </el-tag>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
                </div>
              </div>
            </div>

            <div class="post-cover" v-if="post.coverImage">
              <el-image :src="post.coverImage" fit="cover" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="post-actions">
            <el-button size="small" @click.stop="handleEdit(post.id)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
                size="small"
                type="primary"
                v-if="post.status === 0"
                @click.stop="handlePublish(post.id)"
            >
              <el-icon><Promotion /></el-icon>
              发布
            </el-button>
            <el-popconfirm
                title="确定要删除这篇文章吗？"
                @confirm="handleDelete(post.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" @click.stop>
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>

        <!-- 空状态 -->
        <el-empty
            v-if="!loading && postList.length === 0"
            description="还没有文章，快去创作吧"
        >
          <el-button type="primary" @click="goToEditor">写文章</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPostList, deletePost, publishPost } from '@/api/post'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const postList = ref([])
const total = ref(0)
const activeTab = ref('all')

const pagination = reactive({
  page: 1,
  size: 10
})

// 获取文章状态对应的类型
const getStatusType = (status) => {
  const map = {
    0: 'info',      // 草稿
    1: 'success',   // 已发布
    2: 'warning',   // 审核中
    '-1': 'danger'  // 已删除
  }
  return map[status] || 'info'
}

// 获取文章状态文本
const getStatusText = (status) => {
  const map = {
    0: '草稿',
    1: '已发布',
    2: '审核中',
    '-1': '已删除'
  }
  return map[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 加载文章列表
const loadPostList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }

    // 根据标签页筛选状态
    if (activeTab.value === 'published') {
      params.status = 1
    } else if (activeTab.value === 'draft') {
      params.status = 0
    }

    const res = await getPostList(params)
    postList.value = res.records
    total.value = res.total
  } catch (error) {
    console.error('加载文章列表失败', error)
    ElMessage.error('加载文章列表失败')
  } finally {
    loading.value = false
  }
}

// 标签页切换
const handleTabChange = () => {
  pagination.page = 1
  loadPostList()
}

// 分页变化
const handlePageChange = () => {
  loadPostList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 编辑文章
const handleEdit = (id) => {
  router.push(`/editor/${id}`)
}

// 发布文章
const handlePublish = async (id) => {
  try {
    await publishPost(id)
    ElMessage.success('发布成功')
    loadPostList()
  } catch (error) {
    console.error('发布失败', error)
    ElMessage.error('发布失败')
  }
}

// 删除文章
const handleDelete = async (id) => {
  try {
    await deletePost(id)
    ElMessage.success('删除成功')
    await loadPostList()
  } catch (error) {
    console.error('删除失败', error)
    ElMessage.error('删除失败')
  }
}

// 跳转
const goToEditor = () => router.push('/editor')
const goToPostDetail = (id) => router.push(`/posts/${id}`)

onMounted(() => {
  loadPostList()
})
</script>

<style scoped>
.my-posts-page {
  min-height: calc(100vh - 80px);
  background: #f5f7fa;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.post-list {
  margin-top: 20px;
}

.post-item {
  margin-bottom: 16px;
}

.post-content {
  display: flex;
  gap: 16px;
  cursor: pointer;
  margin-bottom: 16px;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.post-stats {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-cover {
  width: 140px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.post-cover .el-image {
  width: 100%;
  height: 100%;
}

.post-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .post-content {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 180px;
  }

  .post-actions {
    flex-wrap: wrap;
  }
}
</style>