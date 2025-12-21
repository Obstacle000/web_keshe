<template>
  <div class="top-tabs-bar">
    <!-- 左侧 -->
    <div class="top-tabs-bar-left">
      <div class="open-btn-list" @click="changeSideBar">
        <i v-show="closeSideBar" class="iconfont icon-close-sidebar icons-size"></i>
        <i v-show="!closeSideBar" class="iconfont icon-open-sidebar icons-size"></i>
      </div>

      <el-breadcrumb style="padding-left: 12px" :separator-icon="ArrowRight">
        <el-breadcrumb-item v-for="item in routeList" :key="item.path">
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧 -->
    <div class="top-tabs-bar-right">
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <img :src="userAvatar" alt="avatar" class="user-avatar" />
          <span class="top-tabs-bar-right-user">{{ username }}</span>
          <i class="iconfont icon-down"></i>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="uploadAvatar" divided>上传头像</el-dropdown-item>
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

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="dialogVisible" @close="closeDialog" title="修改密码" width="400">
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
import { reactive, ref, watchEffect } from "vue";
import { useStore } from "vuex";
import { ArrowRight } from '@element-plus/icons-vue';
import { useRoute, useRouter } from "vue-router";
import { storagekey } from "@/utils/constants";
import { useDark, useToggle } from '@vueuse/core';
import { get, post } from "@/http/http";
import { api } from "@/http/api";
import { ElMessage, ElMessageBox } from "element-plus";

const store = useStore();
const route = useRoute();
const router = useRouter();

let closeSideBar = ref(true);
let dialogVisible = ref(false);
let pwdStuFormRef = ref(null);

const username = ref(localStorage.getItem(storagekey.username));
const isDark = useDark();

const userAvatar = ref(''); // 用户头像

if (!username.value) {
  router.push({ path: '/' });
}

// 修改密码表单
let changePwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

const pwdFormRules = ref({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmNewPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
});

// 路由面包屑
const getBreadcrumb = () => route.matched.filter(item => item.name && item.meta.title);
const routeList = ref(getBreadcrumb());
watchEffect(() => { routeList.value = getBreadcrumb(); });

// 左侧菜单栏展开收起
const changeSideBar = () => {
  store.commit('setCollapse', closeSideBar.value);
  closeSideBar.value = !closeSideBar.value;
};

// 下拉菜单操作
const handleCommand = (command) => {
  switch (command) {
    case 'changePassword': changePassword(); break;
    case 'logout': logout(); break;
    case 'changeTheme': useToggle(isDark); break;
    case 'uploadAvatar': uploadAvatar(); break;
  }
};

// 修改密码
const changePassword = () => { dialogVisible.value = true; };
const closeDialog = () => {};
const confirmPassword = () => {
  pwdStuFormRef.value.validate(valid => {
    if (!valid) return;

    if (changePwdForm.newPassword !== changePwdForm.confirmNewPassword) {
      ElMessage.error('两次输入的新密码不一致');
      return;
    }

    const params = { oldPassword: changePwdForm.oldPassword, newPassword: changePwdForm.newPassword };
    post(api.updatePas, params)
        .then(res => {
          if (res.code === 200) {
            ElMessage.success('密码修改成功，请重新登录');
            dialogVisible.value = false;
            changePwdForm.oldPassword = '';
            changePwdForm.newPassword = '';
            changePwdForm.confirmNewPassword = '';
            logout();
          } else {
            ElMessage.error(res.message || '修改失败');
          }
        })
        .catch(() => { ElMessage.error('请求失败'); });
  });
};

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出吗', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning',
  }).then(() => {
    router.push({ path: '/' });
    store.commit('setNavTabs', [{ path: "/index", meta: { title: '首页' } }]);
  }).catch(() => {});
};

// 上传头像
const uploadAvatar = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    post(api.uploadPicture, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          if (res.code === 200) {
            ElMessage.success('上传成功');
            getAvatar();
          } else {
            ElMessage.error(res.message || '上传失败');
          }
        }).catch(() => { ElMessage.error('上传失败'); });
  };
  input.click();
};

// 获取头像
const getAvatar = () => {
  post(api.getAvatar).then(res => {
    if (res.code === 200) userAvatar.value = res.data || '';
  });
};

// 初始化获取头像
getAvatar();
</script>

<style lang="scss" scoped>
$width: 24px;

.top-tabs-bar {
  height: 55px;
  padding: 0 20px;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px #eeeeee solid;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .top-tabs-bar-left {
    display: flex;
    align-items: center;

    .open-btn-list { width: $width; }

    .icons-size { cursor: pointer; font-size: $width; }
  }

  .top-tabs-bar-right {
    display: flex;
    align-items: center;
    cursor: pointer;

    .user-info { display: flex; align-items: center; }

    .top-tabs-bar-right-user { margin-right: 6px; }
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 6px;
  object-fit: cover;
}
</style>
