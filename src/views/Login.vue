<template>
  <div class="login-bg">
    <div class="login-content">
      <div class="login-content-top">
        <img
            class="login-logo"
            alt="student admin system"
            :src="require('../assets/images/logo.svg')"
        />
      </div>

      <div class="login-content-bottom">
        <el-input
            class="login-input"
            placeholder="请输入用户名"
            v-model="loginInfo.userName"
            clearable
        ></el-input>

        <el-input
            class="login-input"
            placeholder="请输入密码"
            type="password"
            v-model="loginInfo.password"
            clearable
            @keyup.enter="login"
        ></el-input>

        <el-button
            class="login-btn"
            type="primary"
            :loading="loading"
            @click="login"
        >
          登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { post } from "@/http/http"; // 你封装的请求方法
import { api } from "@/http/api"; // 这里假设 api.system.login = '/auth/login'
import { storagekey } from "@/utils/constants";
import { menu } from '@/router/mockData'
import { filterAsyncRouter } from '@/router/permission'

const router = useRouter();
const loading = ref(false);

const loginInfo = ref({
  userName: "",
  password: ""

});

const login = async () => {
  if (!loginInfo.value.userName || !loginInfo.value.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  loading.value = true;
  try {
    const res = await post(api.system.login, loginInfo.value);
    if (res.code === 200) {
      // 将角色统一转换成数组
      const rolesArray = Array.isArray(res.data.user.roles)
          ? res.data.user.roles
          : [res.data.user.roles];

      // 保存 token 与用户信息
      localStorage.setItem(storagekey.token, res.data.token);
      localStorage.setItem(storagekey.username, res.data.user.nickName);
      localStorage.setItem(storagekey.role, JSON.stringify(rolesArray));



      ElMessage.success("登录成功");
      router.push('/index')


    } else {
      ElMessage.error(res.msg || "登录失败");
    }
  } catch (err) {
    console.error(err);
    ElMessage.error("请求失败，请检查网络或服务器状态");
  } finally {
    loading.value = false;
  }
};
</script>

<script>
export default {
  name: "Login",
};
</script>

<style lang="scss" scoped>
.login-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url("../assets/images/login-bg.png");
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  display: flex;
  flex-direction: column;
  width: 455px;
  height: 520px;
  background: url("../assets/images/login-bg.png") no-repeat;
  background-size: 100% 100%;
  box-shadow: 0 0 15px 10px rgb(52, 69, 107);

  .login-content-top {
    width: 100%;
    height: 190px;
    color: #fff;
    display: flex;
    justify-content: center;

    .login-logo {
      width: calc(100% - 50px);
    }
  }

  .login-content-bottom {
    width: 355px;
    height: 100%;
    margin-left: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .login-input {
      margin-bottom: 25px !important;
    }

    :deep input {
      -webkit-text-fill-color: rgba(231, 234, 237, 0.8) !important;
      caret-color: #fff;
      -webkit-text-fill-color: #8cbce6 !important;
    }

    :deep .el-input__inner {
      color: #8cbce6;
    }

    :deep .el-button {
      color: #fff;
      border: none;
    }

    .login-btn {
      height: 52px;
      margin-top: 25px;
      background: #1541a1;
    }

    :deep .el-input__wrapper {
      background-color: rgba(0, 0, 0, 0);
      box-shadow: none;
      border-bottom: 2px #53749b solid;
    }
  }
}
</style>
