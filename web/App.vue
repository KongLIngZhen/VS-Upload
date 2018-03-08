<template>
  <div id="app">
    <upload
      action="https://www.easy-mock.com/mock/5a59a15cd65c5d77fcb469d1/example/upload"
      :on-click="handleUploadClick"
      :on-change="handleUploadChange"
      :on-before="handleUploadBefore"
      :on-progress="handleUploadProgress"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-remove="handleUploadRemove"
      :on-preview="handleUploadPreview"
      :on-cancel="handleUploadCancel"
      :on-cancel-all="handleUploadCancelAll"
      :show-file-list="true"
      :disabled="false"
    ></upload>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      user: {
        username: 'sy',
        age: 18,
        gender: 1,
        type: 'admin'
      },
      options: [
        { label: '管理员', val: 'admin' },
        { label: '成员', val: 'member' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        age: [
          { type: 'number', required: true, message: '请输入年龄' }
        ],
        type: [
          { required: true, message: '请选择角色' }
        ]
      }
    }
  },
  created () {

  },
  methods: {
    onsubmit () {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          alert(JSON.stringify(this.user))
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm () {
      this.$refs['userForm'].resetForm()
    },
    handleUploadClick () {
      alert('you have clicked the upload button!')
    },
    handleUploadChange (file, fileList) {
      console.log('---------- handleUploadChange ----------')
      console.log(file)
      console.log(fileList)
    },
    handleUploadBefore (file) {
      console.log('---------- handleUploadBefore ----------')
      console.log(file)
      if (file.name === '04-compile-time-optimizations-evan-you.pdf') {
        return false
      }
    },
    handleUploadProgress (e, file, fileList) {
      console.log('---------- handleUploadProgress ----------')
      console.log(file)
      console.log(fileList)
    },
    handleUploadSuccess (res, file) {
      console.log('---------- handleUploadSuccess ----------')
      console.log(res)
      console.log(file)
    },
    handleUploadError (err, file) {
      console.log('---------- handleUploadError ----------')
      console.log(err)
      console.log(file)
    },
    handleUploadRemove (file, fileList) {
      console.log('---------- handleUploadRemove ----------')
      console.log(file)
      console.log(fileList)
    },
    handleUploadPreview (file) {
      console.log('---------- handleUploadPreview ----------')
      console.log(file)
    },
    handleUploadCancel (file) {
      console.log('---------- handleUploadCancel ----------')
      console.log(file)
    },
    handleUploadCancelAll (fileList) {
      console.log('---------- handleUploadCancelAll ----------')
      console.log(fileList)
    }
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 30px;
  }
  .demo-card {
    border: 1px solid #dedede;
    border-radius: 4px;
    box-shadow: 3px 3px 3px #e8e8e8;
    padding: 20px;
    height: 500px;
  }
  h1 {
    text-align: center;
    color: #606266;
    margin-bottom: 20px;
  }
</style>
