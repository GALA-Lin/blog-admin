import request from './request'

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export const login = (data) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

/**
 * 用户注册
 * @param {Object} data - { username, email, password, confirmPassword, nickname }
 */
export const register = (data) => {
    return request({
        url: '/auth/register',
        method: 'post',
        data
    })
}

/**
 * 用户登出
 */
export const logout = () => {
    return request({
        url: '/auth/logout',
        method: 'post'
    })
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
    return request({
        url: '/auth/profile',
        method: 'get'
    })
}

/**
 * 更新用户信息
 * @param {Object} data - { nickname, bio, avatarUrl }
 */
export const updateProfile = (data) => {
    return request({
        url: '/auth/profile',
        method: 'put',
        data
    })
}

/**
 * 修改密码
 * @param {Object} data - { oldPassword, newPassword, confirmPassword }
 */
export const changePassword = (data) => {
    return request({
        url: '/auth/password',
        method: 'put',
        data
    })
}

/**
 * 检查用户名是否可用
 * @param {String} username
 */
export const checkUsername = (username) => {
    return request({
        url: '/auth/check-username',
        method: 'get',
        params: { username }
    })
}