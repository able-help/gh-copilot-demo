import { createApp } from 'vue'
import App from './App.vue'
import './theme.css'
import { initializeTheme } from './theme'

initializeTheme()
createApp(App).mount('#app')
