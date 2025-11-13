<!--顶部导航栏-->
<template>
  <div class="nav-tab">

<!--    创建一个 选项卡（Tab）容器，可以在多个标签页之间切换内容。-->
    <el-tabs
        v-model="tabActive"
        type="card"
        class="tabs-content"
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
    >
      <!--visitedRoutes存储已经访问过的路由-->
<!--      表示 <el-tabs> 中的 单个页签-->
<!--      :closable="item.path!=='/index'" → 首页页签不可关闭-->
      <el-tab-pane
          v-for="item in visitedRoutes"
          :key="item.path"
          :closable="item.path!=='/index'"
          :label="item.meta.title"
          :name="item.path"
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import store from "@/store";

const router = useRouter()
const route = useRoute()

let tabActive = ref('') // 当前点击的tab
const visitedRoutes = ref([]) // 导航tabs列表
visitedRoutes.value = store.getters.getNavTabs
/**
 * 初始化tabs
 */
const initTabs = () => {
  // 初始化，当前路由在tabs列表中，则显示该路由，否则往tabs列表中添加当前路由
  const obj = visitedRoutes.value.find(item => item.path === route.path)
  if (obj) {
    // 如果标签存在当前路由,直接激活
    tabActive.value = obj.path
  } else {
    // 不存在先添加后激活
    visitedRoutes.value.push({path: route.path, meta: route.meta})
    tabActive.value = route.path
  }
}
initTabs()

watch(() => route.path, () => {
  // 当路由变化时，重新调用 initTabs() → 确保页签列表更新
  initTabs()
})

/**
 * 点击tabs，界面跳转
 * @param tab
 * @returns {boolean}
 */
const handleTabClick = (tab) => {
  /*根据页签索引找到对应的路由对象*/
  const item = visitedRoutes.value.find((item, index) => parseInt(tab.index) === index)

  if (route.path !== item.path) {
    /*不是 → 使用 router.push 跳转到对应路由*/
    router.push({
      path: item.path,
      query: item.query,
      fullPath: item.fullPath,
    })
  } else {
    // 是的话不做任何操作
    return false
  }
}
/**
 * 删除tabs
 * @param path
 */
const handleTabRemove = (path) => {
  let key = -1
  visitedRoutes.value.forEach((item, index) => {
    if (item.path === path) key = index
  })
  if (key > -1) {
    visitedRoutes.value.splice(key, 1)
    // 因为首页的tabs不能被删除，所以删除只能向前一个跳转，不能向后跳转
    const item = visitedRoutes.value[key - 1]

    router.push({
      path: item.path,
      query: item.query,
      fullPath: item.fullPath,
    })
  }
}
</script>

<script>
export default {
  name: "NavBar"
}
</script>

<style lang="scss" scoped>
.nav-tab {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px #eeeeee solid;
}

.tabs-content {
  width: calc(100% - 90px);
  height: 34px;

  ::v-deep {
    .el-tabs__nav-next,
    .el-tabs__nav-prev {
      height: 34px;
      line-height: 34px;
    }

    .el-tabs__header {
      border-bottom: 0;

      .el-tabs__nav {
        border: 0;
      }

      .el-tabs__item {
        box-sizing: border-box;
        height: 34px;
        margin-right: 5px;
        line-height: 34px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;

        &.is-active {
          border: 1px solid #0187fb;
        }
      }
    }
  }
}
</style>
