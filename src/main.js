import enLocale from './language/en-us.json'
import zhLocale from './language/zh-cn.json'
import '../node_modules/font-awesome/css/font-awesome.min.css'
import Upload from './components/upload/index.js'

const components = [
  Upload
]

const messages = {
  en: enLocale,
  zh: zhLocale
}

const install = function (Vue) {
  if (install.installed) return

  components.map(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)

  if (window.VueI18n) {
    window.Vue.use(window.VueI18n)

    window.i18n = new window.VueI18n({
      locale: 'zh',
      messages
    })
  }
}

export default {
  install,
  messages
}
