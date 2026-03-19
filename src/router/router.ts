import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: '/',
    children: []
  }
]

export const router =  createRouter({
  history: createWebHistory(),
  routes
})
