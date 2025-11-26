<template>
  <div v-loading="loading">
    <!-- 搜索和操作区域 -->
    <el-card class="mb-4">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <el-button type="primary" @click="handleAdd">新增课程</el-button>
        
        <div style="display: flex; gap: 12px;">
          <el-input v-model="searchForm.courseName" placeholder="课程名称" clearable style="width: 200px;" />
          <el-input v-model="searchForm.courseCode" placeholder="课程编号" clearable style="width: 200px;" />
          <el-select v-model="searchForm.collegeId" placeholder="选择学院" clearable style="width: 200px;">
            <el-option v-for="college in colleges" :key="college.id" :label="college.collegeName" :value="college.id" />
          </el-select>
          <el-button type="primary" @click="fetchCourseList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 课程列表表格 -->
    <el-table :data="courseList" style="width: 100%" :header-cell-style="tableHeader">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="courseName" label="课程名称" min-width="150" />
      <el-table-column prop="courseCode" label="课程编号" width="120" />
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column prop="teacherName" label="任课教师" width="120" />
      <el-table-column prop="collegeName" label="所属学院" width="150" />
      <el-table-column prop="time" label="课程时间" width="120" />
      <el-table-column prop="status" label="课程状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>

        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑课程对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="courseFormRef" :model="courseForm" :rules="courseRules" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程编号" prop="courseCode">
          <el-input v-model="courseForm.courseCode" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number v-model="courseForm.credit" :min="0.5" :max="10" :step="0.5" />
        </el-form-item>
        <el-form-item label="任课教师" prop="teacherId">
          <el-select v-model="courseForm.teacherId" placeholder="请选择任课教师" style="width: 100%">
            <el-option v-for="teacher in teachers" :key="teacher?.id" :label="teacher?.name" :value="teacher?.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select v-model="courseForm.collegeId" placeholder="请选择所属学院" style="width: 100%">
            <el-option v-for="college in colleges" :key="college.id" :label="college.collegeName" :value="college.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程时间" prop="time">
          <el-input v-model="courseForm.time" placeholder="请输入课程时间" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { get, post } from '@/http/http'
import { api } from '@/http/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableHeader = { height: '50px', lineHeight: '50px', fontSize: '16px' }

// 搜索表单
const searchForm = reactive({
  courseName: '',
  courseCode: '',
  collegeId: null
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 课程列表
const courseList = ref([])
// 学院列表
const colleges = ref([])
// 教师列表
const teachers = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const courseFormRef = ref()
const courseForm = reactive({
  id: null,
  courseName: '',
  courseCode: '',
  credit: 0,
  teacherId: null,
  collegeId: null,
  time: '',
  status: 1,
})

// 表单验证规则
const courseRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseCode: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  credit: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请选择任课教师', trigger: 'change' }],
  collegeId: [{ required: true, message: '请选择所属学院', trigger: 'change' }],
}

onMounted(() => {
  fetchColleges()
  fetchTeachers()
  fetchCourseList()
})

// 获取学院列表
const fetchColleges = async () => {
  try {
    const res = await get(api.getAllCollege)
    if (res.code === 200) {
      colleges.value = res.data || []

    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
  }
}

// 获取教师列表
const fetchTeachers = async () => {
  try {
    const res = await get(api.getTeacherList)
    // 有点神奇,不知道为啥这里res,里面还包装了一个res对象{code:,msg:,data:{code:,msg:,data:{}}}
    console.log(res)

    if (res.code === 200) {
      teachers.value = res.data.data || []
      console.log(teachers.value)

    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const res = await post(api.getCourseList, {
      page: {
        pageNo: pagination.current,
        pageSize: pagination.size
      },
      ...searchForm
    })
    
    if (res.code === 200) {
      courseList.value = res.data.data || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    courseName: '',
    courseCode: '',
    collegeId: null
  })
  pagination.current = 1
  fetchCourseList()
}

// 新增课程
const handleAdd = () => {
  dialogTitle.value = '新增课程'
  dialogVisible.value = true
  // 重置表单
  Object.assign(courseForm, {
    id: null,
    courseName: '',
    courseCode: '',
    credit: 0,
    teacherId: null,
    collegeId: null,
    time: '',
    status: 1,
  })
}

// 编辑课程
const handleEdit = async (row) => {
  dialogTitle.value = '编辑课程'
  dialogVisible.value = true
  
  try {
    const res = await post(api.getCourse + `?courseId=${row.id}`)
    if (res.code === 200) {
      Object.assign(courseForm, res.data)
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
    ElMessage.error('获取课程详情失败')
  }
}

// 删除课程
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
      type: 'warning'
    })
    
    const res = await post(api.deleteCourse + `?courseId=${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchCourseList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    
    loading.value = true
    const apiUrl = courseForm.id ? api.updateCourse : api.addCourse
    const res = await post(apiUrl, courseForm)
    
    if (res.code === 200) {
      ElMessage.success(courseForm.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchCourseList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  if (courseFormRef.value) {
    courseFormRef.value.clearValidate()
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchCourseList()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchCourseList()
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>