<script setup lang="ts">
import { Button, InputText } from "primevue";
import { useLoginStore } from "@/stores/useLoginStore";
import LogoIcon from "@/components/LogoIcon.vue";

const loginStore = useLoginStore();
</script>

<template>
  <div
    class="flex flex-col! items-center! justify-center! n bg-white! max-w-lg! w-full! p-8! rounded-2xl! shadow-2xl!"
  >
    <LogoIcon />

    <h4 class="text-heading!">LiftPartsFlow</h4>
    <p class="text-sm!">Вход в систему</p>

    <form
      @submit.prevent="loginStore.loginUser()"
      class="card flex flex-col justify-center gap-4 w-full! mt-8!"
    >
      <!-- Ошибка авторизации -->
      <div
        v-if="loginStore.loginError"
        class="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200 flex items-center"
      >
        <i class="pi pi-exclamation-circle mr-2"></i>
        {{ loginStore.loginError }}
      </div>

      <div class="flex flex-col gap-2">
        <label for="username" class="text-sm!">Email</label>
        <InputText
          v-model="loginStore.email"
          type="email"
          class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
          id="username"
          placeholder="user@liftparts.com"
          aria-describedby="username-email"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="password" class="text-sm!">Пароль</label>
        <InputText
          v-model="loginStore.password"
          type="password"
          class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
          id="password"
          aria-describedby="username-password"
          placeholder="Введите пароль"
        />
      </div>

      <Button
        type="submit"
        class="w-full! mt-5! bg-(--blue)! text-white! rounded-lg! hover:bg-blue-600! border-none!"
        >Войти</Button
      >
    </form>

    <div class="flex gap-1 mt-5!">
      <p>Нет аккаунта? </p>
      <router-link class="text-(--blue)!" to="/auth/register"
        >Регистрация</router-link
      >
    </div>
  </div>
</template>
