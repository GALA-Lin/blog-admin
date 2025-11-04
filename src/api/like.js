import request from './request'

/**
 * 切换文章点赞状态
 * @param {Number} postId
 */
export const togglePostLike = (postId) => {
    return request({
        url: `/likes/post/${postId}/toggle`,
        method: 'put'
    })
}

/**
 * 检查文章点赞状态
 * @param {Number} postId
 */
export const checkPostLike = (postId) => {
    return request({
        url: `/likes/post/${postId}/check`,
        method: 'get'
    })
}

/**
 * 批量检查文章点赞状态
 * @param {Array} postIds
 */
export const batchCheckPostLikes = (postIds) => {
    return request({
        url: '/likes/posts/batch-check',
        method: 'post',
        data: postIds
    })
}

/**
 * 切换评论点赞状态
 * @param {Number} commentId
 */
export const toggleCommentLike = (commentId) => {
    return request({
        url: `/likes/comment/${commentId}/toggle`,
        method: 'put'
    })
}