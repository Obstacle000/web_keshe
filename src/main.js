import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/index.scss'
import '@/assets/iconfont/iconfont.css'
import '@/assets/iconfont/iconfont.js'
import { myHighLight } from "@/utils/tools";
import 'element-plus/theme-chalk/dark/css-vars.css'

import BaseTable from "@/commons/BaseTable";

// ===== 引入 ECharts 相关 =====
import VChart from 'vue-echarts'
import * as echarts from 'echarts/core'

// 引入图表类型
import { PieChart, BarChart } from 'echarts/charts'

// 引入组件
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

// 引入渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 模块
echarts.use([
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    CanvasRenderer
])

const app = createApp(App)

app.use(store).use(router).mount('#app')

// 注册全局组件和指令
app.component('base-table', BaseTable)
app.component('VChart', VChart)  // 注册 vue-echarts
app.directive('high-light', myHighLight)
