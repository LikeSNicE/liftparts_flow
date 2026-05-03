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
  const lastLogin = ref(new Date().toISOString());
  const loginError = ref(""); // Ошибка авторизации

  const reset = () => {
    email.value = "";
    password.value = "";
    loginError.value = "";
  };

  const loginUser = async () => {
    loginError.value = "";

    const payloadUser = {
      email: email.value,
      password: password.value,
      lastLogin: lastLogin.value,
    };

    try {
      const { data, status, statusText } = await api.post("/auth", payloadUser);
      

      if (status === 200 || status === 201) {
        console.log("Login response:", data);
        authStore.setToken(data.token);
        reset();
        
        // Сначала получаем ID пользователя
        await userStore.getAuthUser();
        
        // Обновляем lastLogin через PATCH-запрос и сразу обновляем userData
        if (userStore.userData) {
          try {
            const currentTime = new Date().toISOString();
            await api.patch(`/users/${userStore.userData.id}`, {
              lastLogin: currentTime
            });
            console.log('id user: ', userStore.userData.id);
            // Обновляем локально без повторного запроса
            userStore.userData.lastLogin = currentTime;
            localStorage.setItem("user_data", JSON.stringify(userStore.userData));
          } catch (error: unknown) {
            console.log("Ошибка обновления lastLogin:", getErrorMessage(error));
          }
        }
        
        await router.push("/");
      } else {
        loginError.value = "Неверный email или пароль";
        console.log(`Ошибка авторизации. ${statusText}`);
      }
    } catch (error: unknown) {
      loginError.value = "Неверный email или пароль";
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
    }
  };

  return {
    email,
    password,
    loginError,
    loginUser,
    reset,
  };
});
