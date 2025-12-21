<template>
  <el-card style="padding: 20px;" v-loading="loading">
    <div class="dashboard-title">教育统计概览</div>

    <el-row :gutter="20">
      <!-- 学生与老师比例 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">学生与老师比例</div>
          <v-chart :option="teacherStudentOption" style="height: 200px;" />
        </el-card>
      </el-col>

      <!-- 学院专业数量 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">学院专业数量</div>
          <v-chart :option="departmentOption" style="height: 200px;" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 课程数量 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="chart-title">课程数量</div>
          <v-chart :option="courseOption" style="height: 200px;" />
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { post } from '@/http/http'; // 封装的 post 方法
import VChart from 'vue-echarts';
import { ElMessage } from 'element-plus';

const loading = ref(false);

// 学生与老师比例
const teacherStudentOption = reactive({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
  legend: { bottom: '0%' },
  series: [
    {
      name: '比例',
      type: 'pie',
      radius: ['50%', '70%'],
      label: { show: true, formatter: '{b}: {d}%' },
      data: []
    }
  ]
});

// 学院专业数量
const departmentOption = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: function (params) {
      const p = params[0];
      return `${p.name}: ${p.value} 个专业`;
    }
  },
  xAxis: { type: 'category', data: [], axisLabel: { show: false } }, // 不显示X轴名称
  yAxis: { type: 'value' },
  series: [
    {
      type: 'bar',
      data: [],
      itemStyle: { color: '#409EFF' },
      label: { show: false } // 不显示柱子上的文字
    }
  ]
});

// 课程数量
const courseOption = reactive({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [], itemStyle: { color: '#67C23A' } }]
});

// 请求接口获取数据
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const studentRes = await post('/api/studentCount', {});
    const teacherRes = await post('/api/teacherCount', {});
    const deptRes = await post('/api/departments', {});
    const courseRes = await post('/api/courses', {});

    // 学生/老师比例
    teacherStudentOption.series[0].data = [
      {value: studentRes.data || 0, name: '学生'},
      {value: teacherRes.data || 0, name: '老师'}
    ];

    // 学院专业数量
    const deptData = Array.isArray(deptRes.data) ? deptRes.data : [];
    departmentOption.xAxis.data = deptData.map(d => d.collegeName); // X轴存学院名，用于tooltip
    departmentOption.series[0].data = deptData.map(d => d.remark);  // 柱子高度对应专业数量

    // 课程数量
    const courseData = Array.isArray(courseRes.data) ? courseRes.data : [];
    courseOption.xAxis.data = courseData.map(d => d.collegeName );
    courseOption.series[0].data = courseData.map(d => d.remark);

  } catch (err) {
    console.error('获取综合统计数据失败', err);
    ElMessage.error('获取统计数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 页面加载时请求一次数据
onMounted(() => {
  fetchDashboardData();
});
</script>

<style>
.dashboard-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.chart-title {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}
</style>
