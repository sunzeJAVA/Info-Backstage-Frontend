<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input
              v-model="query.username"
              clearable
              size="small"
              placeholder="输入名称或者邮箱搜索"
              style="width: 200px;"
              class="filter-item"
              @keyup.enter.native="crud.toQuery"
            />
            <el-select
              v-model="query.status"
              clearable
              size="small"
              placeholder="状态"
              class="filter-item"
              style="width: 90px"
              @change="crud.toQuery"
            >
              <el-option
                v-for="item in enabledTypeOptions"
                :key="item.key"
                :label="item.display_name"
                :value="item.key"
              />
            </el-select>
            <rrOperation/>
          </div>
          <crudOperation show="" :permission="permission">
            <el-button
              slot="right"
              v-permission="['admin','user:add']"
              :disabled="crud.selections.length === 0"
              class="filter-item"
              size="mini"
              type="primary"
              icon="el-icon-refresh-left"
              @click="resetPwd(crud.selections)"
            >重置密码
            </el-button>
          </crudOperation>
        </div>
        <!--表单渲染-->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU"
                   :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
          <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="form.username" @keydown.native="keydown($event)"/>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input v-model.number="form.mobile"/>
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" @keydown.native="keydown($event)"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" @keydown.native="keydown($event)"/>
            </el-form-item>
            <el-form-item label="确认密码" prop="rePassword">
              <el-input v-model="form.rePassword" @keydown.native="keydown($event)"/>
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender" style="width: 178px">
                <el-radio label="M">男</el-radio>
                <el-radio label="F">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="1">激活</el-radio>
                <el-radio label="0">锁定</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="角色" prop="roles">
              <el-select
                v-model="roleDatas"
                style="width: 437px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteTag"
                @change="changeRole"
              >
                <el-option
                  v-for="item in allRoles"
                  :key="item.name"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
          </div>
        </el-dialog>
        <!--表格渲染-->
        <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;"
                  @selection-change="crud.selectionChangeHandler">
          <el-table-column :selectable="checkboxT" type="selection" width="55"/>
          <el-table-column :show-overflow-tooltip="true" prop="username" label="用户名"/>
          <el-table-column :show-overflow-tooltip="true" prop="realName" label="真实姓名"/>
          <el-table-column :show-overflow-tooltip="true" prop="roles" label="角色">
            <template slot-scope="scope">
              <el-tag v-for="item in scope.row.roles" :key="item.name">{{ item.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.gender === 'F'">女</el-tag>
              <el-tag v-if="scope.row.gender === 'M'">男</el-tag>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="mobile" width="100" label="电话"/>
          <el-table-column :show-overflow-tooltip="true" width="135" prop="email" label="邮箱"/>
          <el-table-column label="状态" align="center" prop="status">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :disabled="user.adminId === scope.row.id"
                active-color="#409EFF"
                inactive-color="#F56C6C"
                active-value=1
                inactive-value=0
                @change="changeEnabled(scope.row, scope.row.status)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建日期" width="135px" :formatter="dateFormatter"/>
          <el-table-column
            v-if="checkPer(['admin','user:edit','user:del'])"
            label="操作"
            width="115"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <udOperation
                :data="scope.row"
                :permission="permission"
                :disabled-dle="scope.row.userId === user.adminId"
              />
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudUser from '@/api/system/user'
import {getAll} from '@/api/system/role'
import CRUD, {presenter, header, form, crud} from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import {mapGetters} from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {toHumanDate} from "@/utils";
import {checkUserName} from '@/api/system/user'

let userRoles = []
const defaultForm = {
  id: null,
  username: null,
  realName: null,
  gender: 'M',
  email: null,
  password: null,
  rePassword: null,
  status: 0,
  roles: [],
  mobile: null
}
export default {
  name: 'User',
  components: {crudOperation, rrOperation, udOperation, pagination},
  cruds() {
    return CRUD({title: '用户', url: 'admin/list', crudMethod: {...crudUser}})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['user_status'],
  data() {
    // 自定义验证
    const validPassword = (rule, value, callback) => {
      if (!value && this.submitType === 1) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    };
    const validRePassword = (rule, value, callback) => {
      if (!value && this.submitType === 1) {
        callback(new Error('请输入确认密码'))
      } else if (this.form.password !== value) {
        callback(new Error('两次密码输入不相同'))
      } else {
        callback()
      }
    };
    const validUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
      } else {
        checkUserName(value).then(res => {
          if (res) {
            callback(new Error('用户已存在'))
          } else {
            callback()
          }
        })
      }
    };
    return {
      height: document.documentElement.clientHeight - 180 + 'px;',
      defaultProps: {children: 'children', label: 'name', isLeaf: 'leaf'},
      allRoles: [],
      rePassword: '',
      roleDatas: [],
      submitType: '',
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        {key: '1', display_name: '激活'},
        {key: '0', display_name: '锁定'}
      ],
      rules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'},
          {trigger: 'blur', validator: validUsername}
        ],
        realName: [
          {required: true, message: '请输入用户昵称', trigger: 'blur'},
          {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱地址', trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
        ],
        rePassword: [
          {trigger: 'blur', validator: validRePassword}
        ],
        password: [
          {trigger: 'blur', validator: validPassword}
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'roles'
    ])
  },
  created() {
    if (this.form.password === '') {
      this.crud.msg.add = '新增成功,默认密码为123456'
    } else {
      this.crud.msg.add = '新增成功'
    }
  },
  mounted: function () {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    // 禁止输入空格
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    changeRole(value) {
      userRoles = []
      value.forEach(function (data, index) {
        const role = {id: data}
        userRoles.push(role)
      })
    },
    deleteTag(value) {
      userRoles.forEach(function (data, index) {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      if(crud.status.add === 1) {
        this.submitType = 1
      }else {
        this.submitType = 0
      }
      this.getRoles()
      form.status = form.status.toString()
    },
    // 新增前将多选的值设置为空
    [CRUD.HOOK.beforeToAdd]() {
      this.roleDatas = []
    },
    // 初始化编辑时候的角色与岗位
    [CRUD.HOOK.beforeToEdit](crud, form) {
      this.roleDatas = []
      userRoles = []
      const _this = this
      form.roles.forEach(function (role, index) {
        _this.roleDatas.push(role.id)
        const rol = {id: role.id}
        userRoles.push(rol)
      })
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (this.roleDatas.length === 0) {
        this.$message({
          message: '角色不能为空',
          type: 'warning'
        })
        return false
      }
      crud.form.roles = userRoles
      return true
    },
    // 改变状态
    changeEnabled(data, val) {
      console.log(data,val)
      let msg = '';
      if (val === '1') {
        msg = '激活';
      } else {
        msg = '禁用';
      }
      this.$confirm('此操作将 "' + msg + '" ' + data.username + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudUser.edit(data).then(res => {
          this.crud.notify(msg + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.status = !data.status
        })
      }).catch(() => {
        data.status = !data.status
      })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll().then(res => {
        this.allRoles = res
      }).catch(() => {
      })
    },
    checkboxT(row, rowIndex) {
      return this.roles.includes("user:edit", 0)
    },
    resetPwd(datas) {
      this.$confirm(`你选中了 ${datas.length} 位用户，确认重置用户的密码吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        datas.forEach(val => {
          ids.push(val.id)
        })
        console.log(ids)
        crudUser.resetPwd(ids).then(() => {
          this.crud.notify('重置成功, 用户新密码:123456', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
        })
      }).catch(() => {
      })
    },
    dateFormatter(row, column) {
      return toHumanDate(row.createdAt)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .vue-treeselect__control, ::v-deep .vue-treeselect__placeholder, ::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}
</style>
