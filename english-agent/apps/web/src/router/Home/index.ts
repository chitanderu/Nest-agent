import layout from '@/layout/index.vue'
import Home from '@/views/Home/index.vue'

export default [
  {
    path: '/',
    component: layout,
    children: [{ path: '/', component: Home }],
  },
]
