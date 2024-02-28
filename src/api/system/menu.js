import request from '@/utils/request'

export function getMenusTree(pid) {
  return request({
    url: 'menus/lazy?pid=' + pid,
    method: 'get'
  })
}

export function getMenus(params) {
  return request({
    url: 'menus/list',
    method: 'get',
    params
  })
}

export function getMenuSuperior(ids) {
  const data = Array.isArray(ids) || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: 'menus/superior',
    method: 'post',
    data
  })
}

export function getChild(id) {
  return request({
    url: 'menus/child?id=' + id,
    method: 'get'
  })
}

export function buildMenus() {
  return request({
    url: 'menus/build',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'menus/create',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'menus/delete',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'menus/update',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMenusTree, getMenuSuperior, getMenus, getChild }
