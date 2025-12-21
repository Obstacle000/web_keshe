<template>
  <div v-loading="loading">
    <!-- 表格头，可扩展搜索功能 -->
    <main-header
        @onSearch="searchStudent"
    />

    <!-- 学生成绩表格 -->
    <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 12px"
        height="488"
        :header-cell-style="tableHeader"
    >
      <el-table-column type="selection" width="55"></el-table-column>

      <el-table-column prop="id" label="编号" width="120"></el-table-column>
      <el-table-column prop="stuId" label="学号" width="120"></el-table-column>
      <el-table-column prop="studentName" label="姓名" width="150"></el-table-column>
      <el-table-column prop="courseName" label="课程" width="180"></el-table-column>
      <el-table-column prop="score" label="成绩" width="100"></el-table-column>
      <el-table-column prop="remark" label="备注" width="200"></el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" width="120">
        <template #default="scope">
          <el-button type="primary" link @click="openScoreDialog(scope.row)">打分</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="display:flex; justify-content:center">
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

    <!-- 打分弹窗 -->
    <el-dialog
        v-model="scoreDialogVisible"
        title="学生打分"
        width="400px"
    >
      <el-form :model="scoreForm" :rules="scoreFormRules" ref="scoreFormRef" label-width="80px">
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="scoreForm.score" :min="0" :max="100" :step="1" style="width: 100%"/>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="scoreForm.remark" placeholder="可选"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeScoreDialog">取消</el-button>
          <el-button type="primary" @click="submitScore">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import {post} from '@/http/http';
import {api} from '@/http/api';

// 表格加载状态
const loading = ref(true);

// 表头样式
const tableHeader = {
  height: '50px',
  lineHeight: '50px',
  fontSize: '16px'
};

// 表格数据
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 打分弹窗
const scoreDialogVisible = ref(false);
const scoreFormRef = ref(null);
const scoreForm = reactive({
  courseId: null,
  studentId: null,
  score: null,
  remark: ''
});
const scoreFormRules = {
  score: [
    {required: true, message: '请输入分数', trigger: 'blur'}
  ]
};

// 获取成绩列表
const getScoreList = () => {
  loading.value = true;
  const param = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  };

  post(api.listScore, param).then(res => {

    if (res.code === 200) {
      tableData.value = res.data.data || [];

      total.value = res.data.total || 0;
    }
  }).finally(() => {
    loading.value = false;
  });
};

// 打开打分弹窗
const openScoreDialog = (row) => {
  scoreForm.studentId = row.studentId;
  scoreForm.courseId = row.courseId;
  scoreForm.score = row.score || null;
  scoreForm.remark = row.remark || '';
  scoreDialogVisible.value = true;
};

// 关闭弹窗
const closeScoreDialog = () => {
  scoreDialogVisible.value = false;
};

// 提交打分
const submitScore = () => {
  scoreFormRef.value.validate((valid) => {
    if (!valid) return;
    post(api.giveScore, scoreForm).then(res => {
      if (res.code === 200) {
        ElMessage.success('打分成功');
        scoreDialogVisible.value = false;
        getScoreList();
      } else {
        ElMessage.error(res.msg || '打分失败');
      }
    });
  });
};

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  getScoreList();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getScoreList();
};

// 搜索学生
const searchStudent = (query) => {
  loading.value = true;
  const param = {
    pageNo: 1,
    pageSize: pageSize.value,
    studentName: query
  };
  post(api.getScoreListByTeacherId, param).then(res => {
    if (res.code === 200) {
      tableData.value = res.data.data || [];
      total.value = res.data.total || 0;
    }
  }).finally(() => {
    loading.value = false;
  });
};

// 初始化
onMounted(() => {
  getScoreList();
});
</script>

<script>
import mainHeader from "@/components/baseComponents/mainHeader";

export default {
  name: 'ScoreManage',
  components: {mainHeader}
}
</script>
