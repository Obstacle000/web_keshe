<!--
@name: 用户管理页
@author: newhome
@time: 2023-03-01 10:21:51
-->
<template>
  <div>
    <main-header @onAdd="createAdmin" @onSearch="onSearch"/>

    <el-table
        height="488"
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :header-cell-style="tableHeader">
      <!--使用prop作为键值，是避免列表间距重复点击时变大-->
      <template v-for="item in options" :key="item.prop">
        <el-table-column :fixed="item.prop==='handel'?'right':null" :min-width="item.width">
          <template #header>
            <div :style="{'text-align':item.prop==='handel'?'center':''}">{{ item.label }}</div>
          </template>
          <template #default="scope">
            <div v-if="item.prop !== 'handel'">
              <span v-if="scope.row[item.prop] !== ''&&scope.row[item.prop] !== null">
                <el-switch v-if="item.switch" v-model="scope.row.status1" @change="onChange(scope.row)"/>
                <span v-else>{{ scope.row[item.prop] }}</span>
              </span>
              <span v-else>-</span>
            </div>
            <div v-else style="text-align: center;">
              <el-button link type="primary" @click="onDel(scope.row)">删除</el-button>
              <el-button link type="primary" @click="onEdit(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <admin-edit-dialog
        :type="dialogType"
        :dialogVisible="dialogVisible"
        :editObj="editObj"
        @closeDialog="closeDialog"
        @confirmDialog="confirmDialog"
    />

    <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />

  </div>
</template>

<script setup>
import {post} from "@/http/http";
import {api} from "@/http/api";
import {onMounted, reactive, ref, watch} from "vue";
import {getNameByRoleId, getStatusOfRole} from "@/utils/tools";

// 表头样式
const tableHeader = {
  height: '50px',
  lineHeight: '50px',
  fontSize: '16px'
}
// 表格数据
let tableData = ref([])
const options = reactive([
  {prop: 'id', label: 'ID', width: 100},
  {prop: 'userName', label: '账号', width: 120},
  {prop: 'role1', label: '角色权限', width: 120},
  {prop: 'status', switch: true, label: '状态', width: 100},
  {prop: 'createTime', label: '创建时间', width: 180},
  {prop: 'updateTime', label: '更新时间', width: 180},
  {prop: 'handel', label: '操作', width: 180}
])
// 数据总条数
let total = ref(0)
// 弹窗的类型，默认为新增班级弹窗
let dialogType = ref('add')
// 显示新增信息弹窗
let dialogVisible = ref(false)
let editObj = ref({})
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
let loading = ref(true)

watch(() => tableData.value, (newVal) => {
  if (newVal) {
    loading.value = false
  }
})


onMounted(() => {
  initData()
})

const initData = () => {
  loading.value = true
  post(api.admin.getAdminInfo, { pageNo: currentPage.value, pageSize: pageSize.value })
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.data || []
          list.forEach(item => {
            // 用 userType 映射成中文
            switch(item.userType) {
              case 2:
                item.role1 = '管理员'
                break
              case 1:
                item.role1 = '学生'
                break
              case 3:
                item.role1 = '教师'
                break;
              default:
                item.role1 = '未知角色'
            }
            // 状态处理
            item.status1 = getStatusOfRole(item.status)
          })
          tableData.value = list
          total.value = res.data.total || 0
        } else {
          tableData.value = []
          total.value = 0
        }
      })
      .finally(() => {
        loading.value = false
      })
}



/** 删除管理员 */
const onDel = (e) => {
  ElMessageBox.confirm('此为删除操作, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    post(api.admin.delAdmin, {ids: e.id}).then(res => {
      if (res.code === 200) {
        ElMessage({message: '删除成功', type: 'success'})
        initData()
      } else {
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
  })
}
/** 点击添加管理员 */
const createAdmin = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  editObj.value = {}
}
/** 编辑单行 */
const onEdit = (e) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  editObj.value = e
}

/** 获取弹窗子组件 */
function closeDialog(e) {
  dialogVisible.value = e
}

/** 点击确定，关闭弹窗 */
function confirmDialog(e) {
  dialogVisible.value = e
  initData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  initData()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  initData()
}
const onChange = (row) => {
  // row.status1 是开关的布尔值，true表示启用，false表示禁用
  const newStatus = row.status1 ? 1 : 0;

  post(api.updateSta, { id: row.id, status: newStatus })
      .then(res => {
        if (res.code === 200) {
          ElMessage({
            message: `用户 ${row.userName} 已${newStatus === 1 ? '启用' : '禁用'}`,
            type: 'success'
          });
        } else {
          // 如果接口失败，把开关状态恢复
          row.status1 = !row.status1;
          ElMessage.error('状态更新失败');
        }
      })
      .catch(err => {
        // 请求失败，把开关状态恢复
        row.status1 = !row.status1;
        console.error(err);
        ElMessage.error('请求失败');
      });
};


/** 模糊搜索 */
const onSearch = (e) => {
  const param = {
    q: e,
    pageNo: 1,
    pageSize: pageSize.value
  }
  post(api.admin.getAdminInfo, param)
      .then(res => {
        if (res.code === 200 && res.data) {
          const list = res.data.data || []
          list.forEach(item => {
            // userType 映射中文角色
            switch(item.userType) {
              case 1:
                item.role1 = '普通用户'
                break
              case 2:
                item.role1 = '管理员'
                break
              default:
                item.role1 = '未知角色'
            }
            // 状态处理
            item.status1 = getStatusOfRole(item.status)
          })
          tableData.value = list
          total.value = res.data.total || 0
        } else {
          tableData.value = []
          total.value = 0
        }
      })
      .finally(() => {
        loading.value = false
      })
}
</script>

<script>
import mainHeader from "@/components/baseComponents/mainHeader";
import AdminEditDialog from "@/components/admin/AdminEditDialog.vue";

export default {
  name: "AdminInfo",
  components: {
    mainHeader,
    AdminEditDialog
  }
}
</script>

