<template>
  <div class="post-editor-page">
    <div class="editor-container">
      <!-- 编辑器头部 -->
      <div class="editor-header">
        <el-input
            v-model="postForm.title"
            placeholder="请输入文章标题..."
            size="large"
            maxlength="200"
            show-word-limit
            class="title-input"
        />

        <div class="header-actions">
          <el-button @click="handleBack">返回</el-button>
          <el-button @click="handleSaveDraft" :loading="saving">
            保存草稿
          </el-button>
          <el-button type="primary" @click="handlePublish" :loading="publishing">
            发布文章
          </el-button>
        </div>
      </div>

      <!-- Markdown 编辑器 -->
      <div class="editor-main">
        <MdEditor
            v-model="postForm.content"
            :toolbars="toolbars"
            :preview-theme="'github'"
            :code-theme="'atom'"
            @on-upload-img="handleUploadImg"
            placeholder="开始写作..."
        />
      </div>

      <!-- 设置抽屉 -->
      <el-drawer
          v-model="showSettings"
          title="文章设置"
          direction="rtl"
          size="400px"
      >
        <el-form :model="postForm" label-width="80px">
          <el-form-item label="摘要">
            <el-input
                v-model="postForm.summary"
                type="textarea"
                :rows="4"
                placeholder="请输入文章摘要..."
                maxlength="500"
                show-word-limit
            />
          </el-form-item>

          <el-form-item label="封面图">
            <el-upload
                class="cover-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
            >
              <img v-if="postForm.coverImage" :src="postForm.coverImage" class="cover-preview" />
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="分类">
            <el-select v-model="postForm.categoryIds" multiple placeholder="选择分类">
              <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="标签">
            <el-select
                v-model="postForm.tagIds"
                multiple
                filterable
                allow-create
                placeholder="选择或创建标签"
            >
              <el-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-drawer>
    </div>

    <!-- 快捷设置按钮 -->
    <el-button
        class="settings-fab"
        type="primary"
        circle
        @click="showSettings = true"
    >
      <el-icon><Setting /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPost, updatePost, getPostDetail, publishPost } from '@/api/post'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const publishing = ref(false)
const showSettings = ref(false)

// 文章表单
const postForm = reactive({
  title: '',
  content: '',
  summary: '',
  coverImage: '',
  categoryIds: [],
  tagIds: [],
  status: 0  // 0=草稿, 1=已发布
})

// 编辑器工具栏配置
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough',
  '-',
  'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList',
  '-',
  'codeRow', 'code', 'link', 'image', 'table',
  '-',
  'revoke', 'next',
  '=',
  'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview'
]

// 上传地址和请求头
const uploadUrl = computed(() => '/api/files/upload/image')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 模拟分类和标签数据（后续对接真实 API）
const categories = ref([
  { id: 1, name: '前端开发' },
  { id: 2, name: '后端开发' },
  { id: 3, name: '数据库' }
])

const tags = ref([
  { id: 1, name: 'Vue' },
  { id: 2, name: 'React' },
  { id: 3, name: 'JavaScript' },
  { id: 4, name: 'TypeScript' }
])

// 是否为编辑模式
const isEditMode = computed(() => !!route.params.id)

// 加载文章数据（编辑模式）
const loadPostData = async () => {
  if (!isEditMode.value) return

  try {
    const data = await getPostDetail(route.params.id)

    postForm.title = data.title
    postForm.content = data.content
    postForm.summary = data.summary || ''
    postForm.coverImage = data.coverImage || ''
    postForm.categoryIds = data.categoryIds || []
    postForm.tagIds = data.tagIds || []
    postForm.status = data.status
  } catch (error) {
    console.error('加载文章失败', error)
    ElMessage.error('加载文章失败')
    router.push('/my-posts')
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!postForm.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!postForm.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  saving.value = true
  try {
    const data = {
      ...postForm,
      status: 0  // 草稿
    }

    if (isEditMode.value) {
      await updatePost(route.params.id, data)
      ElMessage.success('草稿保存成功')
    } else {
      const res = await createPost(data)
      ElMessage.success('草稿保存成功')
      // 保存后切换到编辑模式
      router.replace(`/editor/${res}`)
    }
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  if (!postForm.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!postForm.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  try {
    await ElMessageBox.confirm(
        '确定要发布这篇文章吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    publishing.value = true

    const data = {
      ...postForm,
      status: 1  // 已发布
    }

    if (isEditMode.value) {
      await updatePost(route.params.id, data)
      await publishPost(route.params.id)
    } else {
      const res = await createPost(data)
      await publishPost(res)
    }

    ElMessage.success('发布成功')
    router.push('/my-posts')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败', error)
      ElMessage.error('发布失败')
    }
  } finally {
    publishing.value = false
  }
}

// 处理图片上传
const handleUploadImg = async (files, callback) => {
  const formData = new FormData()
  formData.append('file', files[0])

  try {
    const response = await fetch(uploadUrl.value, {
      method: 'POST',
      headers: uploadHeaders.value,
      body: formData
    })

    const result = await response.json()

    if (result.code === 200) {
      callback([result.data.fileUrl])
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (error) {
    console.error('图片上传失败', error)
    ElMessage.error('图片上传失败')
  }
}

// 封面图上传成功
const handleCoverSuccess = (response) => {
  if (response.code === 200) {
    postForm.coverImage = response.data.fileUrl
    ElMessage.success('封面上传成功')
  }
}

// 封面图上传前校验
const beforeCoverUpload = (file) => {
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

// 返回
const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadPostData()
})
</script>

<style scoped>
.post-editor-page {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 16px;
  align-items: center;
}

.title-input {
  flex: 1;
}

.title-input :deep(.el-input__inner) {
  font-size: 20px;
  font-weight: 500;
  border: none;
  box-shadow: none;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-main {
  flex: 1;
  overflow: hidden;
}

.editor-main :deep(.md-editor) {
  height: 100%;
  border: none;
}

.settings-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 封面上传样式 */
.cover-uploader {
  width: 100%;
}

.cover-uploader :deep(.el-upload) {
  width: 100%;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式 */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>