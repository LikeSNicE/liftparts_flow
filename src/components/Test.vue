<script setup lang="ts">
import { onMounted } from "vue";
import { api } from "@/service/apiInstance";
import { useAuthStore } from "@/stores/useAuthStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ref } from "vue";
import { type User } from "@/types/UserTypes";

const authStore = useAuthStore();

const userData = ref<User | null>(null);

onMounted(async () => {
  try {
    const { data } = await api.get("/auth_me", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    userData.value = data;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.log(errorMessage);
  }
});
</script>

<template>
  <h1>Test page</h1>

  <h4>User:</h4>

  {{ userData?.email }}
</template>
