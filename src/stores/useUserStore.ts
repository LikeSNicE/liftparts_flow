import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/service/apiInstance";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useAuthStore } from "./useAuthStore";
import type { Employee } from "@/types/UserTypes";

export const useUserStore = defineStore("user", () => {
  const authStore = useAuthStore();

  // Инициализация из localStorage
  const USER_STORAGE_KEY = "user_data";
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  const userData = ref<Employee | null>(
    storedUser ? JSON.parse(storedUser) : null,
  );

  const getAuthUser = async () => {
    try {
      const { data } = await api.get<Employee>("/auth_me", {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      console.log("User data from server:", data);
      userData.value = data;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
      throw new Error("Пользователь не авторизован.");
    }
  };

  const clearUserData = () => {
    userData.value = null;
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  

  return {
    userData,
    getAuthUser,
    clearUserData,
  };
});
