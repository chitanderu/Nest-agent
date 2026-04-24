import layout from '@/layout/index.vue'

export default [
  {
    path: '/word-book',
    component: layout,
    children: [{ path: 'index', component: () => import('@/views/WordBook/index.vue') }],
  },
]
