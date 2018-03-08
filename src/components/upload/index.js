import upload from './upload_vue/upload.vue'
import up from './upload.js'

window.Upload = up

upload.install = function (Vue) {
  Vue.component(upload.name, upload)
}

if (typeof window !== 'undefined' && window.Vue) {
  upload.install(window.Vue)
}

export default upload
