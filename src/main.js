// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import fabric from 'fabric'
import 'element-ui/lib/theme-chalk/display.css';
import {
  Row,
  Col,
  Button,
  ButtonGroup,
  Input,
  InputNumber,
  Select,
  Option,
  Slider,
  Upload,
  ColorPicker,
  Drawer,
  Menu,
  Submenu,
  MenuItem,} from 'element-ui'

Vue.config.productionTip = false
Vue.use(fabric)
Vue.use(Row)
Vue.use(Col)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Select)
Vue.use(Option)
Vue.use(Slider)
Vue.use(Upload)
Vue.use(ColorPicker)
Vue.use(Drawer)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
