import request from './request'

/**
 * 创建评论
 * @param {Object} data - { postId, content, parentId, replyToUserId }
 */
export const createComment = (data) => {
    return request({
        url: '/comments',
        method: 'post',
        data
    })
}

/**
 * 获取文章评论列表
 * @param {Number} postId
 * @param {Object} params - { pageNum, pageSize, sortBy, sortOrder }
 */
export const getPostComments = (postId, params) => {
    return request({
        url: `/comments/post/${postId}`,
        method: 'get',
        params
    })
}

/**
 * 获取评论树（嵌套结构）
 * @param {Number} postId
 */
export const getCommentTree = (postId) => {
    return request({
        url: `/comments/post/${postId}/tree`,
        method: 'get'
    })
}

/**
 * 更新评论
 * @param {Number} id
 * @param {Object} data - { content }
 */
export const updateComment = (id, data) => {
    return request({
        url: `/comments/${id}`,
        method: 'put',
        data: { ...data, id }
    })
}

/**
 * 删除评论
 * @param {Number} id
 */
export const deleteComment = (id) => {
    return request({
        url: `/comments/${id}`,
        method: 'delete'
    })
}

/**
 * 获取我的评论列表
 * @param {Object} params - { pageNum, pageSize }
 */
export const getMyComments = (params) => {
    return request({
        url: '/comments/my',
        method: 'get',
        params
    })
}

/**
 * 获取评论数量
 * @param {Number} postId
 */
export const getCommentCount = (postId) => {
    return request({
        url: `/comments/post/${postId}/count`,
        method: 'get'
    })
}