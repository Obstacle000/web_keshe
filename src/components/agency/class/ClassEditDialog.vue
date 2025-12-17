<template>
  <el-dialog
      v-model="innerVisible"
      title="班级信息"
      width="520px"
      @close="closeDialog"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
    >
      <!-- 年级 -->
      <el-form-item label="年级" prop="grade">
        <el-select v-model="form.grade" placeholder="请选择年级" :disabled="type === 'edit'">
          <el-option
              v-for="g in gradeList"
              :key="g"
              :label="`${g}级`"
              :value="g"
          />
        </el-select>
      </el-form-item>

      <!-- 专业 -->
      <el-form-item label="专业" prop="specialtyId">
        <el-select v-model="form.specialtyId" placeholder="请选择专业">
          <el-option
              v-for="s in specialtyList"
              :key="s.id"
              :label="s.specialtyName"
              :value="s.id"
          />
        </el-select>
      </el-form-item>

      <!-- 班级编号 -->
      <el-form-item label="班级编号" prop="classCode">
        <el-input v-model="form.classCode" />
      </el-form-item>

      <!-- 班级名称 -->
      <el-form-item label="班级名称" prop="className">
        <el-input v-model="form.className" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { post } from '@/http/http'
import { api } from '@/http/api'

/* props */
const props = defineProps({
  type: String,              // add | edit
  dialogVisible: Boolean,
  editClassInfo: Object
})

/* emits */
const emit = defineEmits(['closeDialog', 'confirmDialog'])

/* dialog */
const innerVisible = ref(false)

/* form */
const baseForm = {
  id: null,
  grade: null,
  specialtyId: null,
  classCode: '',
  className: ''
}

const form = ref({ ...baseForm })
const formRef = ref(null)

/* rules */
const rules = {
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  specialtyId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  classCode: [{ required: true, message: '请输入班级编号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]
}

/* 年级列表（今年往前 4 年） */
const gradeList = ref([])

const initGradeList = () => {
  const year = new Date().getFullYear()
  gradeList.value = Array.from({ length: 5 }, (_, i) => year - i)
}

/* 专业列表 */
const specialtyList = ref([])

const loadSpecialtyList = () => {
  post(api.getSpecialtyList).then(res => {
    if (res.code === 200) {
      specialtyList.value = res.data || []
    }
  })
}

/* watch dialog */
watch(
    () => props.dialogVisible,
    (val) => {
      innerVisible.value = val
      if (val) {
        if (props.type === 'edit' && props.editClassInfo) {
          form.value = { ...props.editClassInfo }
        } else {
          form.value = { ...baseForm }
        }
      }
    }
)

/* submit */
const submit = () => {
  formRef.value.validate(valid => {
    if (!valid) return

    const url =
        props.type === 'add'
            ? api.agency.addClass
            : api.agency.updateClass

    post(url, form.value).then(res => {
      if (res.code === 200) {
        emit('confirmDialog', false)
        innerVisible.value = false
      }
    })
  })
}

/* close */
const closeDialog = () => {
  innerVisible.value = false
  emit('closeDialog', false)
}

/* mounted */
onMounted(() => {
  initGradeList()
  loadSpecialtyList()
})
</script>

<script>
export default {
  name: 'ClassEditDialog'
}
</script>
