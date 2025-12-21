<template>
  <div class="home-msg">
    <div class="role-switch">
      <el-button type="primary" @click="switchToStudent">
        切换学生
      </el-button>
      <el-button type="success" @click="switchToTeacher">
        切换教师
      </el-button>
      <el-button type="warning" @click="switchToAdmin">
        切换管理员
      </el-button>
    </div>

    <h2>欢迎来到学生管理系统</h2>
  </div>
</template>

<script>
import router from '@/router'
import { storagekey } from '@/utils/constants'

export default {
  name: 'HomeMsg',
  methods: {
    switchToStudent() {
      localStorage.clear()
      router.push({
        path: '/',
        query: {userName: '11', password: '123456'}
      })
    },
    switchToTeacher() {
      localStorage.clear()
      router.push({
        path: '/',
        query: {userName: '01', password: '123456'}
      })
    },
    switchToAdmin() {
      localStorage.clear()
      router.push({
        path: '/',
        query: {userName: 'chen', password: '123456'}
      })
    }
  }
}
</script>

<style scoped lang="scss">
.home-msg {
  padding: 20px;

  .role-switch {
    margin-bottom: 20px;

    button {
      margin-right: 12px;
    }
  }
}
</style>
