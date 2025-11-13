<!--顶部功能栏-->
<template>
  <div class="top-tabs-bar">
    <div class="top-tabs-bar-left">
      <!--左侧菜单栏展开收起按钮-->
      <div class="open-btn-list" @click="changeSideBar">
        <i v-show="closeSideBar" class="iconfont icon-close-sidebar icons-size"></i> <!--收起-->
        <i v-show="!closeSideBar" class="iconfont icon-open-sidebar icons-size"></i><!--展开-->
      </div>

      <!--路由-面包屑导航,这个就是类似于 根目录->一级目录->二级目录 这样,让你知道你在哪一级-->
      <el-breadcrumb style="padding-left: 12px" :separator-icon="ArrowRight"><!--指定跟个符号为右箭头-->
        <el-breadcrumb-item v-for="item in routeList" :key="item.path">
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!--修改信息下拉框-->
    <div class="top-tabs-bar-right">
      <el-dropdown @command="handleCommand"> <!--当下拉菜单的某一项被点击时，会触发 handleCommand 方法-->
        <div>
          <span class="top-tabs-bar-right-user">{{ username }}</span><!--显示当前登录用户的用户名-->
          <i class="iconfont icon-down"></i> <!--显示一个向下箭头图标,表示可以下拉-->
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePassword" divided>修改密码</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            <el-dropdown-item command="changeTheme">
              <span>暗黑模式</span>
              <el-switch v-model="isDark" size="large" class="mt-2" style="margin-left: 24px" inline-prompt/>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!--修改密码弹窗-->
    <el-dialog v-model="dialogVisible" @close="closelDialog" title="修改密码" width="400">
      <el-form
          ref="pwdStuFormRef"
          :model="changePwdForm"
          :rules="pwdFormRules"
          label-position="left"
          label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="changePwdForm.oldPassword"/>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="changePwdForm.newPassword"/>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmNewPassword">
          <el-input v-model="changePwdForm.confirmNewPassword"/>
        </el-form-item>
      </el-form>

      <template #footer>
          <span>
            <el-button @click="dialogVisible=false">取消</el-button>
            <el-button type="primary" @click="confirmPassword">确认</el-button>
          </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, watchEffect} from "vue";
import {useStore} from "vuex";
import {ArrowRight} from '@element-plus/icons-vue'
import {useRoute, useRouter} from "vue-router";
import {storagekey} from "@/utils/constants";
import {useDark, useToggle} from '@vueuse/core'
import {get, post} from "@/http/http";
import {api} from "@/http/api";

const store = useStore()
const route = useRoute()
const router = useRouter()
let closeSideBar = ref(true) // 左侧菜单栏展开收起标识
let dialogVisible = ref(false) // 修改密码弹出框
let pwdStuFormRef = ref(null) // 修改密码弹窗的实例
const username = ref(localStorage.getItem(storagekey.username)) // 用户名称
const isDark = useDark()
// const toggleDark = useToggle(isDark)

if (!username.value) {
  router.push({path: '/'})
}

let changePwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const pwdFormRules = ref({
  oldPassword: [{required: true, message: '请输入旧密码', trigger: 'blur'}],/*当输入框失去焦点时触发验证(是否空)*/
  newPassword: [{required: true, message: '请输入新密码', trigger: 'blur'}],
  confirmNewPassword: [{required: true, message: '请确认新密码', trigger: 'blur'}]
})

// 路由列表，面包屑导航栏---start,route.matched就是获取从根路由到当前访问路由的完整层级路径
const getBreadcrumb = () => {
  return route.matched.filter(
      (item) => item.name && item.meta.title
  )
}

const routeList = ref(getBreadcrumb())

watchEffect(() => {
  routeList.value = getBreadcrumb()
})
// 路由列表，面包屑导航栏---end

/**
 * 展开收起左侧菜单栏
 */
const changeSideBar = () => {
  store.commit('setCollapse', closeSideBar.value)
  closeSideBar.value = !closeSideBar.value
}
/**
 * 下拉面板操作
 * @param command
 */
const handleCommand = (command) => {
  switch (command) {
    case 'changePassword':
      changePassword()
      break
    case 'logout':
      logout()
      break
    case 'changeTheme':
      changeTheme()
      break
  }
}
const changeTheme = () => {
  useToggle(isDark)
}
const closelDialog = () => {
}
/**
 * 修改密码
 */
const changePassword = () => {
  dialogVisible.value = true
}

/**
 * 弹窗点击确定
 */
const confirmPassword = () => {
  pwdStuFormRef.value.validate((valid) => {
    if (!valid) return;

    if (changePwdForm.newPassword !== changePwdForm.confirmNewPassword) {
      ElMessage.error('两次输入的新密码不一致');
      return;
    }

    const params = {
      oldPassword: changePwdForm.oldPassword,
      newPassword: changePwdForm.newPassword
    };

    post(api.updatePas, params)
        .then(res => {
          if (res.code === 200) {
            ElMessage.success('密码修改成功，请重新登录');
            dialogVisible.value = false;
            // 清空表单
            changePwdForm.oldPassword = '';
            changePwdForm.newPassword = '';
            changePwdForm.confirmNewPassword = '';
            // 退出登录
            logout();
          } else {
            ElMessage.error(res.message || '修改失败');
          }
        })
        .catch(err => {
          console.error(err);
          ElMessage.error('请求失败');
        });
  });
};

/**
 * 退出登录
 */
const logout = () => {
  ElMessageBox.confirm('确定要退出吗', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning',
  }).then(() => {
    router.push({path: '/'})
    // 导航栏置为首页
    /*用户在登录后可能打开了多个标签页（比如首页、学生管理、课程管理…）,退出登录后，这些标签页需要 清空或重置为默认首页*/
    store.commit('setNavTabs', [{path: "/index", meta: {title: '首页'}}])
  }).catch(() => {

  })
}
</script>

<script>
export default {
  name: "TabsBar"
}
</script>

<style lang="scss" scoped>
$width: 24px;
.top-tabs-bar {
  height: 55px;
  //line-height: 60px;
  padding: 0 20px;
  //background: #ffffff;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px #eeeeee solid;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .top-tabs-bar-left {
    display: flex;
    align-items: center;

    .open-btn-list {
      width: $width;
    }

    .icons-size {
      cursor: pointer;
      font-size: $width;
    }
  }

  .top-tabs-bar-right {
    display: flex;
    align-items: center;
    cursor: pointer;

    .top-tabs-bar-right-user {
      margin-right: 6px;
    }
  }
}
</style>
