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

  const reset = () => {
    email.value = "";
    password.value = "";
  };

  const loginUser = async () => {
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
