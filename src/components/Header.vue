<script setup lang="ts">
import { Button } from "primevue";
</script>

<template>
  <header class="header! py-2 px-4 bg-(--white) flex items-center justify-between border-b border-(--border)">
    <h5>Заголовок</h5>

    <Button
      type="button"
      label="Новая заявка"
      icon="pi pi-plus-circle"
      class="bg-(--blue)! border-none!"
    />
  </header>
</template>
