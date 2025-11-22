/**
 * @description: 接口地址组件
 * @author: newhome
 * @date: 2023-02-20 14:17:44
 */

export const api = {
  getStuInfo: '/api/getStuInfo',
  getSpecialtyByCollege: '/api/getSpecialtyByCollege',
  getClassBySpecialty: '/api/getClassBySpecialty',
  getAllCollege: '/api/getAllCollege',
  addStu: '/api/addStu',
  getStuByNameOrId: '/api/getStuByNameOrId',
  deselectCourse: '/api/deselectCourse',
  delStu: '/api/delStu',
  updatePas: '/api/updatePas',
  updateStu: '/api/updateStu',
  updateSta: '/api/updateSta',
  getCourseList: '/api/getCourseList',
  selectCourse: '/api/selectCourse',
  getSelectedCourse: '/api/getSelectedCourse',
  getGrade: '/api/getGrade',
  getTeacherInfo:"/api/getTeacherInfo",
  addTeacher:"/api/addTeacher",
  updateTeacher:"/api/updateTeacher",
  delTeacher:"/api/delTeacher",
  admin: {
    getAdminInfo: '/api/getAdminInfo',
    getRoleList: '/api/getRoleList',
    addAdmin: '/api/addAdmin',
    delAdmin: '/api/delAdmin'
  },
  agency: {
    getClass: '/api/getClass',
    getTeacher: '/api/getTeacher',
    updateClass: '/api/updateClass',
    addClass: '/api/addClass',
    delClass: 'api/delClass'
  },
  system: {
    login: '/auth/login'
  }
}
