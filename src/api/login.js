import request from '@/utils/request'

export function login(account, password, uuid) {
  return request({
    url: 'admin/login',
    method: 'post',
    data: {
      account,
      password,
      uuid
    }
  })
}

export function getInfo() {
  return request({
    url: 'auth/info',
    method: 'get'
  })
}

export function getCodeImg() {
  return request({
    url: 'auth/code',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: 'auth/logout',
    method: 'delete'
  })
}
