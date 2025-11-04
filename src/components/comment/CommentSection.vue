<template>
  <div class="comment-section">
    <!-- 评论输入框 -->
    <div class="comment-editor" v-if="authStore.isLoggedIn">
      <el-avatar :size="40" :src="authStore.avatar">
        {{ authStore.nickname?.charAt(0) }}
      </el-avatar>
      <div class="editor-wrapper">
        <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
        />
        <div class="editor-actions">
          <el-button @click="commentContent = ''">取消</el-button>
          <el-button
              type="primary"
              @click="handleSubmitComment"
              :loading="submitting"
              :disabled="!commentContent.trim()"
          >
            发表评论
          </el-button>
        </div>
      </div>
    </div>

    <div class="login-tip" v-else>
      <el-text>请先 <el-link type="primary" @click="goToLogin">登录</el-link> 后再评论</el-text>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-loading="loading">
      <div class="comment-header">
        <h3>全部评论 ({{ total }})</h3>
        <el-select v-model="sortBy" @change="loadComments" size="small" style="width: 120px">
          <el-option label="最新" value="created_at" />
          <el-option label="最热" value="like_count" />
        </el-select>
      </div>

      <!-- 评论项 -->
      <div
          class="comment-item"
          v-for="comment in commentList"
          :key="comment.id"
      >
        <el-avatar :size="40" :src="comment.author?.avatarUrl">
          {{ comment.author?.nickname?.charAt(0) }}
        </el-avatar>

        <div class="comment-content">
          <div class="comment-header-info">
            <span class="author-name">{{ comment.author?.nickname }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>

          <div class="comment-text">{{ comment.content }}</div>

          <div class="comment-actions">
            <el-button
                text
                size="small"
                @click="handleLikeComment(comment)"
                :type="comment.isLiked ? 'primary' : 'default'"
            >
              <el-icon><Star /></el-icon>
              {{ comment.likeCount > 0 ? comment.likeCount : '点赞' }}
            </el-button>

            <el-button text size="small" @click="handleReply(comment)">
              <el-icon><ChatDotRound /></el-icon>
              回复
            </el-button>

            <el-button
                text
                size="small"
                type="danger"
                v-if="comment.isAuthor"
                @click="handleDeleteComment(comment.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>

          <!-- 回复列表 -->
          <div class="reply-list" v-if="comment.children && comment.children.length > 0">
            <div
                class="reply-item"
                v-for="reply in comment.children"
                :key="reply.id"
            >
              <el-avatar :size="32" :src="reply.author?.avatarUrl">
                {{ reply.author?.nickname?.charAt(0) }}
              </el-avatar>

              <div class="reply-content">
                <div class="reply-header">
                  <span class="author-name">{{ reply.author?.nickname }}</span>
                  <span v-if="reply.replyToUser" class="reply-to">
                    回复 <span class="reply-to-name">@{{ reply.replyToUser?.nickname }}</span>
                  </span>
                  <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                </div>

                <div class="reply-text">{{ reply.content }}</div>

                <div class="reply-actions">
                  <el-button
                      text
                      size="small"
                      @click="handleLikeComment(reply)"
                      :type="reply.isLiked ? 'primary' : 'default'"
                  >
                    <el-icon><Star /></el-icon>
                    {{ reply.likeCount > 0 ? reply.likeCount : '' }}
                  </el-button>

                  <el-button text size="small" @click="handleReply(reply, comment)">
                    <el-icon><ChatDotRound /></el-icon>
                    回复
                  </el-button>

                  <el-button
                      text
                      size="small"
                      type="danger"
                      v-if="reply.isAuthor"
                      @click="handleDeleteComment(reply.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复输入框 -->
          <div class="reply-editor" v-if="replyingTo?.id === comment.id">
            <el-input
                v-model="replyContent"
                type="textarea"
                :rows="2"
                :placeholder="`回复 @${replyingTo.author?.nickname}`"
                maxlength="500"
                show-word-limit
            />
            <div class="reply-editor-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button
                  size="small"
                  type="primary"
                  @click="handleSubmitReply"
                  :loading="submitting"
                  :disabled="!replyContent.trim()"
              >
                发表
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && commentList.length === 0" description="暂无评论" />
    </div>

    <!-- 分页 -->
    <div class="comment-pagination" v-if="total > pageSize">
      <el-pagination
          v-model:current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadComments"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createComment, getCommentTree, deleteComment } from '@/api/comment'
import { toggleCommentLike } from '@/api/like'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const commentList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const sortBy = ref('created_at')

const commentContent = ref('')
const replyContent = ref('')
const replyingTo = ref(null)
const replyingToRoot = ref(null)

// 加载评论
const loadComments = async () => {
  loading.value = true
  try {
    // 使用评论树接口获取嵌套结构
    const data = await getCommentTree(props.postId)
    commentList.value = data
    total.value = data.length
  } catch (error) {
    console.error('加载评论失败', error)
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).fromNow()
}

// 发表评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) return

  submitting.value = true
  try {
    await createComment({
      postId: props.postId,
      content: commentContent.value.trim()
    })

    ElMessage.success('评论成功')
    commentContent.value = ''
    loadComments()
  } catch (error) {
    console.error('评论失败', error)
    ElMessage.error('评论失败')
  } finally {
    submitting.value = false
  }
}

// 回复评论
const handleReply = (comment, rootComment = null) => {
  replyingTo.value = comment
  replyingToRoot.value = rootComment || comment
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyingToRoot.value = null
  replyContent.value = ''
}

// 发表回复
const handleSubmitReply = async () => {
  if (!replyContent.value.trim()) return

  submitting.value = true
  try {
    await createComment({
      postId: props.postId,
      content: replyContent.value.trim(),
      parentId: replyingTo.value.id,
      replyToUserId: replyingTo.value.author.id
    })

    ElMessage.success('回复成功')
    cancelReply()
    loadComments()
  } catch (error) {
    console.error('回复失败', error)
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 点赞评论
const handleLikeComment = async (comment) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const result = await toggleCommentLike(comment.id)
    comment.isLiked = result
    comment.likeCount += result ? 1 : -1
  } catch (error) {
    console.error('点赞失败', error)
    ElMessage.error('操作失败')
  }
}

// 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      type: 'warning'
    })

    await deleteComment(commentId)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}

// 跳转登录
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
}

.comment-editor {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.editor-wrapper {
  flex: 1;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.login-tip {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 24px;
}

.comment-list {
  margin-top: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comment-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #e4e7ed;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.reply-list {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
}

.reply-to {
  color: #909399;
}

.reply-to-name {
  color: #409eff;
  font-weight: 500;
}

.reply-time {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.reply-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 6px;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.reply-editor {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.reply-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.comment-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-item,
  .reply-item {
    flex-direction: column;
  }
}
</style>