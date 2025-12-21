export const menu = [
  {
    path: '/student',
    name: 'Student',
    meta: {title: '学生管理', icon: 'iconfont icon-student',roles: ['ADMIN', 'TEACHER','STUDENT']},
    component: 'Layout',
    children: [
      {
        path: '/studentManage',
        name: 'StudentInfo',
        meta: {title: '学生信息管理' ,roles: ['ADMIN', 'TEACHER']},
        component: '/student/StudentInfo'
      },
      {
        path: '/scoreManage',
        name: 'ScoreManage',
        meta: { title: '学生打分管理', roles: ['TEACHER'] },  // 只有教师能访问
        component: '/student/ScoreManage'
      },
      {
        path: '/lookupScore',
        name: 'lookupScore',
        meta: { title: '学生成绩查阅', roles: ['STUDENT'] },  // 只有教师能访问
        component: '/student/lookupScore'
      }
    ]
  },
  {
    path: '/teacher',
    name: 'Teacher',
    meta: {title: '教师管理', icon: 'iconfont icon-teacher',roles: ['ADMIN']},
    component: 'Layout',
    children: [
      {
        path: '/teacherManage',
        name: 'TeacherInfo',
        meta: {title: '教师信息管理' ,roles: ['ADMIN']},
        component: '/teacher/TeacherInfo'
      }

    ]
  },
  {
    path: '/course',
    name: 'Course',
    meta: {title: '课程管理', icon: 'iconfont icon-admin',roles: ['ADMIN','STUDENT']},
    component: 'Layout',
    children: [
      {
        path: '/selectCourse',
        name: 'SelectCourse',
        meta: {title: '选课中心' ,roles: ['ADMIN','STUDENT']},
        component: '/course/SelectCourse'
      },
      {
        path: '/courseManage',
        name: 'CourseInfo',
        meta: {title: '课程管理',roles: ['ADMIN']},
        component: '/course/CourseInfo'
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: {title: '管理员', icon: 'iconfont icon-admin',roles: ['ADMIN']},
    component: 'Layout',
    children: [
      {
        path: '/userManagement',
        name: 'UserManagement',
        meta: {title: '用户管理',roles: ['ADMIN']},
        component: '/admin/Admin'
      }
    ]
  },
  {
    path: '/agency',
    name: 'Agency',
    meta: {title: '机构', icon: 'iconfont icon-admin',roles: ['ADMIN']},
    component: 'Layout',
    children: [
      {
        path: '/classManagement',
        name: 'ClassManagement',
        meta: {title: '班级管理'},
        component: '/agency/classManage/ClassInfo'
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: {title: '仪表盘', icon: 'iconfont icon-student', roles: ['ADMIN', 'TEACHER']},
    component: 'Layout',
    children: [
      {
        path: '/educationStats',
        name: 'EducationStats',
        meta: {title: '教育统计', roles: ['ADMIN', 'TEACHER']},
        component: '/EducationStats'
      }
    ]
  }


]
