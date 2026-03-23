<script setup>
import { Form } from "@primevue/forms";
import { Button, InputText, Select } from "primevue";
import { ref } from "vue";
import { useRegisterStore } from "@/stores/useRegisterStore";
import LogoIcon from "@/components/LogoIcon.vue";

const registerStore = useRegisterStore();
</script>

<template>
  <div
    class="flex flex-col! items-center! justify-center! n bg-white! max-w-lg! w-full! p-8! rounded-2xl! shadow-2xl! max-h-screen! overflow-y-auto"
  >
    <LogoIcon />

    <h4 class="text-heading!">Регистрация сотрудника</h4>
    <p class="text-sm!">Заполните данные для доступа к системе</p>

    <form
      @submit.prevent="registerStore.registerUser()"
      class="card flex flex-col justify-center gap-4 w-full! mt-8!"
    >
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 w-1/2">
          <label for="firstName" class="text-sm!">Имя</label>
          <InputText
            type="text"
            class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
            id="firstName"
            placeholder="Иван"
            aria-describedby="firstName"
            v-model="registerStore.username"
          />
        </div>

        <div class="flex flex-col gap-2 w-1/2">
          <label for="lastName" class="text-sm!">Фамилия</label>
          <InputText
            type="text"
            class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
            id="lastName"
            placeholder="Иванов"
            aria-describedby="lastName"
            v-model="registerStore.lastname"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="middlename" class="text-sm!">Отчество (если имеется)</label>
        <InputText
          type="text"
          class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
          id="middlename"
          placeholder="Иванович"
          aria-describedby="middlename"
          v-model="registerStore.middlename"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="email" class="text-sm!">Email</label>
        <InputText
          type="email"
          class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
          id="email"
          placeholder="user@liftparts.com"
          aria-describedby="email"
          v-model="registerStore.email"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="role" class="text-sm!">Роль</label>
        <Select
          v-model="registerStore.userrole"
          class="bg-white! text-(--text)! border border-(--border)!"
          :options="registerStore.roles"
          optionLabel="label"
          optionValue="value"
          :pt="{
            option: {
              root: ({ context }) => [
                'role-option',
                { 'role-option-selected': context.selected },
                { 'role-option-hover': !context.selected },
              ],
            },
            options: 'role-options',
          }"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="password" class="text-sm!">Пароль</label>
        <InputText
          v-model="registerStore.password"
          type="password"
          class="border! border-gray-400! bg-white! rounded-lg! text-(--text)! w-full!"
          id="password"
          aria-describedby="password"
          placeholder="Введите пароль"
        />
      </div>

      <Button
        type="submit"
        class="w-full! mt-5! bg-(--blue)! text-white! rounded-lg! hover:bg-blue-600! border-none!"
        >Зарегистрироваться</Button
      >
    </form>

    <div class="flex gap-1 mt-5!">
      <p>Уже есть аккаунт?</p>
      <router-link class="text-(--blue)!" to="/auth/login">Войти</router-link>
    </div>
  </div>
</template>
