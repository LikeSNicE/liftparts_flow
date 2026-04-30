<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Button, Dialog, InputText, Dropdown } from "primevue";
import type { Employee, EmployeeForm } from "@/types/UserTypes";
import { getRoleLabel, getRoleColor, getEmployeeStatus, getEmployeeColor } from "@/utils/entityHelpers";

import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { storeToRefs } from "pinia";
import Table from "@/components/Table.vue";
import List from "@/components/List.vue";
import Card from "@/components/Card.vue";
import ViewMode from "@/components/ViewMode.vue";
import SectionFilters from "@/components/SectionFilters.vue";
import { employeeTableHeaders } from "@/data/employeesTableData";

import { statusEmployeeOptionsData } from "@/data/statusEmployeeData";
import { roleEmployeeOptionsData } from "@/data/roleEmployeeData";

import { useFilter } from "@/composables/useFilter";
import { useViewMode } from "@/composables/useViewMode";

const { searchQuery, selectedStatus } = useFilter();

const employeeStore = useEmployeeStore();
const { employeeList } = storeToRefs(employeeStore);

const { viewMode } = useViewMode();

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
    <Card>
      <div class="mb-4 flex items-center justify-between">
        <h5 class="font-semibold text-(--title)">Список сотрудников</h5>
        <ViewMode />
      </div>

      <SectionFilters
        @update:searchQuery="searchQuery = $event"
        @update:selectedStatus="selectedStatus = $event"
        :search-query="searchQuery"
        :selected-status="selectedStatus"
        :status-options-data="statusEmployeeOptionsData"
      />

      <Table
        v-if="viewMode === 'table'"
        :table-headers="employeeTableHeaders"
        :data="filteredUser"
      >
        <template #cell-fullname="{ item }">
          {{ item.lastname }} {{ item.username }} {{ item.middlename }}
        </template>

        <template #cell-role="{ item }">
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
          >
            {{ getEmployeeStatus(value) }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <Button
            label="Просмотр"
            severity="success"
            size="small"
            @click.stop="openEditModal(item)"
          />
        </template>

        <template #empty>
          <div class="text-center py-12">
            <i class="pi pi-inbox text-6xl text-gray-300"></i>
            <p class="mt-4 text-gray-600">Сотрудников пока нет</p>
          </div>
        </template>
      </Table>

      <List v-if="viewMode === 'list'" :data="filteredUser">
        <template #list-content="{ item }">
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-3 text-sm text-(--text)">
              <span>
                <span class="text-gray-500">ФИО:</span>
                {{ item.lastname }} {{ item.username }} {{ item.middlename }}
              </span>
              <span>
                <span class="text-gray-500">Email:</span>
                {{ item.email }}
              </span>
            </div>

            <div class="flex gap-2">
              <span
                class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
                :class="getRoleColor(item.userrole)"
              >
                {{ getRoleLabel(item.userrole) }}
              </span>

              <span
                class="rounded-full text-xs font-medium whitespace-nowrap px-3 py-1"
                :class="getEmployeeColor(item.status)"
              >
                {{ getEmployeeStatus(item.status) }}
              </span>
            </div>
          </div>
        </template>

        <template #list-actions="{ item }">
          <Button
            @click.stop="openEditModal(item)"
            severity="success"
            type="button"
            size="small"
            icon="pi pi-eye"
          />
        </template>
      </List>
    </Card>

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
            :options="roleEmployeeOptionsData"
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
            :options="statusEmployeeOptionsData"
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
