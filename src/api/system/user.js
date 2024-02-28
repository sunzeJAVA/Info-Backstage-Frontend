import request from '@/utils/request'
import { encrypt } from '@/utils/rsaEncrypt'

export function add(data) {
  return request({
    url: 'admin/add',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'admin/delete',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'admin/update',
    method: 'post',
    data
  })
}

export function editUser(data) {
  return request({
    url: 'api/users/center',
    method: 'put',
    data
  })
}

export function updatePass(user) {
  const data = {
    oldPass: encrypt(user.oldPass),
    newPass: encrypt(user.newPass)
  }
  return request({
    url: 'api/users/updatePass/',
    method: 'post',
    data
  })
}

export function resetPwd(ids) {
  return request({
    url: 'admin/resetPwd',
    method: 'put',
    data: ids
  })
}

export function checkUserName(userName) {
  const params = {
    userName
  }
  return request({
    url: 'admin/checkUserName',
    method: 'get',
    params
  })
}

export function updateEmail(form) {
  const data = {
    password: encrypt(form.pass),
    email: form.email
  }
  return request({
    url: 'api/users/updateEmail/' + form.code,
    method: 'post',
    data
  })
}

export default { add, edit, del, resetPwd }

