<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Button } from "primevue";
import { Dialog } from "primevue";
import { InputText } from "primevue";
import { Dropdown } from "primevue";
import type {
  Employee,
  EmployeeStatus,
  UserRole,
  EmployeeForm,
} from "@/types/UserTypes";

import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { storeToRefs } from "pinia";
import Table from "@/components/Table.vue";
import { employeeTableHeaders } from "@/data/employeesTableData";

import { statusEmployeeOptions } from "@/data/statusEmployeeData";
import { roleEmployeeOptions } from "@/data/roleEmployeeData";

import { getRoleLabel } from "@/utils/getRoleLabel";
import { getRoleColor } from "@/utils/getRoleColor";
import { getEmployeeStatus } from "@/utils/getEmployeeStatus";
import { getEmployeeColor } from "@/utils/getEmployeeColor";

import { useFilter } from "@/composables/useFilter";

const { searchQuery, selectedStatus } = useFilter();

const employeeStore = useEmployeeStore();
const { employeeList } = storeToRefs(employeeStore);

// Регистрируем метод openAddModal при монтировании
onMounted(async () => {
  await employeeStore.getEmployees();
});

// === Модальное окно добавления/редактирования ===
const isEditModalVisible = ref(false);

const currentEmployee = ref<Employee | null>(null);

// Форма сотрудника
const createEmptyForm = (): EmployeeForm => ({
  username: "",
  lastname: "",
  middlename: "",
  email: "",
  userrole: "mechanic",
  status: "inactive",
});

// Инициализируем форму пустыми значениями
const employeeForm = ref<EmployeeForm>(createEmptyForm());

// Открыть модальное окно для редактирования
const openEditModal = (employee: Employee) => {
  currentEmployee.value = employee;

  employeeForm.value = {
    username: employee.username,
    lastname: employee.lastname,
    middlename: employee.middlename,
    email: employee.email,
    userrole: employee.userrole,
    status: employee.status,
  };
  isEditModalVisible.value = true;
};

// Закрыть модальное окно редактирования
const closeEditModal = () => {
  isEditModalVisible.value = false;
  currentEmployee.value = null;
  employeeForm.value = {
    username: "",
    lastname: "",
    email: "",
    userrole: "mechanic",
    status: "inactive",
  };
};

const handleUpdateEmployee = async () => {
  if (currentEmployee.value) {
    await employeeStore.updateEmployee(
      currentEmployee.value.id,
      employeeForm.value,
    );
    closeEditModal();
  }
};

// === Модальное окно подтверждения удаления ===
const isDeleteModalVisible = ref(false);
const deleteConfirmText = ref("");

const filteredUser = computed(() => {
  let result = employeeList.value;

  if (selectedStatus.value) {
    result = result.filter(
      (employee) => employee.status === selectedStatus.value,
    );
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();

    result = result.filter((employee) => {
      return (
        employee.id.toString().toLowerCase().includes(query) ||
        employee.username.toLowerCase().includes(query) ||
        employee.lastname.toLowerCase().includes(query) ||
        employee.middlename?.toLowerCase().includes(query)
      );
    });
  }

  return result;
});

// Открыть модальное окно удаления
const openDeleteModal = () => {
  deleteConfirmText.value = "";
  isDeleteModalVisible.value = true;
};

// Закрыть модальное окно удаления
const closeDeleteModal = () => {
  isDeleteModalVisible.value = false;
  deleteConfirmText.value = "";
};

// Подтверждение удаления
const handleEmployeeDelete = () => {
  // Проверка: пользователь должен ввести "Удалить" (в любом регистре)
  if (deleteConfirmText.value.toLowerCase() === "удалить") {
    if (currentEmployee.value) {
      employeeStore.deleteEmployee(currentEmployee.value.id);
    }
    closeDeleteModal();
    closeEditModal();
  }
};
</script>

