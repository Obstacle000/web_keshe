import {createRouter, createWebHistory} from 'vue-router'
import Layout from '@/layouts/Index'
import login from '@/views/Login'
import {menu} from '@/router/mockData'
import {filterAsyncRouter} from '@/router/permission'
import { storagekey } from "@/utils/constants";



let routes = [
  {
    path: '/',
    name: 'login',
    component: login
  },
  {
    path: '/Layout',
    name: 'Layout',// 不是组件名
    component: Layout, // 就是layouts包的index.vue,然后side,tab...是子组件
    redirect: '/index',
    meta: {title: '首页', icon: 'iconfont icon-home', home: true,roles: ['STUDENT','ADMIN', 'TEACHER']},
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('@/views/Index'),
        meta: {title: '首页', icon: 'iconfont icon-home', home: true}
      }
    ]
  }
]
const userRoles = JSON.parse(localStorage.getItem(storagekey.role) || '[]');

const rewriteRoutes = filterAsyncRouter(menu,userRoles) // 这个会把mockData的路由合并
routes = routes.concat(rewriteRoutes)

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
