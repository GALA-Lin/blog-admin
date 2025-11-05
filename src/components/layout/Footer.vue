<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 左侧：版权信息 -->
      <div class="footer-left">
        <div class="logo">
          <el-icon :size="20"><Reading /></el-icon>
          <span class="logo-text">GALA_Lin's Blog</span>
        </div>
        <a href="https://beian.miit.gov.cn/" target="_blank">蜀ICP备2025169924号-1</a>
        <p class="copyright">
          © {{ currentYear }} GALA_Lin's Blog. All rights reserved.
        </p>
      </div>
      <!-- 中间：快速链接 -->
      <div class="footer-center">
        <h3 class="footer-title">快速链接</h3>
        <ul class="link-list">
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/posts">文章</router-link></li>
          <li><router-link to="/about">关于我</router-link></li>
          <li><router-link to="/archives">归档</router-link></li>
          <li><router-link to="/tags">标签</router-link></li>
        </ul>
      </div>

      <!-- 右侧：联系与订阅 -->
      <div class="footer-right">
        <h3 class="footer-title">联系我</h3>
        <div class="social-links">
          <el-button circle size="small" icon="el-icon-email" title="邮箱"></el-button>
          <el-button circle size="small" icon="el-icon-github" title="GitHub"></el-button>
          <el-button circle size="small" icon="el-icon-twitter" title="Twitter"></el-button>
          <el-button circle size="small" icon="el-icon-weixin" title="微信"></el-button>
        </div>
        <el-button
            type="text"
            class="subscribe-btn"
            @click="showSubscribeDialog"
        >
          订阅更新
        </el-button>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { Reading } from '@element-plus/icons-vue'
import { ElButton, ElDialog, ElInput, ElMessage } from 'element-plus'

// 当前年份
const currentYear = new Date().getFullYear()

// 订阅对话框
const subscribeDialogVisible = ref(false)
const email = ref('')

const showSubscribeDialog = () => {
  subscribeDialogVisible.value = true
}

const handleSubscribe = () => {
  if (!email.value) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  // 这里可以添加订阅逻辑
  ElMessage.success('订阅成功！')
  subscribeDialogVisible.value = false
  email.value = ''
}
</script>

<style scoped>
.footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 40px 0 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-left {
  flex: 1;
  min-width: 250px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.copyright {
  color: #606266;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.footer-center, .footer-right {
  min-width: 200px;
}

.footer-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 10px;
}

.link-list a {
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.link-list a:hover {
  color: #409eff;
}

.social-links {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.subscribe-btn {
  color: #409eff;
  padding: 0;
  font-size: 14px;
}

.subscribe-btn:hover {
  color: #66b1ff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>