<script setup lang="ts">
import { ref } from "vue";

import InputText from "primevue/inputtext";
import { Button } from "primevue";

const text = ref("");
</script>

<template>
  <h1>Hello Vite!</h1>
  <h2>Hello Vite!</h2>
  <h3>Hello Vite!</h3>
  <h4>Hello Vite!</h4>
  <h5>Hello Vite!</h5>
  <h6>Hello Vite!</h6>

  <InputText
    type="text"
    placeholder="Overridden"
    class="bg-white!"
    v-model="text"
  />

  <Button label="button" class="text-white! hover:bg-green-700!" />
</template>
