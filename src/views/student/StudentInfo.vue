<template>
<!--v-loading 控制加载动画  -->
  <div v-loading="loading">
    <main-header
        :selectIdList="selectStuIdList"
        @onAdd="addStu"
        @onDel="delStu('', selectStuIdList)"
        @onSearch="searchStu"/>

    <el-table height="488" :data="tableData" style="width: 100%;margin-bottom: 12px" :header-cell-style="tableHeader" @select="selectStu"
              @select-all="selectAllStu">
<!--      第一列是复选框-->
      <el-table-column type="selection" width="55" style="padding-left: -10px"></el-table-column>
<!--这儿开始渲染数据-->
      <template v-for="(item, index) in options" :key="index">
<!-- fixed="right" 的意思：这一列固定在表格最右边的位置，无论你水平滚动表格内容，它都会一直显示在右边-->
        <el-table-column :fixed="item.prop==='handel'?'right':null" :width="columnWidth(index)">
          <template #header>
<!--表头文字的显示,如果是操作列，文字居中；其他列默认靠左-->
            <div :style="{'text-align':item.prop==='handel'?'center':''}">{{ item.label }}</div>
          </template>
          <template #default="scope">
            <div v-if="item.prop !== 'handel'">
<!--如果这一列是 sex（性别列），调用 getSex 函数，把 1/0 转成 男/女 显示。              -->
              <span v-if="item.prop==='sex'">{{ getSex(scope.row[item.prop]) }}</span>
              <span v-else>
                <span v-if="scope.row[item.prop] !== ''&&scope.row[item.prop] !== null">
                  {{ scope.row[item.prop] }}
                </span>
                <span v-else>-</span>
              </span>
            </div>
            <div v-else style="text-align: center;">
              <el-button link type="primary" @click="delStu(scope.row)">删除</el-button>
              <el-button link type="primary" @click="editStu(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>

<!--使用 flex 布局把分页组件 水平居中。-->
    <div style="display: flex;justify-content: center;">
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :key="new Date().getTime()"
      />
    </div>

    <!--新增学生信息弹窗,这个是子组件标签,详情看笔记组合式API的父子通信-->
<!--    就比如是子组件通过emit("confirmDialog(对应左边的,右边是方法名)","信息"),然后父组件接受就知道表单已经填完了,直接关闭窗口刷新-->
<!--    Vue 组件名在模板里会被自动转成 kebab-case（短横线命名）。-->
    <student-info-dialog
        :type="dialogType"
        :dialogVisible="dialogVisible"
        :editStuInfo="editStuInfo"
        @closeDialog="closeDialog"
        @confirmDialog="confirmDialog"
    />
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import StudentInfoDialog from "@/components/student/StudentInfo/StudentInfoDialog";
import {post} from "@/http/http";
import {api} from "@/http/api";

// data
// loading加载
let loading = ref(true)

// 表头样式
const tableHeader = {
  height: '50px',
  lineHeight: '50px',
  fontSize: '16px'
}

// 学生表格数据
const tableData = ref([])
// 显示新增信息弹窗
let dialogVisible = ref(false)
// 弹窗的类型，默认为新增用户弹窗
let dialogType = ref('add')
// 编辑学生信息时，携带的学生信息
let editStuInfo = ref({})
// 数据总条数
let total = ref(0)
// 选中学生列表
let selectStuIdList = ref([])
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)

// 现在表格字段匹配不到,可以改一下后端响应数据不要用id,而是用名称,用一下tableField(exit=false) String specialty;...
const options = reactive([
  {prop: 'id', label: '序号'},
  {prop: 'stuId', label: '学号'},
  {prop: 'name', label: '姓名'},
  {prop: 'sex', label: '性别'},
  {prop: 'collegeName', label: '院系'},
  {prop: 'specialtyName', label: '专业'},
  {prop: 'className', label: '班级'},
  {prop: 'age', label: '年龄'},
  {prop: 'address', label: '生源地'},
  {prop: 'phoneNo', label: '联系方式'},
  {prop: 'handel', label: '操作'}
])

onMounted(() => {
  initCollegeList()
})

// methods
/**
 * 获取表格数据
 */
const initCollegeList = () => {
  loading.value = true
  const param = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  }
  post(api.getStuInfo, param).then(res => {
    const data = res.data
    if (res.code === 200 && res.data) {

        tableData.value = data.data
        total.value = data.total

    }
  }).finally(() => {
    loading.value = false
  })
}

/**
 * 获取弹窗子组件
 * @param e
 */
function closeDialog(e) {
  dialogVisible.value = e.value
}

/**
 * 点击确定，关闭弹窗
 * @param e
 */
function confirmDialog(e) {
  dialogVisible.value = e.value
  initCollegeList()
}

/**
 * 点击添加学生
 */
// 注意:这里添加和修改指的是弹窗,请求是在点击确认按钮之后发送的
const addStu = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  editStuInfo.value = {}
}
/**
 * 删除学生
 * @param e
 * @param list
 */
const delStu = (e, list) => {
  ElMessageBox.confirm('此为删除操作, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let ids = []
    if (list && list.length > 0) {
      ids = list
    } else {
      ids.push(e.id)
    }

    post(api.delStu, {ids: ids}).then(res => {
      if (res.code === 200) {
        if (list && list.length > 0) {
          // 隐藏删除按钮
          selectStuIdList = []
        }
        ElMessage({message: '删除成功', type: 'success'})
        initCollegeList()
      } else {
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
  })
}
/**
 * 多选学生
 * @param list
 */
const selectStu = (list) => {
  const arr = []
  if (list) {
    list.forEach(item => {
      arr.push(item.id)
    })
  }
  selectStuIdList.value = arr
}
/**
 * 全选学生
 * @param list
 */
const selectAllStu = (list) => {
  selectStu(list)
}
/**
 * 编辑单个学生
 * @param e
 */
const editStu = (e) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  editStuInfo.value = e
}
/**
 * 模糊搜索学生信息
 */
const searchStu = (e) => {
  const param = {
    q: e,
    pageNo: 1,
    pageSize: pageSize.value
  }
  post(api.getStuByNameOrId, param).then(res => {
    if (res.code === 200) {
      tableData.value = res.data
      total.value = res.total
    } else {
      ElMessage.error(res.msg)
    }
  })
}
const columnWidth = (index) => {
  if (index === 0 || index === 3) {
    return '100'
  } else if (index === 4) {
    return '230'
  } else {
    return '180'
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  initCollegeList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  initCollegeList()
}

const getSex = (e) => {
  return (e === 1 || e === '1') ? '女' : '男'
}

</script>
<script>
import mainHeader from "@/components/baseComponents/mainHeader";
export default {
  name: 'StudentInfo',
  components: {
    mainHeader
  }
}
</script>
