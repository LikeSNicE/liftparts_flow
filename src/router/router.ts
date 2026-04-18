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
            meta: { requiresAuth: true, title: "Главная" },
          },
          {
            path: "/admin",
            component: () => import("@/pages/AdminPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin"],
              title: "Панель администратора",
            },
          },
          {
            path: "/mechanic",
            component: () => import("@/pages/MechanicPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin", "mechanic"],
              title: "Панель механика",
            },
          },
          {
            path: "/manager",
            component: () => import("@/pages/ManagerPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin", "manager"],
              title: "Панель механика",
            },
          },
          {
            path: "/test",
            component: () => import("@/components/Test.vue"),
            meta: {
              requiresAuth: true,
              title: "Тест",
            },
          },
          {
            path: "/repair-requests",
            component: () => import("@/pages/RepairRequestsPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin", "mechanic", "warehouse_operator"],
              title: "Заявки по ремонту",
            },
          },
          {
            path: "/users",
            component: () => import("@/pages/EmployeesPage.vue"),
            meta: { requiresAuth: true, roles: ["admin"], title: "Сотрудники" },
          },
          {
            path: "/settings",
            component: () => import("@/pages/SettingsPage.vue"),
            meta: { requiresAuth: true, title: "Настройки" },
          },
          {
            path: "/warehouse",
            component: () => import("@/pages/WarehousePage.vue"),
            meta: { requiresAuth: true, title: "Склад" },
          },
          {
            path: "/parts-requests",
            component: () => import("@/pages/PartsRequestsPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin", "warehouse_operator", "mechanic"],
              title: "Заявки на запчасти",
            },
          },
          {
            path: "/interactive-map",
            component: () => import("@/pages/InteractiveMapPage.vue"),
            meta: {
              requiresAuth: true,
              roles: ["admin", "warehouse_operator", "mechanic"],
              title: "Интерактивная карта",
            },
          },
          {
            path: "/:pathMatch(.*)*",
            name: "NotFound",
            component: () => import("@/pages/NotFoundPage.vue"),
            meta: { title: "Страница не найдена" },
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

    console.log("🔍 Route Guard Debug:", {
      path: to.path,
      userRole,
      allowedRoles,
      hasAccess: userRole && allowedRoles.includes(userRole),
    });

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log("❌ Access denied, redirecting to home");
      next({ path: "/" }); // Перенаправляем на главную если нет доступа
      return;
    }
  }

  next();
});
