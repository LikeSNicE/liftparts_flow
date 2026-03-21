import { api } from "./apiInstance";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "@/router/router";

export const setup = () => {
  const authStore = useAuthStore();

  api.interceptors.request.use(
    (config) => {
      
      if (authStore.token) {
        config.headers["Authorization"] = `Bearer ${authStore.token}`;
      }

      return config;
    },
    (error: unknown) => {
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (res) => {
      return res;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        const store = useAuthStore();
        store.clearToken();

        const isAuthRequest = error?.config?.url?.includes("/auth");

        if (!isAuthRequest) {
          router.push({ name: "login" });
        }

        console.log("error.response: ", error.response);
      }
      return Promise.reject(error);
    },
  );
};
