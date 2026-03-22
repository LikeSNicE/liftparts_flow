import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "@/Layouts/AuthLayout.vue";
import HomeLayout from "@/Layouts/HomeLayout.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { type UserRole } from "@/types/UserTypes";
import { useUserStore } from "@/stores/useUserStore";

export interface RouteMeta {
  requiresAuth?: boolean;
  roles?: UserRole[];
}

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
            meta: { requiresAuth: true },
          },
          {
            path: "/admin",
            component: () => import("@/pages/AdminPage.vue"),
            meta: { requiresAuth: true, roles: ["admin"] },
          },
          {
            path: "/mechanic",
            component: () => import("@/pages/MechanicPage.vue"),
            meta: { requiresAuth: true, roles: ["admin", "mechanic"] },
          },
          {
            path: "/manager",
            component: () => import("@/pages/ManagerPage.vue"),
            meta: { requiresAuth: true, roles: ["admin", "manager"] },
          },
          {
            path: "/test",
            component: () => import("@/components/Test.vue"),
            meta: { requiresAuth: true },
          },
          {
            path: "/users",
            component: () => import("@/pages/EmployeesPage.vue"),
            meta: { requiresAuth: true, roles: ["admin"] },
          },
          {
            path: "/settings",
            component: () => import("@/pages/SettingsPage.vue"),
            meta: { requiresAuth: true },
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
        name: "login",
      },
      {
        path: "register",
        component: () => import("@/pages/RegisterPage.vue"),
        name: "register",
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  if (
    (to.name === "login" || to.name === "register") &&
    authStore.isAuthenticated
  ) {
    next({ path: "/" });
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
    return;
  }

  // Проверка ролей
  if (to.meta.requiresAuth && authStore.isAuthenticated && to.meta.roles) {
    const userRole = userStore.userData?.userrole;
    const allowedRoles = to.meta.roles as UserRole[];

    if (!userRole || !allowedRoles.includes(userRole)) {
      next({ path: "/" }); // Перенаправляем на главную если нет доступа
      return;
    }
  }

  next();
});
