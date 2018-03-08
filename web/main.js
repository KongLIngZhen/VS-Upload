import Vue from 'vue'
import App from './App'
import yue from '../src/main.js'

import VueI18n from 'vue-i18n'

Vue.use(yue.install)
Vue.use(VueI18n)

Vue.config.productionTip = false

const messages = yue.messages

const i18n = new VueI18n({
  locale: 'zh',
  messages
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  i18n
})
