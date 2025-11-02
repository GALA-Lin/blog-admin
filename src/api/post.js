import request from './request'

/**
 * 获取文章列表
 * @param {Object} params - { page, size, status }
 */
export const getPostList = (params) => {
    return request({
        url: '/posts',
        method: 'get',
        params
    })
}

/**
 * 获取文章详情
 * @param {Number} id - 文章ID
 */
export const getPostDetail = (id) => {
    return request({
        url: `/posts/${id}`,
        method: 'get'
    })
}

/**
 * 创建文章
 * @param {Object} data - 文章数据
 */
export const createPost = (data) => {
    return request({
        url: '/posts',
        method: 'post',
        data
    })
}

/**
 * 更新文章
 * @param {Number} id - 文章ID
 * @param {Object} data - 文章数据
 */
export const updatePost = (id, data) => {
    return request({
        url: `/posts/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除文章
 * @param {Number} id - 文章ID
 */
export const deletePost = (id) => {
    return request({
        url: `/posts/${id}`,
        method: 'delete'
    })
}

/**
 * 发布文章
 * @param {Number} id - 文章ID
 */
export const publishPost = (id) => {
    return request({
        url: `/posts/${id}/publish`,
        method: 'put'
    })
}