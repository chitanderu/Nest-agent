import { createRouter, createWebHistory } from 'vue-router'
import home from './Home/index.ts'
import wordBook from './word-book/index.ts'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home, //主页
    ...wordBook, //单词本
  ],
})

export default router
