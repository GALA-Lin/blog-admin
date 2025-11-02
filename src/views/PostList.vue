<template>
  <div class="post-list-page">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">文章列表</h1>
        <el-button type="primary" @click="goToEditor" v-if="authStore.isLoggedIn">
          <el-icon><EditPen /></el-icon>
          写文章
        </el-button>
      </div>

      <!-- 筛选栏 -->
      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="排序">
            <el-select v-model="filterForm.sortBy" @change="handleFilter">
              <el-option label="最新发布" value="created_at" />
              <el-option label="最多浏览" value="view_count" />
              <el-option label="最多点赞" value="like_count" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 文章列表 -->
      <div class="post-list" v-loading="loading">
        <el-card
            class="post-item"
            v-for="post in postList"
            :key="post.id"
            shadow="hover"
            @click="goToPostDetail(post.id)"
        >
          <div class="post-content">
            <!-- 左侧信息 -->
            <div class="post-main">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-summary">{{ post.summary }}</p>

              <!-- 文章元信息 -->
              <div class="post-meta">
                <div class="author-info">
                  <el-avatar :size="32" :src="post.authorAvatar">
                    {{ post.authorName?.charAt(0) }}
                  </el-avatar>
                  <span class="author-name">{{ post.authorName }}</span>
                  <span class="post-date">{{ formatDate(post.publishedAt) }}</span>
                </div>

                <div class="post-stats">
                  <span>
                    <el-icon><View /></el-icon>
                    {{ post.viewCount }}
                  </span>
                  <span>
                    <el-icon><ChatDotRound /></el-icon>
                    {{ post.commentCount }}
                  </span>
                  <span>
                    <el-icon><Star /></el-icon>
                    {{ post.likeCount }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 右侧封面图 -->
            <div class="post-cover" v-if="post.coverImage">
              <el-image
                  :src="post.coverImage"
                  fit="cover"
                  lazy
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-card>

        <!-- 空状态 -->
        <el-empty v-if="!loading && postList.length === 0" description="暂无文章" />
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
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
import { getPostList } from '@/api/post'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const postList = ref([])
const total = ref(0)

// 分页参数
const pagination = reactive({
  page: 1,
  size: 10
})

// 筛选参数
const filterForm = reactive({
  sortBy: 'created_at',
  status: 1  // 只显示已发布的文章
})

// 加载文章列表
const loadPostList = async () => {
  loading.value = true
  try {
    const res = await getPostList({
      page: pagination.page,
      size: pagination.size,
      status: filterForm.status
    })

    postList.value = res.records
    total.value = res.total
  } catch (error) {
    console.error('加载文章列表失败', error)
    ElMessage.error('加载文章列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadPostList()
}

// 重置
const handleReset = () => {
  filterForm.sortBy = 'created_at'
  pagination.page = 1
  loadPostList()
}

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page
  loadPostList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadPostList()
}

// 跳转
const goToEditor = () => router.push('/editor')
const goToPostDetail = (id) => router.push(`/posts/${id}`)

onMounted(() => {
  loadPostList()
})
</script>

<style scoped>
.post-list-page {
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

.filter-card {
  margin-bottom: 20px;
}

.post-list {
  margin-bottom: 20px;
}

.post-item {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content {
  display: flex;
  gap: 20px;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 500;
  color: #606266;
}

.post-date {
  color: #909399;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-cover {
  width: 180px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.post-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
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
    height: 200px;
  }

  .post-stats {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>