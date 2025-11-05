import request from './request'

/**
 * 收藏文章
 * @param {Object} data - { postId, folderId, notes }
 */
export const favoritePost = (data) => {
    return request({
        url: '/favorites',
        method: 'post',
        data
    })
}

/**
 * 取消收藏文章
 * @param {Number} postId
 */
export const unfavoritePost = (postId) => {
    return request({
        url: `/favorites/post/${postId}`,
        method: 'delete'
    })
}

/**
 * 切换收藏状态
 * @param {Number} postId
 * @param {Number} folderId - 收藏夹ID（可选）
 */
export const toggleFavorite = (postId, folderId = null) => {
    return request({
        url: `/favorites/post/${postId}/toggle`,
        method: 'put',
        params: { folderId }
    })
}

/**
 * 检查文章收藏状态
 * @param {Number} postId
 */
export const checkFavorite = (postId) => {
    return request({
        url: `/favorites/post/${postId}/check`,
        method: 'get'
    })
}

/**
 * 批量检查文章收藏状态
 * @param {Array} postIds
 */
export const batchCheckFavorites = (postIds) => {
    return request({
        url: '/favorites/posts/batch-check',
        method: 'post',
        data: postIds
    })
}

/**
 * 获取我的收藏列表
 * @param {Object} params - { folderId, pageNum, pageSize, sortBy, sortOrder }
 */
export const getMyFavorites = (params) => {
    return request({
        url: '/favorites/my',
        method: 'get',
        params
    })
}

/**
 * 获取我的收藏夹列表
 */
export const getMyFolders = () => {
    return request({
        url: '/favorites/folders/my',
        method: 'get'
    })
}

/**
 * 创建收藏夹
 * @param {Object} data - { name, description, isPublic, sortOrder }
 */
export const createFolder = (data) => {
    return request({
        url: '/favorites/folders',
        method: 'post',
        data
    })
}

/**
 * 更新收藏夹
 * @param {Number} id
 * @param {Object} data
 */
export const updateFolder = (id, data) => {
    return request({
        url: `/favorites/folders/${id}`,
        method: 'put',
        data: { ...data, id }
    })
}

/**
 * 删除收藏夹
 * @param {Number} id
 */
export const deleteFolder = (id) => {
    return request({
        url: `/favorites/folders/${id}`,
        method: 'delete'
    })
}

/**
 * 批量移动收藏
 * @param {Object} data - { favoriteIds, targetFolderId }
 */
export const batchMoveFavorites = (data) => {
    return request({
        url: '/favorites/batch-move',
        method: 'put',
        data
    })
}