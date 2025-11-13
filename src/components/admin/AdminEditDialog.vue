<!--
@name: 管理员信息编辑弹窗
@description: 创建、编辑管理员信息
@author: newhome
@time: 2023-05-23 17:42:25
-->
<template>
  <div>
    <el-dialog v-model="dialogVisible" @close="closeDialog" title="编辑管理员信息" width="550">
      <el-form
          ref="myFormRef"
          :model="myForm"
          :rules="myFormRules"
          label-position="left"
          label-width="80px">

        <el-form-item label="账号名称" prop="name">
          <el-input v-model="myForm.name" :disabled="type === 'edit'"/>
        </el-form-item>


        <el-form-item label="登陆密码" prop="password" v-if="type==='add'">
          <el-input v-model="myForm.password"/>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="myForm.role" placeholder="请选择角色">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"/>
          </el-select>
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="confirmAdd">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, onMounted, watch} from "vue";
import {get, post} from "@/http/http";
import {api} from "@/http/api";
import {storagekey} from "@/utils/constants";

// 声明props
const props = defineProps({
  type: {
    type: String
  },
  dialogVisible: {
    type: Boolean
  },
  editObj: {
    type: Object
  }
})
// 声明emits
const $emit = defineEmits(['closeDialog', 'confirmDialog'])

let dialogVisible = ref(false)

// data
// 添加信息form
const baseInfo = {
  id: null,
  name: '',
  password: '',
  role: ''
}

let myForm = ref(JSON.parse(JSON.stringify(baseInfo)))

// form校验标准
const myFormRules = reactive({
  name: [{required: true, message: '请输入账号名称', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}],
  role: [{required: true, message: '请选择角色', trigger: 'blur'}]
})

let roleList = ref([
      {
        "id": 1,
        "roleName": "STUDENT",
        "description": "学生",
        "createTime": "2025-11-11T13:00:00",
        "updateTime": "2025-11-11T13:00:00"
      },
      {
        "id": 2,
        "roleName": "ADMIN",
        "description": "管理员",
        "createTime": "2025-11-11T13:00:00",
        "updateTime": "2025-11-11T13:00:00"
      },
    {
      "id": 3,
      "roleName": "TEACHER",
      "description": "教师",
      "createTime": "2025-11-11T13:00:00",
      "updateTime": "2025-11-11T13:00:00"
    }
    ]
) // 角色列表
let myFormRef = ref(null) // form表单实例

// 监听
watch(() => props.dialogVisible, (newVal) => {
  dialogVisible.value = newVal
  if (dialogVisible.value && Object.keys(props.editObj).length) {
    myForm.value.id = props.editObj.id   // 关键：加上 id
    myForm.value.name = props.editObj.userName || ''
    myForm.value.password = '' // 编辑不显示密码
    myForm.value.role = props.editObj.role || ''
  } else {
    myForm.value = JSON.parse(JSON.stringify(baseInfo))
  }
})



onMounted(() => {
  initData()
})

// methods
const initData = () => {

  /*post(api.admin.getRoleList).then(res => {
    const data = res.data
    if (data && data.length) {
      roleList.value = data
    }
  }).catch(err => {
    console.error(err);
  })*/
}

/** 关闭dialog弹窗 */
const closeDialog = (row) => {
  dialogVisible.value = false
  $emit('closeDialog', false)
}
/** 点击弹窗的确定按钮 */
const confirmAdd = () => {
  myFormRef.value.validate((valid) => {
    if (!valid) return

    let url = api.admin.addAdmin

    let param = { ...myForm.value }

    if (props.type === 'add') {
      delete param.id // <- 关键
      param.currentRole = 2
    } else {
      // 编辑时，只保留可以修改的字段，不修改用户名和密码
      param.id = myForm.value.id
      delete param.password
      delete param.userName

    }

    post(url, param).then(res => {
      if (res.code === 200) {
        dialogVisible.value = false
        $emit('confirmDialog', false)
        myForm.value = JSON.parse(JSON.stringify(baseInfo))
        ElMessage({
          message: props.type === 'add' ? '新增成功' : '修改成功',
          type: 'success'
        })
      } else {
        ElMessage.error(props.type === 'add' ? '新增失败' : '修改失败')
      }
    }).catch(err => {
      console.error(err)
      ElMessage.error('请求失败')
    })
  })
}
</script>

<script>
export default {
  name: "AdminEditDialog"
}
</script>
