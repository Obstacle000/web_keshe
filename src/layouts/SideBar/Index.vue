<template>
  <div>
    <el-menu
        class="side-bar-container"
        router
        active-text-color="#ffd04b"
        background-color="#21252b"
        :default-openeds="routes.map(item => item.path)"
        :default-active="activeMenu"
        :collapse="isCollapse"
        unique-opened
        text-color="#fff"
        mode="vertical"
        @select="selectPath"
    >
      <div class="logo-title">
        <span></span>
        <span v-show="!isCollapse">学生管理系统</span>
      </div>

      <div v-for="(item, index) in routes" :key="index">
        <el-sub-menu v-if="item.children && !item.meta.home" :index="item.path">
          <template #title>
            <i :class="item.meta.icon" style="margin-right: 6px"></i>
            <span v-show="!isCollapse">{{ item.meta.title }}</span>
          </template>

          <div v-for="item2 in item.children" :key="item2.path">
            <el-menu-item v-if="!item2.children" :index="item2.path" @click="clickPath(item2)">
              {{ item2.meta.title }}
            </el-menu-item>

            <el-sub-menu v-else :index="item2.path">
              <template #title>{{ item2.meta.title }}</template>
              <el-menu-item v-for="item3 in item2.children" :index="item3.path" :key="item3.path"
                            @click="clickPath(item3)">
                {{ item3.meta.title }}
              </el-menu-item>
            </el-sub-menu>
          </div>
        </el-sub-menu>

        <el-menu-item v-else-if="item.meta && item.meta.home" :index="item.path">
          <i :class="item.meta.icon" style="margin-right: 6px"></i>
          <span v-show="!isCollapse">{{ item.meta.title }}</span>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useStore} from 'vuex'
import {menu} from '@/router/mockData'
import {filterAsyncRouter} from '@/router/permission'
import {storagekey} from '@/utils/constants'

const store = useStore()
const route = useRoute()
const clickItem = ref({})

// 菜单折叠状态
let isCollapse = ref(store.state.isCollapse)
watch(() => store.state.isCollapse, (newVal) => {
  isCollapse.value = newVal
})

// 响应式菜单
// 超级大坑,之前routes不是响应式的,导致,我前脚用管理员登陆,后脚用别的账号登陆的时候,由于filterAsyncRouter只在页面加载或组件挂载时执行一次
// 所以routes一直是不变的,我就以为过滤没成功
const routes = ref([])

// 初始化菜单
function loadMenu(rolesArray) {
  routes.value = filterAsyncRouter(menu, rolesArray)
}

onMounted(() => {
  const roles = JSON.parse(localStorage.getItem(storagekey.role) || '[]')
  loadMenu(roles)
})

// 暴露给父组件调用（登录成功后刷新菜单）
defineExpose({loadMenu})

// 高亮菜单
const activeMenu = computed(() => {
  const {meta, path} = route
  return meta.activeMenu || path
})

// 点击菜单加入顶部 tabs
const selectPath = (e) => {
  setTimeout(() => {
    const list = store.getters.getNavTabs
    const item = list.find(item => item.path === e)
    if (!item && clickItem.value.path === e) {
      list.push({path: clickItem.value.path, meta: clickItem.value.meta})
      store.commit('setNavTabs', list)
    }
  }, 100)
}
const clickPath = (e) => {
  clickItem.value = e
}
</script>

<script>
export default {
  name: "SideBar"
}
</script>

<style scoped>
.side-bar-container {
  z-index: 999;
  height: 100vh;
  overflow: hidden;
  background: #21252b;
}

.logo-title {
  height: 56px;
  line-height: 56px;
  margin-left: 20px;
  color: #fff;
  font-size: 22px;
  overflow: hidden;
}
</style>
