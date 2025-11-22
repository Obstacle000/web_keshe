<template>
  <div v-loading="loading">
    <!-- 已选课程 -->
    <el-card class="mb-4">
      <div style="display:flex; justify-content: space-between; align-items: flex-start">
        <el-table :data="selectedCourses" style="width:600px" height="200">
          <el-table-column prop="courseName" label="课程名"/>
          <el-table-column prop="courseCode" label="课程编号"/>
          <el-table-column prop="credit" label="学分"/>
        </el-table>
        <div>
          <h3>总学分: {{ totalCredit }}</h3>
        </div>
      </div>
    </el-card>

    <!-- 筛选 & 搜索 -->
    <div style="margin-bottom:12px; display:flex; gap:12px;">
      <el-select v-model="collegeId" placeholder="选择学院" @change="fetchCourseList">
        <el-option v-for="c in colleges" :key="c.id" :label="c.collegeName" :value="c.id"/>
      </el-select>

      <el-input v-model="searchQuery" placeholder="课程名或编号" clearable @keyup.enter="fetchCourseList">
        <template #append>
          <el-button icon="el-icon-search" @click="fetchCourseList"/>
        </template>
      </el-input>
    </div>

    <!-- 可选课程列表 -->
    <el-table :data="courseList" style="width:100%" :header-cell-style="tableHeader">
      <template v-for="(col, index) in columns" :key="index">
        <el-table-column
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :fixed="col.prop === 'handel' ? 'right' : null"
        >
          <template #default="scope">
            <div v-if="col.prop !== 'handel'">
              {{ scope.row[col.prop] || '-' }}
            </div>
            <div v-else style="text-align:center;">
              <el-button
                  size="small"
                  type="primary"
                  v-if="!selectedCourseIds.includes(scope.row.id)"
                  @click="selectCourse(scope.row.id)"
              >
                选课
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  v-else
                  @click="deselectCourse(scope.row.id)"
              >
                退选
              </el-button>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div style="display:flex; justify-content:center; margin-top:12px;">
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10,20,50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get, post } from '@/http/http'
import { api } from '@/http/api'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const tableHeader = { height:'50px', lineHeight:'50px', fontSize:'16px' }

const selectedCourses = ref([])
const totalCredit = ref(0)
const selectedCourseIds = ref([])

const courseList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const collegeId = ref(null)
const searchQuery = ref('')
const colleges = ref([])

// 动态列
const columns = reactive([
  {prop: 'id', label: '序号'},
  { prop: 'courseName', label: '课程名', width: 180 },
  { prop: 'courseCode', label: '课程编号', width: 140 },
  { prop: 'credit', label: '学分', width: 100 },
  { prop: 'teacherName', label: '教师', width: 140 },
  { prop: 'collegeName', label: '院系', width: 160 },
  { prop: 'time', label: '节次', width: 120 },
  { prop: 'handel', label: '操作', width: 120 }
])

onMounted(() => {
  fetchColleges()
  fetchSelectedCourses()
  fetchCourseList()
})

const fetchColleges = () => {
  get(api.getAllCollege).then(res => {
    colleges.value = res.data?.length ? res.data : []
  })
}

const fetchSelectedCourses = () => {
  loading.value = true
  post(api.getSelectedCourse).then(res => {
    if (res.code === 200) {
      selectedCourses.value = res.data.courses || []
      totalCredit.value = res.data.totalCredit || 0
      selectedCourseIds.value = selectedCourses.value.map(c => c.id)
    }
  }).finally(()=> loading.value = false)
}

const fetchCourseList = () => {
  loading.value = true
  post(api.getCourseList, {
    page: { pageNo: currentPage.value, pageSize: pageSize.value },
    collegeId: collegeId.value,
    name: searchQuery.value
  }).then(res => {
    if (res.code === 200) {
      courseList.value = res.data.data || []
      total.value = res.data.total || 0
    }
  }).finally(()=> loading.value = false)
}

// 选课
const selectCourse = (courseId) => {
  post(api.selectCourse+"?courseId="+courseId).then(res => {
    if (res.code === 200) {
      ElMessage.success("选课成功")
      fetchSelectedCourses()
      fetchCourseList()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 退选
const deselectCourse = (courseId) => {
  post(api.deselectCourse+"?courseId="+courseId).then(res => {
    if (res.code === 200) {
      ElMessage.success("退选成功")
      fetchSelectedCourses()
      fetchCourseList()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const handleSizeChange = val => { pageSize.value = val; fetchCourseList() }
const handleCurrentChange = val => { currentPage.value = val; fetchCourseList() }
</script>
