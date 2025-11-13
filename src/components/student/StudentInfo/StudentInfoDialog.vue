<template>
  <div>
    <!--添加学生信息弹窗-->
    <el-dialog v-model="dialogVisible" @close="closeDialog" title="添加学生信息" width="550">
      <el-form
          ref="stuFormRef"
          :model="stuForm"
          :rules="stuFormRules"
          label-position="left"
          label-width="80px">
<!--prop 是 表单项对应的数据字段名，Element Plus 会根据它找到 :model 里的某个属性，从而实现 自动校验。-->
        <el-form-item label="学生年级" prop="classId">
          <el-select v-model="stuForm.gradeId" :placeholder="gradeList[0].name">
            <el-option v-for="item in gradeList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="stuForm.name" minlength="2" maxlength="20" placeholder="请输入姓名"/>
        </el-form-item>

        <el-form-item label="学生学号" prop="stuId">
          <el-input
              v-model="stuForm.stuId"
              :disabled="type === 'edit'"
              placeholder="请输入学号"
          />
        </el-form-item>

        <el-form-item label="学生性别" prop="sex">
          <el-radio-group v-model="stuForm.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
<!--v-model="stuForm.birthday"	把选择的日期绑定到 stuForm.birthday
    type="date"	选择单个日期
    format	显示在输入框里的格式（YYYY-MM-DD）
    value-format	真正绑定到数据里的格式（同样是 YYYY-MM-DD）
    placeholder	输入提示
    @change="getAgeDate"	当用户选择完日期时，会触发 getAgeDate 方法-->
        <el-form-item label="年龄" prop="age">
          <span style="display: flex">
            <el-date-picker
                v-model="stuForm.birthday"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择出生年月"
                @change="getAgeDate"
            />
<!--disabled:“禁用这个输入框，让用户不能修改它的值”            -->
          <el-input v-model="stuForm.age" class="add-input-age" placeholder="年龄" disabled/>
          </span>
        </el-form-item>

        <el-form-item label="生源地" prop="address">
          <el-input v-model="stuForm.address" type="text" show-word-limit minlength="2" maxlength="255" placeholder="请输入生源地地址"/>
        </el-form-item>

        <el-form-item label="联系方式" prop="phoneNo">
          <el-input v-model="stuForm.phoneNo" placeholder="请输入联系方式"/>
        </el-form-item>

        <el-form-item label="学生院系" prop="collegeId">
          <el-select v-model="stuForm.collegeId" placeholder="请选择" @change="chooseCollege">
            <el-option v-for="item in collegeList" :key="item.id" :label="item.collegeName" :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="学生专业" prop="specialtyId">
          <el-select v-model="stuForm.specialtyId" placeholder="请选择" @change="chooseSpecialty">
            <el-option v-for="item in specialtyList" :key="item.id" :label="item.specialtyName" :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="学生班级" prop="classId">
          <el-select v-model="stuForm.classId" placeholder="请选择">
            <el-option v-for="item in classList" :key="item.id" :label="item.className" :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmAddStu">确认</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { get, post } from "@/http/http";
import { api } from "@/http/api";
import { getTimeFromSomeDateToNow } from "@/utils/date-util";
import { storagekey } from "@/utils/constants";

const props = defineProps({
  type: String,
  dialogVisible: Boolean,
  editStuInfo: Object
})
const $emit = defineEmits(['closeDialog', 'confirmDialog'])

let dialogVisible = ref(false)

const baseInfo = {
  grade: '',
  name: '',
  stuId: '',
  sex: '0',
  birthday: (new Date().getFullYear() - 18) + '-01-01',
  age: '',
  address: '',
  phoneNo: '',
  collegeId: '',
  specialtyId: '',
  classId: ''
}
let stuForm = ref(JSON.parse(JSON.stringify(baseInfo)))

