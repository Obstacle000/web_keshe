<template>
  <div>
    <!--添加老师信息弹窗-->
    <el-dialog v-model="dialogVisible" @close="closeDialog" title="添加老师信息" width="550">
      <el-form
          ref="teacherFormRef"
          :model="teacherForm"
          :rules="teacherFormRules"
          label-position="left"
          label-width="80px">

        <!--老师姓名-->
        <el-form-item label="老师姓名" prop="name">
          <el-input v-model="teacherForm.name" minlength="2" maxlength="20" placeholder="请输入姓名"/>
        </el-form-item>

        <!--老师工号-->
        <el-form-item label="工号" prop="teacherId" v-if="type==='edit'">
          <el-input v-model="teacherForm.teacherId" disabled/>
        </el-form-item>

        <!--老师性别-->
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="teacherForm.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <!--出生日期 + 年龄 -->
        <el-form-item label="年龄" prop="age">
          <span style="display: flex">
            <el-date-picker
                v-model="teacherForm.birthday"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择出生年月"
                @change="getAgeDate"
            />
            <el-input v-model="teacherForm.age" class="add-input-age" placeholder="年龄" disabled/>
          </span>
        </el-form-item>

        <!--联系方式-->
        <el-form-item label="联系方式" prop="phoneNo">
          <el-input v-model="teacherForm.phoneNo" placeholder="请输入联系方式"/>
        </el-form-item>

        <!--所属院系-->
        <el-form-item label="所属院系" prop="collegeId">
          <el-select v-model="teacherForm.collegeId" placeholder="请选择" @change="chooseCollege">
            <el-option v-for="item in collegeList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>

        <!--所属专业/科目-->
        <el-form-item label="所属专业" prop="specialtyId">
          <el-select v-model="teacherForm.specialtyId" placeholder="请选择" @change="chooseSpecialty">
            <el-option v-for="item in specialtyList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="confirmAddTeacher">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, onMounted, watch} from "vue";
import {get, post} from "@/http/http";
import {api} from "@/http/api";
import {getTimeFromSomeDateToNow} from "@/utils/date-util";

const props = defineProps({
  type: String,
  dialogVisible: Boolean,
  editTeacherInfo: Object
})
const $emit = defineEmits(['closeDialog', 'confirmDialog'])

let dialogVisible = ref(false)

// 表单基础信息
const baseInfo = {
  name: '',
  teacherId: '',
  sex: '0',
  birthday: (new Date().getFullYear() - 30) + '-01-01', // 默认年龄30岁
  age: '',
  phoneNo: '',
  collegeId: '',
  specialtyId: ''
}
let teacherForm = ref(JSON.parse(JSON.stringify(baseInfo)))

// 表单校验
const teacherFormRules = reactive({
  name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
  teacherId: [{required: true, message: '请输入工号', trigger: 'blur'}],
  sex: [{required: true, message: '请选择性别', trigger: 'change'}],
  birthday: [{required: true, message: '请选择出生年月', trigger: 'blur'}],
  age: [{required: true, message: '请选择出生年月', trigger: 'blur'}],
  phoneNo: [{pattern: /^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/, message: '请输入正确联系方式', trigger: 'blur'}],
  collegeId: [{required: true, message: '请选择院系', trigger: 'change'}],
  specialtyId: [{required: true, message: '请选择专业', trigger: 'change'}]
})

let collegeList = ref([])
let specialtyList = ref([])
let teacherFormRef = ref(null)

watch(() => props.dialogVisible, (newVal) => {
  dialogVisible.value = newVal
  if (dialogVisible.value && Object.keys(props.editTeacherInfo).length) {
    teacherForm = ref(JSON.parse(JSON.stringify(props.editTeacherInfo)))
    teacherForm.value.sex = JSON.stringify(teacherForm.value.sex)
    teacherForm.value.collegeId = parseFloat(teacherForm.value.collegeId)
    chooseCollege(teacherForm.value.collegeId, 'init')
    chooseSpecialty(teacherForm.value.specialtyId, 'init')
  } else {
    teacherForm = ref(JSON.parse(JSON.stringify(baseInfo)))
  }
})

onMounted(() => {
  initCollegeList()
})

// methods
const getAgeDate = (params) => {
  if (params) {
    const time = getTimeFromSomeDateToNow(params)
    teacherForm.value.age = time.year
  } else {
    teacherForm.value.age = ''
  }
}

const initCollegeList = () => {
  get(api.getAllCollege).then(res => {
    if (res.data && res.data.length) {
      collegeList.value = res.data
    }
  })
}

const chooseCollege = (id, init) => {
  post(api.getSpecialtyByCollege, {id}).then(res => {
    if (res.code === 200 && res.data.length) {
      specialtyList.value = res.data
      if (!init) teacherForm.value.specialtyId = ''
    }
  })
}

const chooseSpecialty = (id, init) => {
  // 预留逻辑，如果老师有科目对应下属列表可以处理
}

const confirmAddTeacher = () => {
  teacherFormRef.value.validate((valid) => {
    if (!valid) return
    let url = props.type === 'add' ? api.addTeacher : api.updateTeacher
    post(url, teacherForm.value).then(res => {
      if (res.code === 200) {
        ElMessage({message: props.type==='add'?'新增成功':'修改成功', type:'success'})
        confirmDialog()
        teacherForm = ref(JSON.parse(JSON.stringify(baseInfo)))
      } else {
        ElMessage.error(props.type==='add'?'新增失败':'修改失败')
      }
    }).catch(err => {
      console.error(err)
      ElMessage.error('请求失败')
    })
  })
}

const closeDialog = () => {
  dialogVisible.value = false
  $emit('closeDialog', dialogVisible)
}

const confirmDialog = () => {
  dialogVisible.value = false
  $emit('confirmDialog', dialogVisible)
}
</script>

<style scoped>
.add-input-age {
  width: 50px;
  height: 30px;
}
</style>
