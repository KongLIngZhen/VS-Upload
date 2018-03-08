let setting = {
  upload_url: '', // 处理上传文件的服务器端页面的url地址
  file_size_limit: '', // 指定要上传的文件的最大体积
  file_types_description: 'All Files', // 指定在文件选取窗口中显示的文件类型描述
  file_upload_limit: '', // 指定最多能上传多少个文件
  file_queue_limit: '', // 指定文件上传队列里最多能同时存放多少个文件
  buttonImageURL: '', // 指定Flash按钮的背景图片
  moving_average_history_size: 40,
  file_dialog_start_handler: function () {}, // fileDialogStart事件侦听函数
  file_queued_handler: function (file) {}, // fileQueued事件侦听函数
  file_queue_error_handler: function (file, errorCode, message) {}, // fileQueueError事件侦听函数
  file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {}, // fileDialogComplete事件侦听函数
  upload_start_handler: function (file) {}, // uploadStart事件侦听函数
  upload_progress_handler: function (file, bytesLoaded, bytesTotal) {}, // uploadProgress事件侦听函数
  upload_error_handler: function (file, errorCode, message) {}, // uploadError事件侦听函数
  upload_success_handler: function (file, serverData, code) {}, // uploadSuccess事件侦听函数
  upload_complete_handler: function (file) {}, // uploadComplete事件侦听函数
  swfupload_loaded_handler: function () {},
  upload_getCurData_handler: function (file) {},
  button_placeholder_id: '', // 指定一个dom元素的id
  button_width: '100', // 指定Flash按钮的宽度
  button_height: '50', // 指定Flash按钮的高度
  button_text: '', // 指定Flash按钮上的文字
  button_text_style: '', // Flash按钮上的文字的样式
  button_text_left_padding: 0, // 指定Flash按钮左边的内边距
  button_text_top_padding: 0, // 指定Flash按钮顶部的内边距
  button_window_mode: 'transparent', // 指定Flash按钮的WMODE属性
  button_disabled: false, // 为true时Flash按钮将变为禁用状态
  // button_cursor: SWFUpload.CURSOR.HAND, // 指定鼠标悬停在Flash按钮上时的光标样式
  flash_url: '', // swfupload.swf文件的绝对或相对地址
  prevent_swf_caching: false, // 为true时会加一个随机数在swfupload.swf地址的后面
  debug: false,
  language: 'zh',
  drop: false,
  drop_id: ''
}

export default setting
