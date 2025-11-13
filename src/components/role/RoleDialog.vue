<template>
  <el-dialog v-model="dialogVisible" title="角色编辑" width="600px" :before-close="closeDialog">
    <el-form :model="roleForm" :rules="roleFormRules" ref="roleFormRef" label-width="80px">

      <!-- 角色名称 -->
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
      </el-form-item>

      <!-- 角色描述 -->
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="roleForm.description" placeholder="请输入描述" />
      </el-form-item>

      <!-- 权限树 -->
      <el-form-item label="权限" prop="permissions">
        <el-tree
            ref="treeRef"
            :data="permissionTree"
            node-key="id"
            show-checkbox
            default-expand-all
            :default-checked-keys="checkedPermissions"
            :props="treeProps"
            highlight-current
        />
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="saveRole">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { get, post } from '@/http/http'
import { api } from '@/http/api'

const props = defineProps({
  type: String, // 'add' | 'edit'
  dialogVisible: Boolean,
  editRole: Object // 编辑时传入的角色信息
})

const $emit = defineEmits(['closeDialog', 'confirmDialog'])

let dialogVisible = ref(false)
let roleFormRef = ref(null)
let treeRef = ref(null)

const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  permissions: [] // 最终勾选的权限ID
})

const roleFormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 权限树数据
let permissionTree = ref([])
let checkedPermissions = ref([])

const treeProps = {
  children: 'children',
  label: 'name'
}

// 监听父组件 dialogVisible
watch(() => props.dialogVisible, val => {
  dialogVisible.value = val
  if (val && props.editRole && Object.keys(props.editRole).length) {
    // 编辑模式
    Object.assign(roleForm, props.editRole)
    checkedPermissions.value = props.editRole.permissions || []
  } else {
    // 新增模式
    Object.assign(roleForm, { id: null, name: '', description: '', permissions: [] })
    checkedPermissions.value = []
  }
})

// 页面加载获取权限树
onMounted(() => {
  getPermissions()
})

const getPermissions = () => {
  get(api.getAllPermissions).then(res => {
    if (res.data) permissionTree.value = res.data
  })
}

const saveRole = () => {
  // 获取勾选的权限ID
  roleForm.permissions = treeRef.value.getCheckedKeys()

  roleFormRef.value.validate(async (valid) => {
    if (!valid) return

    let url = props.type === 'add' ? api.addRole : api.updateRole
    post(url, roleForm).then(res => {
      if (res.code === 200) {
        ElMessage({ message: props.type === 'add' ? '新增成功' : '修改成功', type: 'success' })
        closeDialog()
        $emit('confirmDialog')
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    }).catch(err => {
      console.error(err)
      ElMessage.error('请求失败')
    })
  })
}

const closeDialog = () => {
  dialogVisible.value = false
  $emit('closeDialog')
}
</script>
<script>
export default {
  name: "RoleDialog"
}
</script>