<template>
  <div>
    <Table
      header-title="Cписок сотрудников"
      show-filters
      :show-view-mode="false"
      :table-headers="employeeTableHeaders"
      :data="filteredUser"
      :search-query="searchQuery"
      :selected-status="selectedStatus"
      :status-options-data="statusEmployeeOptions"
      @update:searchQuery="searchQuery = $event"
      @update:selectedStatus="selectedStatus = $event"
    >
      <template #cell-fullname="{ item }">
        {{ item.lastname }} {{ item.username }} {{ item.middlename }}
      </template>

      <template #cell-role="{ value, item }">
        <span
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="[getRoleColor(item.userrole)]"
        >
          {{ getRoleLabel(item.userrole) }}
        </span>
      </template>

      <template #cell-status="{ value }">
        <span
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="getEmployeeColor(value)"
          >{{ getEmployeeStatus(value) }}</span
        >
      </template>

      <template #cell-actions="{ item }">
        <Button
          label="Просмотр"
          severity="success"
          size="small"
          @click.stop="openEditModal(item)"
        />
      </template>
    </Table>

    <!-- <div class="employees-card bg-white rounded-lg p-6">
      <h2 class="text-xl font-semibold text-(--title) mb-4">
        Список сотрудников
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left bg-(--bg) text-(--text)">
              <th class="px-4 py-3 font-semibold">id</th>
              <th class="px-4 py-3 font-semibold">ФИО</th>
              <th class="px-4 py-3 font-semibold">Роль</th>
              <th class="px-4 py-3 font-semibold">Статус</th>
              <th class="px-4 py-3 font-semibold rounded-tr-lg">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="employee in employeeStore.employeeList"
              :key="employee.id"
              class="border-t border-(--border) hover:bg-(--bg)"
            >
              <td class="px-4 py-3 text-(--text)">{{ employee.id }}</td>
              <td class="px-4 py-3 text-(--text)">
                {{ employee.lastname }} {{ employee.username }}
                {{ employee.middlename }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="{
                    'bg-(--blue-bg) text-(--blue)':
                      employee.userrole === 'mechanic',
                    'bg-(--purple-bg) text-(--purple)':
                      employee.userrole === 'admin',
                    'bg-orange-100 text-orange-700':
                      employee.userrole === 'warehouse_operator',
                  }"
                >
                  {{ getRoleLabel(employee.userrole) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getEmployeeColor(employee.status)"
                >
                  {{ getEmployeeStatus(employee.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <Button
                  label="Просмотр"
                  severity="success"
                  size="small"
                  @click.stop="openEditModal(employee)"
                />
              </td>
            </tr>
            <tr v-if="employeeList.length === 0">
              <td
                colspan="4"
                class="px-4 py-8 text-center text-(--placeholder)"
              >
                Список сотрудников пуст
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->

    <!-- Модальное окно добавления/редактирования (ТОЛЬКО ПО ЦЕНТРУ) -->
    <Dialog
      v-model:visible="isEditModalVisible"
      header="Редактировать сотрудника"
      :style="{ width: '30rem' }"
      position="center"
      :modal="true"
      :draggable="false"
      :closable="true"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label for="lastname" class="font-semibold w-28 text-(--text)"
            >Фамилия</label
          >
          <InputText
            id="lastname"
            v-model="employeeForm.lastname"
            class="flex-auto"
            placeholder="Петров"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="username" class="font-semibold w-28 text-(--text)"
            >Имя</label
          >
          <InputText
            id="username"
            v-model="employeeForm.username"
            class="flex-auto"
            placeholder="Пётер"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="username" class="font-semibold w-28 text-(--text)"
            >Отчество</label
          >
          <InputText
            id="username"
            v-model="employeeForm.middlename"
            class="flex-auto"
            placeholder="Петрович"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="email" class="font-semibold w-28 text-(--text)"
            >Email</label
          >
          <InputText
            id="email"
            v-model="employeeForm.email"
            class="flex-auto"
            placeholder="email@example.com"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="role" class="font-semibold w-28 text-(--text)"
            >Роль</label
          >
          <Dropdown
            id="role"
            v-model="employeeForm.userrole"
            :options="roleEmployeeOptions"
            option-label="label"
            option-value="value"
            class="flex-auto border"
            placeholder="Выберите роль"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="status" class="font-semibold w-28 text-(--text)"
            >Статус</label
          >
          <Dropdown
            id="status"
            v-model="employeeForm.status"
            :options="statusEmployeeOptions"
            option-label="label"
            option-value="value"
            class="flex-auto"
            placeholder="Выберите статус"
          />
        </div>
      </div>

      <div class="flex justify-between items-center mt-6">
        <Button
          type="button"
          label="Удалить"
          class="delete-btn-modal"
          @click="openDeleteModal"
        />
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Отмена"
            severity="secondary"
            @click="closeEditModal"
          />
          <Button
            type="button"
            label="Сохранить"
            class="save-btn"
            @click="handleUpdateEmployee"
          />
        </div>
      </div>
    </Dialog>

    <!-- Модальное окно подтверждения удаления (ТОЛЬКО ПО ЦЕНТРУ) -->
    <Dialog
      v-model:visible="isDeleteModalVisible"
      header="Подтверждение удаления"
      :style="{ width: '25rem' }"
      position="center"
      :modal="true"
      :draggable="false"
      :closable="true"
    >
      <div class="flex flex-col gap-4">
        <p class="text-(--text)">
          Вы действительно хотите удалить сотрудника
          <span class="font-semibold text-(--title)">{{
            currentEmployee?.username
          }}</span
          >?
        </p>
        <p class="text-sm text-(--placeholder)">
          Для подтверждения введите слово
          <span class="font-semibold">«Удалить»</span>
        </p>
        <div class="flex items-center gap-4">
          <label for="delete-confirm" class="font-semibold w-20 text-(--text)"
            >Текст</label
          >
          <InputText
            id="delete-confirm"
            v-model="deleteConfirmText"
            class="flex-auto"
            placeholder="Введите «Удалить»"
            @keyup.enter="handleEmployeeDelete"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          @click="closeDeleteModal"
        />
        <Button
          type="button"
          label="Удалить"
          class="delete-btn-confirm"
          @click="handleEmployeeDelete"
          :disabled="deleteConfirmText.toLowerCase() !== 'удалить'"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.employees-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Кнопка "Сохранить" - синяя #2563EB */
.save-btn {
  background-color: var(--blue) !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
}

.save-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Ссылка "Редактировать" - синяя #2563EB */
.edit-link {
  color: var(--blue);
  text-decoration: none;
  font-size: 0.875rem;
}

.edit-link:hover {
  text-decoration: underline;
}

/* Кнопка "Удалить" в модальном окне - красная #DC2626 */
.delete-btn-modal {
  background-color: var(--red) !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
}

.delete-btn-modal:hover {
  background-color: #b91c1c !important;
}

/* Кнопка подтверждения удаления - красная */
.delete-btn-confirm {
  background-color: var(--red) !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
}

.delete-btn-confirm:hover {
  background-color: #b91c1c !important;
}

.delete-btn-confirm:disabled {
  background-color: var(--placeholder) !important;
  cursor: not-allowed;
}

/* Статус "На работе" - светло-голубой #D8EAFE */
/* .status-at-work {
  background-color: var(--blue-bg);
  color: var(--blue);
} */

/* Статус "Удалённо" - зелёный #16A34A */
/* .status-remote {
  background-color: var(--green);
  color: white;
} */

/* Статус "Перерыв" - оранжевый #D97706 */
/* .status-break {
  background-color: var(--orange);
  color: white;
} */

/* Статус "Отпуск" - фиолетовый #7E22CE */
/* .status-vacation {
  background-color: var(--purple-bg);
  color: var(--purple);
} */

/* Статус "Неактивен" - красный #DC2626 */
/* .status-inactive {
  background-color: var(--red);
  color: white;
} */
</style>
