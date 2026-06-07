import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'
import BasicDemo from './components/demos/BasicDemo.vue'
import ShorthandDemo from './components/demos/ShorthandDemo.vue'
import ExplicitDemo from './components/demos/ExplicitDemo.vue'
import SubmitDemo from './components/demos/SubmitDemo.vue'
import AsyncDemo from './components/demos/AsyncDemo.vue'
import JobFormDemo from './components/demos/JobFormDemo.vue'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BasicDemo', BasicDemo)
    app.component('ShorthandDemo', ShorthandDemo)
    app.component('ExplicitDemo', ExplicitDemo)
    app.component('SubmitDemo', SubmitDemo)
    app.component('AsyncDemo', AsyncDemo)
    app.component('JobFormDemo', JobFormDemo)
  },
}

export default theme
