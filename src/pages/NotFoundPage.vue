<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="text-base font-semibold text-(--blue)">404</p>

      <h1
        class="mt-4 font-semibold tracking-tight text-balance text-white sm:text-7xl"
      >
        Страница не найдена
      </h1>
      <p class="mt-6 text-lg font-medium text-pretty sm:text-xl/8">
        Извините, мы не смогли найти страницу, которую вы ищете.
      </p>

      <div class="mt-10 flex items-center justify-center gap-x-6">
        <RouterLink
          to="/"
          class="rounded-md bg-(--blue) px-3.5 py-2.5 text-sm font-semibold text-(--white)! shadow-xs hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:blue-600"
          >Вернуться на главную</RouterLink
        >
      </div>
    </div>
  </main>
</template>
