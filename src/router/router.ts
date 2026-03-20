import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "@/Layouts/AuthLayout.vue";
import HomeLayout from "@/Layouts/HomeLayout.vue";

const routes = [
  {
    path: "/",
    component: HomeLayout,
    children: [
      {
        path: "/",
        component: () => import("@/pages/HomePage.vue"),
        children: [
          {
            path: "/",
            component: () => import("@/components/DashBoard.vue"),
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        component: () => import("@/pages/LoginPage.vue"),
      },
      {
        path: "register",
        component: () => import("@/pages/RegisterPage.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
