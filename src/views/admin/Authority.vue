<template>
  <div>
    <el-button type="primary" @click="openRoleDialog('add')">新增角色</el-button>

    <el-table :data="roleList" style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="角色名称"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openRoleDialog('edit', scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRole(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗组件 -->
    <role-dialog
        :type="dialogType"
        :dialog-visible="dialogVisible"
        :edit-role="editRole"
        @closeDialog="dialogVisible=false"
        @confirmDialog="getRoles"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get, post } from '@/http/http'
import { api } from '@/http/api'
import RoleDialog from '@/components/role/RoleDialog.vue'

let roleList = ref([])
let dialogVisible = ref(false)
let dialogType = ref('add')
let editRole = ref({})

onMounted(() => {
  getRoles()
})

const getRoles = () => {
  get(api.getAllRoles).then(res => {
    if (res.data) roleList.value = res.data
  })
}

const openRoleDialog = (type, role = {}) => {
  dialogType.value = type
  editRole.value = type === 'edit' ? role : {}
  dialogVisible.value = true
}

const deleteRole = (id) => {
  post(api.deleteRole, { id }).then(res => {
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getRoles()
    } else {
      ElMessage.error('删除失败')
    }
  })
}
</script>
