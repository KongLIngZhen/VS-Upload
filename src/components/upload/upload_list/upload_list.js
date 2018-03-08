import temp from './upload_temp.js'
import en from '../../../language/en-us.json'
import zh from '../../../language/zh-cn.json'

/* eslint-disable no-undef */
class UploadList {
  constructor (ins, options) {
    this.init(options).then(function () {
      UploadList.prototype.events(ins, options)
    }, function (e) {
      console.error('init upload list failed')
      console.error(e)
    })
    this._instance = ins
  }

  init (options) {
    return new Promise(function (resolve, reject) {
      try {
        let lang
        switch (options.language) {
          case 'zh':
            lang = zh
            break
          case 'en':
            lang = en
            break
          default:
            lang = zh
        }
        $('body').append(temp(lang))
        if (options.list_color) {
          $('.upload-list-header').css({
            'backgroundColor': options.list_color,
            'borderColor': options.list_color
          })
          $('.upload-list-body').css({
            'borderColor': options.list_color
          })
          $('.cancel-all').css({
            'color': options.list_color
          })
        }
        resolve()
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  events (ins, options) {
    this.close(ins)
    this.minimize()
    this.maximize()
    this.cancel(ins, options)
  }

  /**
   * 显示列表窗口
   */

  show () {
    $('#upload-list').fadeIn(800, function () {
      $('#upload-list').animate({
        bottom: '0'
      })
    })
  }

  /**
   * 关闭列表窗口
   */

  close (ins) {
    let upl = this
    $('.upload-list .fa-close').click(function () {
      if (ins.checkUploadStatus()) {
        $('#upload-list').fadeOut(400, function () {
          $('#upload-list').animate({
            bottom: '-400px'
          })
          upl.clear()
        })
      }
    })
  }

  /**
   * 最小化
   */

  minimize () {
    $('.upload-list .fa-window-minimize').click(function () {
      $('#upload-list').fadeIn(400, function () {
        $('#upload-list').animate({
          bottom: '-370px'
        })
      })
    })
  }

  /**
   * 最大化
   */

  maximize () {
    $('.upload-list .fa-window-maximize').click(function () {
      $('#upload-list').fadeIn(800, function () {
        $('#upload-list').animate({
          bottom: '0px'
        })
      })
    })
  }

  /**
   * 添加进列表
   * @param file
   */

  add (file) {
    let color = $('.upload-list-header').css('backgroundColor')
    let temp = `
    <tr id="${file.id}">
      <td class="name" title="${file.name}">${file.name}</td>
      <td class="percentage" style="position: relative">
        <div style="width: 100%;height: 14px;background-color: ${color};border-radius: 2px;line-height: 14px;color: #fff;">
          <span style="position: absolute;left: 10px;right: 10px;color: #1e1e1e;text-align: center;">${file.percentage} %</span>
        </div>
      </td>
      <!--<td class="error" style="line-height: 20px;color: #d71919;"></td>-->
      <td class="size">${parseSize(file.size)}</td>
      <td class="time">${file.time}</td>
      <td class="error">
        <span class="error" style="line-height: 20px;color: #d71919;"></span>
        <span class="pause" data-id="${file.id}">
          <i class="fa fa-pause"></i>
        </span>
        <span class="check" style="display: none">
          <i class="fa fa-check"></i>
        </span>
      </td>
    </tr>
    `
    $('#body-list').append(temp)
  }

  /**
   * 清空列表
   */

  clear () {
    $('#body-list').children('tr').remove()
  }

  /**
   * 响应上传进度
   * @param file
   */

  progress (file) {
    $('#' + file.id + ' .percentage div span').text(parsePercentage(file.percentage) + '%') // 百分比
    $('#' + file.id + ' .percentage div').css('width', file.percentage + '%') // 进度条
    $('#' + file.id + ' .time').text(file.time) // 剩余时间
    let color = $('#' + file.id + ' .percentage div span').css('color')
    if (file.percentage >= 45 && color === 'rgb(30, 30, 30)') {
      $('#' + file.id + ' .percentage div span').css({
        'color': '#ffffff'
      })
    }
  }

  /**
   * 文件上传成功
   * @param file
   */

  success (file, fileList) {
    $('#' + file.id + ' span.pause').hide()
    $('#' + file.id + ' span.check').show()
    for (let f of fileList) {
      // if (f.status !== 'success') return
      if (f.filestatus !== -4) return
    }
    $('#upload-list').fadeIn(400, function () {
      $('#upload-list').animate({
        bottom: '-370px'
      })
    })
  }

  /**
   * 暂停文件上传
   * @description 列表按钮绑定点击事件，通过传入Vue或SWF实例调用对应的取消上传方法
   * @param ins Vue 或 SWF实例
   * SWF cancelUpload ( file_id, trigger_error_event )
   * 取消文件的上传
   * 参数file_id为要取消的文件的id,如果该参数为undefined或者未填写，则会取消队列里的第一个文件
   * 参数trigger_error_event接受一个布尔值，当为false时取消文件不会触发uploadError事件，默认为true
   */

  cancel (ins, options) {
    $('#upload-list').delegate('.pause', 'click', function () {
      let fid = $(this).attr('data-id')
      ins.cancelUpload(fid, false) // cancelUpload为SWF原生方法 统一为不触发error
      let file = ins.getFile(fid) // SWF 和 Vue 实例中获取文件方法
      options.handleCancel(file) // 触发handleCancel
      $('#' + fid + ' span.pause').hide()
    })
    $('.upload-list .cancel-all').click(function () {
      ins.cancelUpload('', false)
      $('span.pause').each(function () {
        $(this).hide()
      })
    })
  }

  /**
   * 错误消息显示
   * @description Upload.prototype.error(message, file)
   * 传入要显示的错误消息和当前文件
   * @param message
   * @param file
   */

  error (message, file) {
    if (message) {
      $('#' + file.id + ' span.error').html('')
      $('#' + file.id + ' span.error').append(`<i class="fa fa-exclamation"></i> ${message}`)
      $('#' + file.id + ' span.error').attr('title', message)
      $('#' + file.id + ' span.pause').hide()
      $('#' + file.id + ' span.check').hide()
    }
  }
}

/**
 * 解析文件进度
 * @param val
 * @returns {number}
 */

function parsePercentage (val) {
  return parseInt(val, 10)
}

/**
 * 解析文件大小
 * @param val
 * @returns {string}
 */

function parseSize (val) {
  let size = ''
  if (val < 0.1 * 1024) {
    size = val.toFixed(2) + 'B'
  } else if (val < 0.1 * 1024 * 1024) {
    size = (val / 1024).toFixed(2) + 'KB'
  } else if (val < 0.1 * 1024 * 1024 * 1024) {
    size = (val / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    size = (val / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
  let sizestr = size + ''
  let len = sizestr.indexOf('.')
  let dec = sizestr.substr(len + 1, 2)
  if (dec === '00') {
    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2)
  }
  return sizestr
}

export default UploadList
