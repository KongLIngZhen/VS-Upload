<template>
  <div class="upload">
    <input
      ref="input"
      type="file"
      multiple="multiple"
      class="upload-input"
      :name="name"
      :accept="accept"
      @change="handleChange"/>
    <button
      class="upload-button"
      ref="uploadBtn"
      type="button"
      @click="handleClick"
      :disabled="disabled"
      :style="btnStyle">
      {{ text }}
    </button>
  </div>
</template>

<script>
import ajax from './upload_ajax.js'
import UploadList from '../upload_list/upload_list'
import VUEUpLoad from './upload_config'

function noop () {

}

export default {
  name: 'upload',
  components: {

  },
  created () {
    // 组件创建时检查upload_url，如果未定义则触发error返回-210
    if (!this.action) {
      const err = new Error()
      err.code = VUEUpLoad.UPLOAD_ERROR.MISSING_UPLOAD_URL
      err.message = 'upload_url is undefined'
      this.onError(err, null)
    }
  },
  props: {
    text: {
      type: String,
      default: 'Upload'
    },
    btnStyle: {
      type: Object
    },
    // 提交地址 等同于upload_url
    action: {
      type: String,
      required: true
    },
    // 上传请求头部
    headers: {
      type: Object,
      default () {
        return {}
      }
    },
    // 上传附带参数 等同于post_params
    data: {
      type: Object
    },
    // 是否支持多选文件
    multiple: {
      type: Boolean,
      default: true
    },
    // 上传文件字段名 等同于file_post_name
    name: {
      type: String,
      default: 'file'
    },
    // 上传文件类型限制 等同于file_types
    accept: {
      type: String
    },
    // 上传文件大小限制 等同于file_size_limit
    size: {
      type: String
    },
    // 是否显示上传文件列表
    showFileList: {
      type: Boolean,
      default: true
    },
    // 上传按钮点击 等同于file_dialog_start_handler
    onClick: {
      type: Function,
      default: noop
    },
    // 文件状态改变钩子 等同于file_queued_handler
    onChange: {
      type: Function,
      default: noop
    },
    // 文件窗口关闭钩子 等同于file_dialog_complete_handler
    onDialogComplete: {
      type: Function,
      default: noop
    },
    // 文件添加队列错误钩子 等同于file_queue_error_handler
    onQueueError: {
      type: Function,
      default: noop
    },
    // 上传前钩子 等同于upload_start_handler
    onBefore: {
      type: Function
    },
    // 上传时钩子 等同于upload_progress_handler
    onProgress: {
      type: Function,
      default: noop
    },
    // 上传成功时钩子 等同于upload_success_handler
    onSuccess: {
      type: Function,
      default: noop
    },
    // 上传失败时钩子 等同于uploadError
    onError: {
      type: Function,
      default: noop
    },
    // 删除文件前钩子
    // onBeforeRemove: {
    //   type: Function,
    //   default: noop
    // },
    // 文件列表删除文件钩子
    onRemove: {
      type: Function,
      default: noop
    },
    // 点击文件列表钩子
    // onPreview: {
    //   type: Function
    // },
    // 文件取消钩子
    onCancel: {
      type: Function,
      default: noop
    },
    // 文件全部取消
    onCancelAll: {
      type: Function,
      default: noop
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 文件最大上传个数
    limit: {
      type: Number
    },
    // 是否自动上传
    autoUpload: {
      type: Boolean,
      default: false
    },
    // 处理上传的Ajax方法
    httpRequest: {
      type: Function,
      default: ajax
    },
    // 上传的文件列表
    fileList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      upFiles: [],
      tempIndex: 1,
      reqs: {},
      flag: false,
      uploadList: {}
    }
  },
  watch: {
    fileList: {
      immediate: true,
      handler (fileList) {
      }
    }
  },
  computed: {

  },
  methods: {
    handleClick () {
      if (!this.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
        this.onClick()
      }
    },
    handleChange (e) {
      const files = e.target.files
      if (!files) return
      this.uploadFiles(files)
    },
    uploadFiles (files) {
      UploadList.prototype.show() // 打开列表
      let fs = Array.prototype.slice.call(files)
      if (!this.multiple) {
        fs = fs.slice(0, 1)
      }
      if (fs.length === 0) {
        return
      }
      this.flag = true
      fs.forEach(f => {
        let file = this.handleStart(f)
        // 移除文件大小的检查
        // 上传文件不能是error等状态
        // if (this.autoUpload && file.status === 'ready') {
        if (this.autoUpload && file.filestatus === VUEUpLoad.FILE_STATUS.QUEUED) {
          this.upload(f)
        }
      })
      // 一次选择文件完成后触发 fs可能是N个文件
      this.onDialogComplete(fs, this.upFiles)
    },
    handleStart (f) {
      // f.id = Date.now() + this.tempIndex++
      f.id = 'SWFUpload_LenvoBox_2018_' + this.tempIndex++
      let file = {
        id: f.id,
        index: this.upFiles.length + 1,
        name: f.name,
        type: f.name.substr(f.name.lastIndexOf('.')),
        creationdate: new Date(),
        modificationdate: new Date(),
        // status: 'ready',
        filestatus: VUEUpLoad.FILE_STATUS.QUEUED,
        size: f.size,
        percentage: 0,
        time: '00:00:00',
        raw: f
      }
      try {
        file.url = URL.createObjectURL(f)
      } catch (e) {
        console.error(e)
        return
      }
      UploadList.prototype.add(file) // 列表添加数据
      // 选取文件添加进队列前检查文件大小，触发error返回-110
      if (this.size && f.size > (this.size * 1024)) {
        const err = new Error()
        err.code = VUEUpLoad.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT
        err.message = 'file too larger'
        let message = this.onQueueError(err, f)
        UploadList.prototype.error(message, f)
        // file.status = 'error'
        file.filestatus = VUEUpLoad.FILE_STATUS.ERROR
      } else {
        this.upFiles.push(file)
        this.onChange(file, this.upFiles)
      }
      return file
      // this.upFiles.push(file)
      // this.onChange(file, this.upFiles)
    },
    upload (f) {
      this.$refs.input.value = null
      if (!this.onBefore) {
        return this.post(f)
      }

      const before = this.onBefore(this.getFile(f.id))
      if (before && before.then) {
        before.then(processedFile => {
          // if (Object.prototype.toString().call(processedFile) === '[object File]') {
          //   this.post(processedFile)
          // } else {
          //   this.post(f)
          // }
          if (processedFile) f.action = processedFile // handleUploadBefore会返回上传的最新URL
          this.post(f)
        }, (message) => {
          this.handleRemove(f, true)
          UploadList.prototype.error(message, f)
        })
      } else if (before !== false) {
        this.post(f)
      } else {
        this.handleRemove(f, true)
      }
    },
    post (f) {
      const { id } = f
      const options = {
        headers: this.headers,
        file: f,
        data: this.data,
        filename: this.name,
        action: f.action ? f.action : this.action, // 如果f中有action属性则使用f.action
        onProgress: e => {
          this.handleProgress(e, f)
        },
        onSuccess: res => {
          // this.getFile(f.id).status = 'success'
          this.getFile(f.id).filestatus = VUEUpLoad.FILE_STATUS.COMPLETE
          this.onSuccess(res, f)
          delete this.reqs[id]
          UploadList.prototype.success(f, this.upFiles) // 上传成功改变列表
        },
        /* eslint-disable */
        onError: err => {
          // this.getFile(f.id).status = 'error'
          this.getFile(f.id).filestatus = VUEUpLoad.FILE_STATUS.ERROR
          let message = this.onError(err, f)
          delete this.reqs[id]
          UploadList.prototype.error(message, f) //
        }
      }
      const req = this.httpRequest(options)
      this.reqs[id] = req

      if (req && req.then) {
        req.then(options.onSuccess, options.onError)
      }
    },
    handleProgress (ev, file) {
      let f = this.getFile(file.id)
      this.onProgress(ev, f, this.upFiles)
      // f.status = 'uploading'
      f.filestatus = VUEUpLoad.FILE_STATUS.IN_PROGRESS
      f.percentage = ev.percent || 0
      f.time = ev.time || '00:00:00'
      UploadList.prototype.progress(f) // 上传改变文件显示
    },
    getFile (f) {
      let fileList = this.upFiles
      let target
      fileList.every(item => {
        target = f == item.id ? item : null
        return !target
      })
      return target
    },
    handleRemove (file, raw) {
      if (raw) {
        file = this.getFile(file.id)
      }
      this.abort(file)
      let fileList = this.upFiles
      fileList.splice(fileList.indexOf(file), 1)
      this.onRemove(file, fileList)
    },
    abort (file) {
      const { reqs } = this
      if (file) {
        let id = file
        if (file.id) id = file.id
        if (reqs[id]) {
          reqs[id].abort()
        }
      } else {
        Object.keys(reqs).forEach((id) => {
          if (reqs[id]) reqs[id].abort()
          delete reqs[id]
        })
      }
    },
    /**
     * 检查上传状态
     * @description 用于上传列表关闭
     */
    checkUploadStatus () {
      for (let item of this.upFiles) {
        // if (item.status === 'uploading') {
        if (item.filestatus === VUEUpLoad.FILE_STATUS.IN_PROGRESS) {
          if (window.confirm('Are you sure?')) {
            const { reqs } = this
            Object.keys(reqs).forEach((id) => {
              if (reqs[id]) reqs[id].abort()
              delete reqs[id]
            })
            this.upFiles = []
            this.flag = false
            return true
          }
          return false
        }
      }
      this.upFiles = []
      this.flag = false
      return true
    },
    /**
     * 取消上传
     * @param fid 取消上传id
     * @description 该方法同步SWF的cancelUpload，不同的是不会触发uploadError
     */
    cancelUpload (fid) {
      let file = this.getFile(fid)
      const { reqs } = this
      // 如果fid不存在 则取消全部uploading状态文件的上传
      if (file) {
        let id = file
        if (file.id) id = file.id
        if (reqs[id]) {
          reqs[id].abort()
          // file.status = 'cancel'
          file.filestatus = VUEUpLoad.FILE_STATUS.CANCELLED
          file.time = '00:00:00'
          file.percentage = 100
          this.onCancel(file)
        }
      } else {
        for (let item of this.upFiles) {
          // if (item.status === 'uploading') {
          if (item.filestatus === VUEUpLoad.FILE_STATUS.IN_PROGRESS) {
            if (reqs[item.id]) {
              reqs[item.id].abort()
            }
            delete reqs[item.id]
            // item.status = 'cancel'
            item.filestatus = VUEUpLoad.FILE_STATUS.CANCELLED
            item.time = '00:00:00'
            item.percentage = 100
          }
        }
        this.onCancelAll(this.upFiles)
      }
    },
    /**
     * 手动
     * @description 如果autoUpload为false 则组件进行到handleStart时就会停止，file_dialog_complete_handler中可以
     * 调用this.startUpload手动上传列表中所谓未上传状态的文件
     */
    startUpload () {
      this.flag = true
      this.upFiles.forEach(f => {
        // if (f.status === 'ready') {
        if (f.filestatus === VUEUpLoad.FILE_STATUS.QUEUED) {
          this.upload(f.raw)
        }
      })
    },
  }
}
</script>

