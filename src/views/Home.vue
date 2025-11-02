<template>
  <div class="home">
    <div class="home-container">
      <!-- 轮播图/Banner -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">欢迎来到我的博客</h1>
          <p class="hero-subtitle">分享技术、记录生活、探索世界</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="goToPosts">
              <el-icon><Reading /></el-icon>
              开始阅读
            </el-button>
            <el-button size="large" @click="goToEditor" v-if="authStore.isLoggedIn">
              <el-icon><EditPen /></el-icon>
              写文章
            </el-button>
          </div>
        </div>
      </section>

      <!-- 统计信息（可选） -->
      <section class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <el-icon class="stat-icon" color="#409eff"><Document /></el-icon>
              <div class="stat-value">{{ stats.postCount }}</div>
              <div class="stat-label">文章总数</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <el-icon class="stat-icon" color="#67c23a"><View /></el-icon>
              <div class="stat-value">{{ stats.viewCount }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <el-icon class="stat-icon" color="#e6a23c"><User /></el-icon>
              <div class="stat-value">{{ stats.userCount }}</div>
              <div class="stat-label">用户数量</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-card">
              <el-icon class="stat-icon" color="#f56c6c"><ChatDotRound /></el-icon>
              <div class="stat-value">{{ stats.commentCount }}</div>
              <div class="stat-label">评论总数</div>
            </div>
          </el-col>
        </el-row>

      <!-- 推荐文章 -->
      <section class="featured-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Star /></el-icon>
            推荐文章
          </h2>
          <el-link type="primary" @click="goToPosts">查看更多 →</el-link>
        </div>

        <el-row :gutter="20" v-loading="loading">
          <el-col :xs="24" :sm="12" :md="8" v-for="post in featuredPosts" :key="post.id">
            <el-card class="post-card" shadow="hover" @click="goToPostDetail(post.id)">
              <!-- 封面图 -->
              <div class="post-cover">
                <el-image
                    :src="post.coverImage || 'https://via.placeholder.com/400x200'"
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

              <!-- 文章信息 -->
              <div class="post-info">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-summary">{{ post.summary }}</p>

                <!-- 作者和统计信息 -->
                <div class="post-meta">
                  <div class="author-info">
                    <el-avatar :size="24" :src="post.authorAvatar">
                      {{ post.authorName?.charAt(0) }}
                    </el-avatar>
                    <span class="author-name">{{ post.authorName }}</span>
                  </div>
                  <div class="post-stats">
                    <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                    <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
                    <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="!loading && featuredPosts.length === 0" description="暂无推荐文章" />
      </section>


      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPostList } from '@/api/post'
import {ChatDotRound, Picture, Star, View} from "@element-plus/icons-vue";

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const featuredPosts = ref([])

// 统计数据
const stats = ref({
  postCount: 128,
  viewCount: 5420,
  userCount: 89,
  commentCount: 432
})

// 跳转方法
const goToPosts = () => router.push('/posts')
const goToEditor = () => router.push('/editor')
const goToPostDetail = (id) => router.push(`/posts/${id}`)

// 获取推荐文章
const loadFeaturedPosts = async () => {
  loading.value = true
  try {
    // 调用真实 API
    const res = await getPostList({ page: 1, size: 6, status: 1 })
    featuredPosts.value = res.records
  } catch (error) {
    console.error('加载推荐文章失败', error)
    // 失败时显示空数据
    featuredPosts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeaturedPosts()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 80px 40px;
  margin-bottom: 40px;
  text-align: center;
  color: white;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Section */
.featured-section,
.stats-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Post Card */
.post-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.post-card:hover {
  transform: translateY(-4px);
}

.post-cover {
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 16px;
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

.post-info {
  padding: 0 4px;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 13px;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Stats Section */
.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
  }
}
</style>