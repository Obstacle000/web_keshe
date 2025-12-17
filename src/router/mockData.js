export const menu = [
  {
    path: '/student',
    name: 'Student',
    meta: {title: '学生管理', icon: 'iconfont icon-student',roles: ['ADMIN', 'TEACHER']},
    component: 'Layout',
    children: [
      {
        path: '/studentManage',
        name: 'StudentInfo',
        meta: {title: '学生信息管理' ,roles: ['ADMIN', 'TEACHER']},
        component: '/student/StudentInfo'
      },
      {
        path: '/student2',
        name: 'Student2',
        meta: {title: '学生2',roles: ['ADMIN', 'TEACHER']},
        component: '/student/Student2'
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
      },
      {
        path: '/teacher1',
        name: 'Teacher1',
        meta: {title: '教师',roles: ['ADMIN']},
        component: '/teacher/teacher1'
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
    meta: {title: '机构', icon: 'iconfont icon-admin'},
    component: 'Layout',
    children: [
      {
        path: '/classManagement',
        name: 'ClassManagement',
        meta: {title: '班级管理'},
        component: '/agency/classManage/ClassInfo'
      }
    ]
  }


]
