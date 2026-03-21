<script setup>
import { useRole } from "@/composables/useRole";
import RoleBasedView from "@/components/RoleBasedView.vue";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
const { can, userRole } = useRole();
const userStore = useUserStore();

const { userData } = storeToRefs(userStore);
</script>

<template>
  <div class="p-5">
    <h2>Здравствуйте {{ userStore.userData?.username }}</h2>

    <nav class="navigation flex flex-col gap-2.5 bg-[#f5f5f5] rounded-lg mb-5">
      <h2 class="mt-0">Навигация по ролям:</h2>

      <router-link to="/" v-if="can(['admin', 'mechanic', 'manager'])">
        Главная
      </router-link>

      <router-link to="/admin" v-if="can('admin')"> Админ панель </router-link>

      <router-link to="/mechanic" v-if="can(['admin', 'mechanic'])">
        Кабинет монтажника
      </router-link>

      <router-link to="/warehouse_operator" v-if="can('warehouse_operator')"
        >Кабинет оператора склада</router-link
      >
    </nav>

  </div>
</template>

<style scoped>
.navigation a {
  padding: 10px 15px;
  background: var(--blue);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
}

.navigation a:hover {
  background: #1245fb;
}
</style>
