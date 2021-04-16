//Default vue imports
import Vue from 'vue'
import App from './App.vue'
import router from './router'

//Vuex import
import { store } from './store/store'

//Mqtt import
import VueMqtt from 'vue-mqtt'

//Map imports
import * as vue2leaflet from 'vue2-leaflet'
import * as leaflet from 'leaflet'

//Bootstrap imports
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueMqtt, 'ws://127.0.0.1:9001', {clientId: 'WebClient-' + parseInt(Math.random() * 100000)})
Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(vue2leaflet)
Vue.use(leaflet)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