<style>
  .upload-button {
    background-color: #157BF8;
    border: 1px solid #0E6CDF;
    display: inline-block;
    height: 30px;
    width: 95px;
    border-radius: 2px;
    color: #fff;
  }
  .upload-input {
    display: none;
  }
  .uploadList-enter-active, .uploadList-leave-active {
    transition: all 1.5s;
  }
  .uploadList-enter, .uploadList-leave-to {
    opacity: 0;
  }
  .uploadList-enter {
    transform: translateY(+100%);
  }
  .uploadList-leave-active {
    transform: translateY(100%);
  }
  .upload-list {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 700px;
    height: 400px;
    background-color: #ffffff;
    /*padding: 20px;*/
    /*border: 1px solid #409eff;*/
    z-index: 1000;
    border-radius: 4px;
  }
  .upload-list-header {
    height: 30px;
    width:  100%;
    background-color: #26b99a;
    border: 1px solid #26b99a;
    font-size: 12px;
    color: #ffffff;
    line-height:  30px;
    padding: 0 5px;
    position: relative;
  }
  .upload-list-header-title {

  }
  .upload-list-header-tool {
    position: absolute;
    top: 0;
    right: 10px;
  }
  .upload-list-header-tool i {
    margin-right: 10px;
  }
  .upload-list-body {
    height: 100%;
    border: 1px solid #26b99a;
    font-size: 12px;
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
    overflow-y: auto;
  }
  .upload-list-body table {
    table-layout: fixed;
  }
  .upload-list-body table>thead {
    color: #909399;
    font-weight: 500;
  }
  .upload-list-body table>tbody {
    color: #606266;
  }
  .upload-list-body table td {
    padding: 0 10px;
    line-height: 40px;
  }
  .upload-list-body table>tbody td:first-child,
  .upload-list-body table>tbody td.error {
    overflow: hidden;
    white-space: nowrap;
    display: -webkit-box;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .pause, .check {
    cursor:pointer;
  }
  .pause i {
    color: #d61818;
  }
  .check i {
    color: #26b99a;
  }
  .upload-list-body-filename {
    color: #409eff;
    cursor: pointer;
  }
  .cancel-all {
    color: #26b99a;
    cursor: pointer;
  }
</style>
