<template>
  <div id="app">
    <!-- 导航栏 -->
    <Header v-if="showHeader" />

    <!-- 主要内容区域 -->
    <main class="main-content" :class="{ 'no-header': !showHeader }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'

const route = useRoute()

// 某些页面不显示 Header（如登录、注册页）
const showHeader = computed(() => {
  const noHeaderPages = ['/login', '/register']
  return !noHeaderPages.includes(route.path)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303133;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  min-height: calc(100vh - 60px);
  padding-top: 20px;
}

.main-content.no-header {
  min-height: 100vh;
  padding-top: 0;
}
</style>