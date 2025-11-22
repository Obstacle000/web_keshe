<template>
  <div v-loading="loading">
    <!-- 头部操作按钮 ,采用prop和事件传递-->
    <main-header
        :selectIdList="selectTeacherIdList"
        @onAdd="addTeacher"
        @onDel="() => delTeacher('', selectTeacherIdList)"
        @onSearch="searchTeacher"
    />

    <!-- 教师表格 -->
    <el-table
        height="488"
        :data="tableData"
        style="width: 100%; margin-bottom: 12px"
        :header-cell-style="tableHeader"
        @select="selectTeacher"
        @select-all="selectAllTeacher"
    >
      <!-- 复选框列 -->
      <el-table-column type="selection" width="55"></el-table-column>

      <!-- 动态列渲染 -->
      <template v-for="(item, index) in columns" :key="index">
        <el-table-column
            :fixed="item.prop === 'handel' ? 'right' : null"
            :width="columnWidth(index)"
        >
          <template #header>
            <div :style="{ 'text-align': item.prop === 'handel' ? 'center' : '' }">
              {{ item.label }}
            </div>
          </template>

          <template #default="scope">
            <div v-if="item.prop !== 'handel'">
              <span v-if="item.prop === 'sex'">{{ getGender(scope.row[item.prop]) }}</span>
              <span v-else>{{ scope.row[item.prop] || '-' }}</span>
            </div>
            <div v-else style="text-align: center;">
              <el-button link type="primary" @click="delTeacher(scope.row)">删除</el-button>
              <el-button link type="primary" @click="editTeacher(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div style="display: flex; justify-content: center;">
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

    <!-- 添加/编辑老师弹窗 -->
    <teacher-info-dialog
        :type="dialogType"
        :dialogVisible="dialogVisible"
        :editTeacherInfo="editTeacherInfo"
        @closeDialog="closeDialog"
        @confirmDialog="confirmDialog"
    />
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from "vue";
import TeacherInfoDialog from "@/components/student/TeacherInfo/TeacherInfoDialog.vue";
import mainHeader from "@/components/baseComponents/mainHeader";
import {post} from "@/http/http";
import {api} from "@/http/api";

// loading
const loading = ref(true);

// 表头样式
const tableHeader = {height: '50px', lineHeight: '50px', fontSize: '16px'}

// 教师表格数据（永远数组）
const tableData = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const editTeacherInfo = ref({})

const total = ref(0)
const selectTeacherIdList = ref([])

const currentPage = ref(1)
const pageSize = ref(10)

// 表格列配置
const columns = reactive([
  {prop: 'id', label: '序号'},
  {prop: 'teacherId', label: '工号'},
  {prop: 'name', label: '姓名'},
  {prop: 'sex', label: '性别'},
  {prop: 'collegeName', label: '院系'},
  {prop: 'specialtyName', label: '专业'},
  {prop: 'phone', label: '联系方式'},
  {prop: 'handel', label: '操作'}
])

onMounted(() => {
  initTeacherList()
})

// 初始化表格数据
const initTeacherList = () => {
  loading.value = true
  post(api.getTeacherInfo, {pageNo: currentPage.value, pageSize: pageSize.value})
      .then(res => {
        if (res.code === 200) {
          tableData.value = Array.isArray(res.data.data) ? res.data.data : []
          total.value = res.data.total || 0
        }
      })
      .finally(() => {
        loading.value = false
      })
}

// 弹窗回调
const closeDialog = (e) => {
  dialogVisible.value = e.value
}

const confirmDialog = (e) => {
  dialogVisible.value = e.value
  initTeacherList()
}

// 添加老师
const addTeacher = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  editTeacherInfo.value = {}
}

// 编辑老师
const editTeacher = (row) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  editTeacherInfo.value = row
}

// 删除老师（自动兼容单删/多删）
const delTeacher = (row, list) => {
  list = list?.value ?? list  // 自动处理 ref

  ElMessageBox.confirm('确认删除?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'})
      .then(() => {
        const ids = list?.length ? list : [row.id]

        post(api.delTeacher, {ids}).then(res => {
          if (res.code === 200) {
            ElMessage.success('删除成功');
            selectTeacherIdList.value = [];
            initTeacherList()
          } else {
            ElMessage.error('删除失败')
          }
        })
      })
}

// 多选
const selectTeacher = (list) =>
    selectTeacherIdList.value = list?.map(i => i.id) || []

const selectAllTeacher = (list) => selectTeacher(list)

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  initTeacherList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val;
  initTeacherList()
}

// 性别显示
const getGender = (val) => (val === 1 || val === '1') ? '女' : '男'

// 列宽
const columnWidth = (index) => {
  if (index === 0 || index === 3) return '100'
  else if (index === 4) return '230'
  return '180'
}

// 搜索
const searchTeacher = (query) => {
  post(api.getTeacherByNameOrId, {q: query, pageNo: 1, pageSize: pageSize.value})
      .then(res => {
        if (res.code === 200) {
          tableData.value = Array.isArray(res.data) ? res.data : []
          total.value = res.total || 0
        } else {
          ElMessage.error(res.msg)
        }
      })
}
</script>

<script>
export default {
  name: 'TeacherInfo',
  components: {mainHeader}
}
</script>
