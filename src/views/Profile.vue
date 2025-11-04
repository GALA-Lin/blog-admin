<template>
  <div class="profile-page">
    <div class="page-container">
      <!-- 个人信息卡片 -->
      <el-card class="profile-card">
        <div class="profile-header">
          <el-avatar :size="100" :src="authStore.avatar">
            {{ authStore.nickname?.charAt(0) }}
          </el-avatar>
          <div class="profile-info">
            <h2 class="nickname">{{ authStore.nickname }}</h2>
            <p class="username">@{{ authStore.username }}</p>
          </div>
          <el-button @click="showEditDialog = true">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </div>

        <el-divider />

        <!-- 统计数据 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.postCount }}</div>
              <div class="stat-label">文章</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.favoriteCount }}</div>
              <div class="stat-label">收藏</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.followerCount }}</div>
              <div class="stat-label">粉丝</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.followingCount }}</div>
              <div class="stat-label">关注</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 快捷入口 -->
      <el-card class="quick-links">
        <h3 class="section-title">快捷入口</h3>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6">
            <div class="quick-link-item" @click="goToMyPosts">
              <el-icon class="icon"><Document /></el-icon>
              <span>我的文章</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="quick-link-item" @click="goToFavorites">
              <el-icon class="icon"><Star /></el-icon>
              <span>我的收藏</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="quick-link-item" @click="goToNotifications">
              <el-icon class="icon"><Bell /></el-icon>
              <span>通知中心</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="quick-link-item" @click="showPasswordDialog = true">
              <el-icon class="icon"><Lock /></el-icon>
              <span>修改密码</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
        v-model="showEditDialog"
        title="编辑资料"
        width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" maxlength="50" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
              v-model="editForm.bio"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <el-avatar :size="80" :src="editForm.avatarUrl">
              {{ editForm.nickname?.charAt(0) }}
            </el-avatar>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="updating">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
        v-model="showPasswordDialog"
        title="修改密码"
        width="500px"
    >
      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword, getCurrentUser } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const passwordFormRef = ref(null)

// 用户统计数据
const userStats = reactive({
  postCount: 0,
  favoriteCount: 0,
  followerCount: 0,
  followingCount: 0
})

// 编辑表单
const editForm = reactive({
  nickname: '',
  bio: '',
  avatarUrl: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度8-32个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 上传配置
const uploadUrl = computed(() => '/api/files/upload/image')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 初始化编辑表单
const initEditForm = () => {
  editForm.nickname = authStore.nickname
  editForm.bio = authStore.userInfo?.bio || ''
  editForm.avatarUrl = authStore.avatar
}

// 更新资料
const handleUpdateProfile = async () => {
  updating.value = true
  try {
    await updateProfile(editForm)
    authStore.updateUserInfo(editForm)
    ElMessage.success('资料更新成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('更新资料失败', error)
    ElMessage.error('更新资料失败')
  } finally {
    updating.value = false
  }
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    editForm.avatarUrl = response.data.fileUrl
    ElMessage.success('头像上传成功')
  }
}

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true
      try {
        await changePassword(passwordForm)
        ElMessage.success('密码修改成功，请重新登录')
        showPasswordDialog.value = false
        // 退出登录
        setTimeout(() => {
          authStore.logout()
        }, 1500)
      } catch (error) {
        console.error('修改密码失败', error)
        ElMessage.error('修改密码失败')
      } finally {
        changingPassword.value = false
      }
    }
  })
}

// 跳转方法
const goToMyPosts = () => router.push('/my-posts')
const goToFavorites = () => router.push('/favorites')
const goToNotifications = () => router.push('/notifications')

onMounted(async () => {
  initEditForm()

  // 加载用户统计数据
  try {
    const { data: userInfo } = await getCurrentUser() // 从接口获取用户信息
    // 赋值统计数据（接口返回中已有postCount、followerCount、followingCount）
    userStats.postCount = userInfo.postCount || 0
    userStats.followerCount = userInfo.followerCount || 0
    userStats.followingCount = userInfo.followingCount || 0
    // 接口未返回favoriteCount，保持默认0或补充其他获取逻辑
    userStats.favoriteCount = 0 // 若有其他接口获取收藏数，可在此处补充
  } catch (error) {
    console.error('获取用户统计数据失败', error)
    ElMessage.error('加载统计数据失败')
  }
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background: #f5f7fa;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-info {
  flex: 1;
}

.nickname {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #303133;
}

.username {
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-links {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-link-item:hover {
  background: #e4e7ed;
  transform: translateY(-2px);
}

.quick-link-item .icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: #409eff;
}

.quick-link-item span {
  font-size: 14px;
  color: #606266;
}

.avatar-uploader {
  cursor: pointer;
}

.avatar-uploader :deep(.el-avatar) {
  transition: opacity 0.3s;
}

.avatar-uploader :deep(.el-avatar:hover) {
  opacity: 0.8;
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>