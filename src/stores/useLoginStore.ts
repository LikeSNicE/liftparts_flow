import { defineStore } from "pinia";
import { api } from "@/service/apiInstance";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "./useUserStore";

export const useLoginStore = defineStore("login", () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const email = ref("");
  const password = ref("");

  // Тестовый администратор для разработки
  const TEST_ADMIN = {
    email: "test@mail.ru",
    password: "admin123",
  };

  const reset = () => {
    email.value = "";
    password.value = "";
  };

  const loginUser = async () => {
    // Проверка тестового администратора
    if (email.value === TEST_ADMIN.email && password.value === TEST_ADMIN.password) {
      authStore.setToken("test-admin-token");
      // Создаём тестовые данные пользователя
      userStore.userData = {
        id: 1,
        username: "Админ Тестовый",
        lastname: "Администратор",
        email: email.value,
        userrole: "admin",
      };
      reset();
      await router.push("/");
      return;
    }

    const payloadUser = {
      email: email.value,
      password: password.value,
    };

    try {
      const { data, status, statusText } = await api.post("/auth", payloadUser);

      if (status === 200 || status === 201) {
        authStore.setToken(data.token);
        reset();
        await userStore.getAuthUser();
        await router.push("/");
      } else {
        console.log(`Ошибка авторизации. ${statusText}`);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
    }
  };

  return {
    email,
    password,
    loginUser,
    reset,
  };
});
