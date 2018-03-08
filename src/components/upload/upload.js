import SWFUpload from './upload_swf/swfupload.js'
import Settings from './config.js'
import UploadList from './upload_list/upload_list'

window.SWFUpload = SWFUpload

let Upload = (function () {
  let uploadSingle

  const Upload = function (options) {
    if (uploadSingle) {
      return uploadSingle
    }
    this.options = Object.assign(Settings, options)
    let _instance = this.init(this.options)
    if (!_instance) {
      console.error('create Vue or SWF instance failed')
      return
    }
    uploadSingle = _instance
    // let uploadList = new UploadList(_instance.$children[0], options)
    /* eslint-disable no-new */
    new UploadList(_instance.$children ? _instance.$children[0] : _instance, this.options)
    return _instance
  }

  /**
   * 上传组件初始化
   * @description 判断环境是否支持H5，支持返回Vue实例，否则返回SWF实例
   * Upload.defaults.swf_mode 如果为true 则强制使用SWF模式 用于调试
   * @param options
   * @returns {VUE or SWF}
   */

  Upload.prototype.init = function (options) {
    if (this.isSupportHTML5() && !Upload.defaults.swf_mode) {
      console.log('The environment supports H5')
      let v = this.initVue(options)
      if (options.drop) {
        this.dropUpload(options, v)
      }
      return v
    } else {
      console.log('The environment supports Flash')
      return this.initSWF(options)
    }
  }

  Upload.prototype.dropUpload = function (options, v) {
    /* eslint-disable no-undef */
    $('body').append('<div id="drop_box" style="pointer-events: none"></div>')
    $(document).on({
      dragleave: function (e) {
        e.preventDefault()
      },
      drop: function (e) {
        e.preventDefault()
      },
      dragenter: function (e) {
        e.preventDefault()
      },
      dragover: function (e) {
        e.preventDefault()
      }
    })
    let lastenter
    $('#' + options.drop_id).on({
      drop: function (e) {
        // jquery的file要去e.originalEvent里面拿
        let files = e.originalEvent.dataTransfer.files
        e.target.files = files
        v.$children[0].handleChange(e)
        $('#drop_box').css({
          width: '1px',
          height: '1px',
          position: 'none',
          'z-index': 0,
          top: 0,
          'pointer-events': 'none'
        })
        lastenter = null // 解决dragleave父子元素之间的拖拽问题
        e.preventDefault()
      },
      dragleave: function (e) {
        // console.log('leave + target + ' + e.target)
        // console.log('leave + lastenter + ' + lastenter)
        if (e.target === lastenter) {
          $('#drop_box').css({
            width: '1px',
            height: '1px',
            position: 'none',
            'z-index': 0,
            top: 0,
            'pointer-events': 'none'
          })
        }
        e.preventDefault()
        e.stopPropagation()
      },
      dragover: function (e) {
        e.preventDefault()
        e.stopPropagation()
      },
      dragenter: function (e) {
        $('#drop_box').css({
          width: '100%',
          height: '100%',
          position: 'fixed',
          'z-index': 800,
          background: '#666666',
          opacity: 0.5,
          top: 0
        })
        lastenter = e.target
        // console.log('enter + target + ' + e.target)
        // console.log('enter + lastenter + ' + lastenter)
        e.preventDefault()
        e.stopPropagation()
      }
    })
  }

  /**
   * 判断当前环境是否支持H5
   * @returns {boolean}
   */

  Upload.prototype.isSupportHTML5 = function () {
    try {
      if (typeof FileReader === 'undefined') return false
      if (typeof Blob === 'undefined') return false
      let blob = new Blob()
      if (!blob.slice && !blob.webkitSlice) return false
      if (!('draggable' in document.createElement('span'))) return false
    } catch (e) {
      return false
    }
    return true
  }

  /**
   * 实例Vue对象
   * @description 创建Vue对象前必须在环境中加载Vue和i18n
   * @param options
   * @returns {CombinedVueInstance<V extends Vue, Object, Object, Object, Record<never, any>> | Vue | *}
   */

  Upload.prototype.initVue = function (options) {
    let i18n = window.i18n
    if (window.Vue && i18n) {
      return new window.Vue({
        el: '#app',
        i18n,
        data: {
          text: options.text,
          btnStyle: options.btnStyle,
          upload_url: options.upload_url,
          headers: options.headers,
          file_post_name: options.file_post_name,
          post_params: options.post_params,
          file_types: options.file_types,
          file_size_limit: options.file_size_limit
        },
        methods: {
          handleUploadClick () {
            options.file_dialog_start_handler()
          },
          handleUploadChange (file, fileList) {
            options.file_queued_handler.call(this, file)
            // options.file_dialog_complete_handler.call(this, file, fileList)
          },
          handleDialogComplete (filesSelected, filesQueued) {
            // 使用call是希望调用者可以使用this.startUpload()手动上传
            options.file_dialog_complete_handler.call(this, filesSelected, filesQueued)
          },
          handleQueueError (err, file) {
            return options.file_queue_error_handler(file, err.code, err.message)
          },
          handleUploadBefore (file) {
            return new Promise((resolve, reject) => {
              this.$nextTick(() => {
                let res = options.upload_start_handler.call(this, file)
                if (res.result) {
                  resolve(this.upload_url)
                } else {
                  /* eslint-disable */
                  reject(res.message)
                }
              })
            })
          },
          handleUploadProgress (e, file, fileList) {
            options.upload_progress_handler(file, e.loaded, e.total)
          },
          handleUploadSuccess (res, file) {
            options.upload_success_handler(file, res, '')
          },
          handleUploadError (err, file) {
            return options.upload_error_handler(file, err.code, err.message)
          },
          handleUploadRemove (file, fileList) {

          },
          handleUploadPreview (file) {

          },
          handleUploadCancel (file) {

          },
          handleUploadCancelAll (fileList) {

          },
          startUpload () {
            this.$children[0].startUpload()
          },
          /**
           * 设置上传URL
           * @param url
           * @description 在upload_start_handler中可以调用this.setUploadURL在上传前最后一步改变URL
           */
          setUploadURL (url) {
            if (url && url !== '') {
              this.upload_url = url
            } else {
              console.error('URL is undefined')
            }
          }
        }
      })
    } else {
      console.log('window.vue and i18n have not found')
    }
  }

  /**
   * 实例SWF
   * @description SWFUpload插件已被打包到组件中，不需单独引入
   * 使用SWF上传时，组件只负责实例化插件，可以操作所有SWF支持的API，组件内部不做任何处理
   * @param options
   * @returns {*}
   */

  Upload.prototype.initSWF = function (options) {
    return new SWFUpload(options)
  }

  let upFiles = [] // 上传文件集合
  let begin // 上传开始时间

  /**
   * 修改SWFUpload原型链fileDialogComplete
   * @param numFilesSelected
   * @param numFilesQueued
   * @param numFilesInQueue
   */

  SWFUpload.prototype.fileDialogComplete = function (numFilesSelected, numFilesQueued, numFilesInQueue) {
    this.queueEvent('file_dialog_complete_handler', [numFilesSelected, numFilesQueued, numFilesInQueue])
    if (numFilesInQueue !== 0) {
      UploadList.prototype.show() // 打开列表
      begin = new Date().getTime() // 生成一个开始时间
    }
  }

  /**
   * 修改SWFUpload原型链uploadStart
   * @param file
   */

  SWFUpload.prototype.uploadStart = function (file) {
    file = this.unescapeFilePostParams(file)
    this.queueEvent('return_upload_start_handler', file)
    let f = Object.assign({}, file)
    // let f = {
    //   // status: 'ready',
    //   filestatus: SWFUpload.FILE_STATUS.QUEUED,
    //   name: file.name,
    //   size: file.size,
    //   percentage: 0,
    //   id: file.id,
    //   time: '00:00:00',
    //   raw: file,
    //   type: file.name.substr(file.name.lastIndexOf('.'))
    // }
    f.percentage = 0
    f.time = '00:00:00'
    f.raw = file
    UploadList.prototype.add(f) // 列表添加数据
    upFiles.push(f)
  }

  /**
   * 修改SWFUpload原型链returnUploadStart
   * @param file
   */

  SWFUpload.prototype.returnUploadStart = function (file) {
    let returnValue
    if (typeof this.settings.upload_start_handler === 'function') {
      file = this.unescapeFilePostParams(file)
      let res = this.settings.upload_start_handler.call(this, file)
      returnValue = res.result // important！！！
      if (!res.result) {
        UploadList.prototype.error(res.message, file)
      }
    } else if (this.settings.upload_start_handler != undefined) {
      throw 'upload_start_handler must be a function'
    }

    // Convert undefined to true so if nothing is returned from the upload_start_handler it is
    // interpretted as 'true'.
    if (returnValue === undefined) {
      returnValue = true
    }

    returnValue = !!returnValue

    this.callFlash('ReturnUploadStart', [returnValue])
  }

  /**
   * 修改SWFUpload原型链uploadProgress
   * @param file
   * @param bytesComplete
   * @param bytesTotal
   */

  SWFUpload.prototype.uploadProgress = function (file, bytesComplete, bytesTotal) {
    file = this.unescapeFilePostParams(file)
    this.queueEvent('upload_progress_handler', [file, bytesComplete, bytesTotal])
    let f = getFile(file.id)
    // f.status = 'uploading'
    f.filestatus = file.filestatus
    f.modificationdate = file.modificationdate
    if (bytesTotal > 0) {
      if (bytesComplete > 0) {
        let now = new Date().getTime()
        let dValue = now - begin
        let res = bytesTotal / (bytesComplete / dValue) - dValue
        f.time = getTime(res)
      } else {
        f.time = '00:00:00'
      }
      f.percentage = bytesComplete / bytesTotal * 100
      UploadList.prototype.progress(f) // 上传改变文件显示
    }
  }

  /**
   * 修改SWFUpload原型链uploadSuccess
   * @param file
   * @param serverData
   * @param responseReceived
   */

  SWFUpload.prototype.uploadSuccess = function (file, serverData, responseReceived) {
    file = this.unescapeFilePostParams(file)
    this.queueEvent('upload_success_handler', [file, serverData, responseReceived])
    let f = getFile(file.id)
    // f.status = 'success'
    f.filestatus = file.filestatus
    f.modificationdate = file.modificationdate
    UploadList.prototype.success(f, upFiles) // 上传成功改变列表
  }

  /**
   * 修改SWFUpload原型链uploadError
   * @param file
   * @param errorCode
   * @param message
   */

  SWFUpload.prototype.uploadError = function (file, errorCode, message) {
    file = this.unescapeFilePostParams(file)
    // this.queueEvent('upload_error_handler', [file, errorCode, message])
    this.queueEvent('return_upload_error_handler', [file, errorCode, message])
    // let f = getFile(file.id)
    // f.filestatus = file.filestatus
    // f.modificationdate = file.modificationdate
    // UploadList.prototype.error(message, f) //
  }

  SWFUpload.prototype.returnUploadError = function (file, errorCode, message) {
    let returnValue = ''
    if (typeof this.settings.upload_error_handler === 'function') {
      file = this.unescapeFilePostParams(file)
      let res = this.settings.upload_error_handler.call(this, file, errorCode, message)
      returnValue = res
    } else if (this.settings.upload_error_handler != undefined) {
      throw 'upload_error_handler must be a function'
    }

    if (returnValue === undefined) {
      returnValue = ''
    }

    let f = getFile(file.id)
    f.filestatus = file.filestatus
    f.modificationdate = file.modificationdate
    UploadList.prototype.error(returnValue, f) //
  }

  SWFUpload.prototype.checkUploadStatus = function () {
    for (let item of upFiles) {
      // if (item.status === 'uploading') {
      if (item.filestatus === SWFUpload.FILE_STATUS.IN_PROGRESS) {
        if (window.confirm('Are you sure?')) {
          uploadSingle.stopUpload()
          upFiles = []
          return true
        }
        return false
      }
    }
    upFiles = []
    return true
  }

  Upload.defaults = {
    swf_mode: false // 强制使用SWF
  }

  /**
   * 从上传列表集合中获取文件
   * @param fid
   * @returns {*}
   */

  function getFile (fid) {
    let target
    upFiles.every(item => {
      target = fid === item.id ? item : null
      return !target
    })
    return target
  }

  /**
   * 计算上传剩余时间
   * @param res
   * @returns {string}
   */

  function getTime (res) {
    // 计算出小时数
    let leave1 = res % (24 * 3600 * 1000)
    let hours = Math.floor(leave1 / (3600 * 1000))
    // 计算相差分钟数
    let leave2 = leave1 % (3600 * 1000)
    let minutes = Math.floor(leave2 / (60 * 1000))
    // 计算相差秒数
    let leave3 = leave2 % (60 * 1000)
    let seconds = Math.round(leave3 / 1000)
    return checkTime(hours) + ':' + checkTime(minutes) + ':' + checkTime(seconds)
  }

  function checkTime (i) {
    if (i < 10) {
      i = '0' + i
    }
    return i
  }

  return Upload
})()

export default Upload
