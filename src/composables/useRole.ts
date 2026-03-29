import { computed } from "vue";
import { useUserStore } from "@/stores/useUserStore";
import { type UserRole } from "@/types/UserTypes";

export function useRole() {
  const userStore = useUserStore();

  const userRole = computed<UserRole | null>(() => {
    // return authStore.user?.role || null;
    return userStore.userData?.userrole || null;
  });

  const hasRole = (allowedRoles: UserRole | UserRole[]) => {
    // userRole.value = "admin" → не null → идём дальше
    if (!userRole.value) return false;

    // allowedRoles = ["admin", "manager"]
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(userRole.value);
    }

    // "admin" === "admin" (true)
    return userRole.value === allowedRoles;
  };

  const can = (allowedRoles: UserRole | UserRole[]) => hasRole(allowedRoles);

  return {
    userRole,

    hasRole,
    can,
  };
}
