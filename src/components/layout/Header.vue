<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo 和标题 -->
      <div class="header-left">
        <router-link to="/" class="logo">
          <el-icon :size="28"><Reading /></el-icon>
          <span class="logo-text">我的博客</span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <div class="header-center">
        <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/posts">
            <el-icon><Document /></el-icon>
            <span>文章</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧用户区域 -->
      <div class="header-right">
        <template v-if="authStore.isLoggedIn">
          <!-- 通知 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button circle @click="goToNotifications">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>

          <!-- 写文章按钮 -->
          <el-button type="primary" @click="goToEditor">
            <el-icon><EditPen /></el-icon>
            <span>写文章</span>
          </el-button>

          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="authStore.avatar">
                {{ authStore.nickname?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ authStore.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="my-posts">
                  <el-icon><Document /></el-icon>
                  我的文章
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>
                  我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <!-- 未登录状态 -->
        <template v-else>
          <el-button @click="goToLogin">登录</el-button>
          <el-button type="primary" @click="goToRegister">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ElMessageBox } from 'element-plus'
import {Bell, Document, EditPen, HomeFilled, Star, SwitchButton, User} from "@element-plus/icons-vue";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 未读通知数量（后续对接真实 API）
const unreadCount = ref(0)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 菜单选择
const handleMenuSelect = (index) => {
  router.push(index)
}

// 用户下拉菜单操作
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      await router.push('/profile')
      break
    case 'my-posts':
      await router.push('/my-posts')
      break
    case 'favorites':
      await router.push('/favorites')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          type: 'warning'
        })
        await authStore.logout()
      } catch (error) {
        // 用户取消
      }
      break
  }
}

// 跳转方法
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
const goToEditor = () => router.push('/editor')
const goToNotifications = () => router.push('/notifications')

// 加载未读通知数量（后续实现）
onMounted(() => {
  if (authStore.isLoggedIn) {
    // TODO: 调用获取未读通知数量的 API
    // unreadCount.value = await getUnreadNotificationCount()
  }
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
  transition: color 0.3s;
}

.logo:hover {
  color: #409eff;
}

.logo-text {
  font-size: 18px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-badge {
  margin-right: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 移除 Element Plus Menu 的底部边框 */
:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu--horizontal .el-menu-item) {
  border-bottom: 2px solid transparent;
}

:deep(.el-menu--horizontal .el-menu-item.is-active) {
  border-bottom-color: #409eff;
}
</style>