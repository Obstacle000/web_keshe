<template>
  <div v-loading="loading">
    <!-- 搜索框 -->
    <div style="margin-bottom: 16px; display:flex; align-items:center;">
      <el-input
          v-model="searchCourseName"
          placeholder="请输入课程名搜索"
          clearable
          @keyup.enter="searchScore"
          style="width: 300px; margin-right: 12px;"
      />
      <el-button type="primary" @click="searchScore">搜索</el-button>
    </div>

    <!-- 成绩表格 -->
    <el-table
        :data="tableData"
        style="width: 100%;"
        :header-cell-style="tableHeader"
        stripe
        border
    >
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="courseName" label="课程名称" width="200" />
      <el-table-column prop="teacherName" label="教师姓名" width="150" />
      <el-table-column prop="score" label="分数" width="100" />
      <el-table-column prop="remark" label="备注" />
    </el-table>

    <!-- 分页 -->
    <div style="display: flex; justify-content: center; margin-top: 16px;">
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { post } from '@/http/http'
import { api } from '@/http/api'

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([])

// 搜索关键字
const searchCourseName = ref('')

// 分页
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 表头样式
const tableHeader = {
  height: '50px',
  lineHeight: '50px',
  fontSize: '16px'
}

// 获取成绩列表
const getScoreList = () => {
  loading.value = true
  const param = {
    pageNo: currentPage.value,
    pageSize: pageSize.value,
    courseName: searchCourseName.value
  }
  post(api.listScoreStu, param)
      .then(res => {
        if (res.code === 200 && res.data) {
          tableData.value = res.data.data
          total.value = res.data.total
        } else {
          tableData.value = []
          total.value = 0
        }
      })
      .finally(() => {
        loading.value = false
      })
}

// 搜索
const searchScore = () => {
  currentPage.value = 1
  getScoreList()
}

// 分页事件
const handleCurrentChange = (val) => {
  currentPage.value = val
  getScoreList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getScoreList()
}

// 初始化数据
onMounted(() => {
  getScoreList()
})
</script>

<style scoped>
</style>