const stuFormRules = reactive({
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  name: [{
    required: true,
    message: '请输入姓名',
    trigger: 'blur'
  }, {
    pattern: /(^[\u4e00-\u9fa5]{1}[\u4e00-\u9fa5\.·。]{0,18}[\u4e00-\u9fa5]{1}$)|(^[a-zA-Z]{1}[a-zA-Z\s]{0,18}[a-zA-Z]{1}$)/,
    message: '请输入正确的名字'
  }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择出生年月', trigger: 'blur' }],
  age: [{ required: true, message: '请选择出生年月', trigger: 'blur' }],
  address: [{ required: true, message: '请输入生源地', trigger: 'blur' }],
  phoneNo: [{
    required: false,
    message: '请输入联系方式',
    trigger: 'blur'
  }, { pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: '请输入正确的手机号码或者座机号' }],
  collegeId: [{ required: true, message: '请选择院系', trigger: 'change' }],
  specialtyId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'blur' }]
})

let gradeList = ref([
  { id: 1, name: '大一' },
  { id: 2, name: '大二' },
  { id: 3, name: '大三' },
  { id: 4, name: '大四' }
])
let collegeList = ref([])
let specialtyList = ref([])
let classList = ref([])
let stuFormRef = ref(null)

watch(() => props.dialogVisible, (newVal) => {
  dialogVisible.value = newVal
  if (dialogVisible.value && Object.keys(props.editStuInfo).length) {
    stuForm.value = JSON.parse(JSON.stringify(props.editStuInfo))
    stuForm.value.sex = JSON.stringify(stuForm.value.sex)
    stuForm.value. collegeId = parseFloat(stuForm.value.collegeId)

    chooseCollege(stuForm.value.collegeId, 'init')
    chooseSpecialty(stuForm.value.specialtyId, 'init')
  } else {
    stuForm.value = JSON.parse(JSON.stringify(baseInfo))
  }
})

onMounted(() => {
  initCollegeList()
})

// ===== 方法区 =====

const getAgeDate = (params) => {
  if (params) {
    const time = getTimeFromSomeDateToNow(params)
    stuForm.value.age = time.year
  } else {
    stuForm.value.age = ''
  }
}

const initCollegeList = (init) => {
  get(api.getAllCollege)
      .then(res => {
        // 先判断 res 是否存在，防止报错
        if (res && res.data && res.data.length) {
          collegeList.value = res.data

        } else {
          collegeList.value = []
        }

        // 如果传入 init，则清空班级选择
        if (init) {
          classList.value = []
          stuForm.value.classId = ''
        }
      })
      .catch(err => {
        console.error('获取学院列表失败：', err)
        collegeList.value = []
        if (init) {
          classList.value = []
          stuForm.value.classId = ''
        }
      })
}

const chooseCollege = (id, init) => {
  post(api.getSpecialtyByCollege + "?id=" + id)
      .then(res => {
    if (res.code === 200 && res.data?.length) {
      specialtyList.value = res.data
      if (!init) {
        stuForm.value.specialtyId = ''
        classList.value = []
        stuForm.value.classId = ''
      }
    }
  })
}

const chooseSpecialty = (id, init) => {
  post(api.getClassBySpecialty+ "?id=" + id)
      .then(res => {
    if (res.code === 200 && res.data?.length) {
      classList.value = res.data
      if (!init) {
        stuForm.value.classId = ''
      }
    }
  })
}

const confirmAddStu = () => {
  stuFormRef.value.validate((valid) => {
    if (valid) {
      let url = api.addStu
      let param = stuForm.value
      param.age = parseFloat(param.age)

      if (props.type === 'add') {
        param.gradeId = stuForm.value.grade || 1 // 默认大一
      } else {
        url = api.updateStu
        // 修改者
        param.user = localStorage.getItem(storagekey.username)
      }

      post(url, param).then(res => {
        if (res.code === 200) {
          confirmDialog()
          stuForm.value = JSON.parse(JSON.stringify(baseInfo))
          ElMessage({ message: props.type === 'add' ? '新增成功' : '修改成功', type: 'success' })
        } else {
          ElMessage.error(props.type === 'add' ? '新增失败' : '修改失败')
        }
      }).catch(err => {
        console.error(err)
        ElMessage.error('请求失败')
      })
    }
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
<script>
export default {
  name: "StudentInfoDialog"
}
</script>

<style scoped>
.add-input-age {
  width: 50px;
  height: 30px;
}
</style>
