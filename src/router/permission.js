import Layout from '@/layouts/Index'

// 将 menu 的 component 字符串转换成 Vue 组件
export function filterAsyncRouter(routers, userRoles = []) {
  return routers.filter(router => {

    // 角色权限过滤
    const routeRoles = router.meta?.roles || []
    console.log('routeRoles:', routeRoles)
    console.log('userRoles:', userRoles)
    if (routeRoles.length && !userRoles.some(r => routeRoles.includes(r))) return false

    // 递归处理子路由
    if (router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children, userRoles)
    } else {
      delete router.children
      delete router.redirect
    }

    // 转换 component
    if (router.component) {
      router.component = router.component === 'Layout' ? Layout : loadView(router.component)
    }

    return true
  })
}

// 路由懒加载
export function loadView(view) {
  return () => import(`@/views${view}`)
}
