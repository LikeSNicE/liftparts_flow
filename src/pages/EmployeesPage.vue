<script setup lang="ts">
import { ref, computed, inject, onMounted } from "vue";
import { Button } from "primevue";
import { Dialog } from "primevue";
import { InputText } from "primevue";
import { Dropdown } from "primevue";
import type { Employee, EmployeeStatus, UserRole } from "@/types/UserTypes";
import { useUserStore } from "@/stores/useUserStore";

const userStore = useUserStore();

// Получаем функцию для регистрации метода из HomePage
const registerOpenAddEmployee = inject<((fn: () => void) => void) | null>("registerOpenAddEmployee", null);

// Регистрируем метод openAddModal при монтировании
onMounted(() => {
  registerOpenAddEmployee?.(openAddModal);
});

// Проверка: только администратор может редактировать
const isAdmin = computed(() => userStore.userData?.userrole === "admin");

// Статусы сотрудников с отображаемыми названиями
const statusOptions = [
  { label: "На работе", value: "at_work" },
  { label: "Удалённо", value: "remote" },
  { label: "Перерыв", value: "break" },
  { label: "Отпуск", value: "vacation" },
  { label: "Неактивен", value: "inactive" },
];

// Роли с отображаемыми названиями
const roleOptions = [
  { label: "Механик", value: "mechanic" },
  { label: "Администратор", value: "admin" },
  { label: "Склад", value: "warehouse_operator" },
];

// Данные сотрудников (заглушка, в будущем будет API)
const employees = ref<Employee[]>([
  {
    id: 1,
    username: "Иванов Иван",
    lastname: "Иванов",
    email: "ivanov@example.com",
    userrole: "mechanic",
    status: "at_work",
  },
  {
    id: 2,
    username: "Петров Пётр",
    lastname: "Петров",
    email: "petrov@example.com",
    userrole: "warehouse_operator",
    status: "remote",
  },
]);

// === Модальное окно добавления/редактирования ===
const isEditModalVisible = ref(false);
const isEditing = ref(false);
const currentEmployee = ref<Employee | null>(null);

// Форма сотрудника
const employeeForm = ref<{
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  status: EmployeeStatus;
}>({
  username: "",
  lastname: "",
  email: "",
  userrole: "mechanic",
  status: "at_work",
});

// Открыть модальное окно для добавления
const openAddModal = () => {
  isEditing.value = false;
  currentEmployee.value = null;
  employeeForm.value = {
    username: "",
    lastname: "",
    email: "",
    userrole: "mechanic",
    status: "at_work",
  };
  isEditModalVisible.value = true;
};

// Открыть модальное окно для редактирования
const openEditModal = (employee: Employee) => {
  isEditing.value = true;
  currentEmployee.value = employee;
  employeeForm.value = {
    username: employee.username,
    lastname: employee.lastname,
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
    status: "at_work",
  };
};

// Сохранение сотрудника
const saveEmployee = () => {
  if (isEditing.value && currentEmployee.value) {
    // Редактирование существующего
    const index = employees.value.findIndex((e) => e.id === currentEmployee.value!.id);
    if (index !== -1) {
      employees.value[index] = {
        ...currentEmployee.value,
        username: employeeForm.value.username,
        lastname: employeeForm.value.lastname,
        email: employeeForm.value.email,
        userrole: employeeForm.value.userrole,
        status: employeeForm.value.status,
      };
    }
  } else {
    // Добавление нового
    const newEmployee: Employee = {
      id: Date.now(),
      username: employeeForm.value.username,
      lastname: employeeForm.value.lastname,
      email: employeeForm.value.email,
      userrole: employeeForm.value.userrole,
      status: employeeForm.value.status,
    };
    employees.value.push(newEmployee);
  }
  closeEditModal();
};

// === Модальное окно подтверждения удаления ===
const isDeleteModalVisible = ref(false);
const deleteConfirmText = ref("");

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
const confirmDelete = () => {
  // Проверка: пользователь должен ввести "Удалить" (в любом регистре)
  if (deleteConfirmText.value.toLowerCase() === "удалить") {
    if (currentEmployee.value) {
      employees.value = employees.value.filter((e) => e.id !== currentEmployee.value!.id);
    }
    closeDeleteModal();
    closeEditModal();
  }
};

// Получить отображаемое название статуса
const getStatusLabel = (status: EmployeeStatus) => {
  return statusOptions.find((s) => s.value === status)?.label || status;
};

// Получить отображаемое название роли
const getRoleLabel = (role: UserRole) => {
  return roleOptions.find((r) => r.value === role)?.label || role;
};
</script>

<template>
  <div class="employees-page">
    <!-- Таблица сотрудников -->
    <div class="employees-card bg-white rounded-lg p-6">
      <h2 class="text-xl font-semibold text-(--title) mb-4">Список сотрудников</h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left bg-(--bg) text-(--text)">
              <th class="px-4 py-3 font-semibold rounded-tl-lg">ФИО</th>
              <th class="px-4 py-3 font-semibold">Роль</th>
              <th class="px-4 py-3 font-semibold">Статус</th>
              <th class="px-4 py-3 font-semibold rounded-tr-lg">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="employee in employees"
              :key="employee.id"
              class="border-t border-(--border) hover:bg-(--bg)"
            >
              <td class="px-4 py-3 text-(--text)">
                {{ employee.username }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="{
                    'bg-(--blue-bg) text-(--blue)': employee.userrole === 'mechanic',
                    'bg-(--purple-bg) text-(--purple)': employee.userrole === 'admin',
                    'bg-orange-100 text-orange-700': employee.userrole === 'warehouse_operator',
                  }"
                >
                  {{ getRoleLabel(employee.userrole) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="{
                    'status-at-work': employee.status === 'at_work',
                    'status-remote': employee.status === 'remote',
                    'status-break': employee.status === 'break',
                    'status-vacation': employee.status === 'vacation',
                    'status-inactive': employee.status === 'inactive',
                  }"
                >
                  {{ getStatusLabel(employee.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <a
                  href="#"
                  class="edit-link"
                  @click.prevent="openEditModal(employee)"
                  v-if="isAdmin"
                >
                  Редактировать
                </a>
              </td>
            </tr>
            <tr v-if="employees.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-(--placeholder)">
                Список сотрудников пуст
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-(--placeholder) mt-4">
        * Добавление новых администраторов возможно только через SQL дамп или консоль сервера.
      </p>
    </div>

    <!-- Модальное окно добавления/редактирования (ТОЛЬКО ПО ЦЕНТРУ) -->
    <Dialog
      v-model:visible="isEditModalVisible"
      :header="isEditing ? 'Редактировать сотрудника' : 'Добавить сотрудника'"
      :style="{ width: '30rem' }"
      position="center"
      :modal="true"
      :draggable="false"
      :closable="true"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label for="username" class="font-semibold w-28 text-(--text)">ФИО</label>
          <InputText
            id="username"
            v-model="employeeForm.username"
            class="flex-auto"
            placeholder="Иванов Иван"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="email" class="font-semibold w-28 text-(--text)">Email</label>
          <InputText
            id="email"
            v-model="employeeForm.email"
            class="flex-auto"
            placeholder="email@example.com"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="role" class="font-semibold w-28 text-(--text)">Роль</label>
          <Dropdown
            id="role"
            v-model="employeeForm.userrole"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            class="flex-auto"
            placeholder="Выберите роль"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="status" class="font-semibold w-28 text-(--text)">Статус</label>
          <Dropdown
            id="status"
            v-model="employeeForm.status"
            :options="statusOptions"
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
          v-if="isEditing"
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
            @click="saveEmployee"
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
          <span class="font-semibold text-(--title)">{{ currentEmployee?.username }}</span>?
        </p>
        <p class="text-sm text-(--placeholder)">
          Для подтверждения введите слово <span class="font-semibold">«Удалить»</span>
        </p>
        <div class="flex items-center gap-4">
          <label for="delete-confirm" class="font-semibold w-20 text-(--text)">Текст</label>
          <InputText
            id="delete-confirm"
            v-model="deleteConfirmText"
            class="flex-auto"
            placeholder="Введите «Удалить»"
            @keyup.enter="confirmDelete"
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
          @click="confirmDelete"
          :disabled="deleteConfirmText.toLowerCase() !== 'удалить'"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.employees-page {
  padding: 2rem;
}

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
.status-at-work {
  background-color: var(--blue-bg);
  color: var(--blue);
}

/* Статус "Удалённо" - зелёный #16A34A */
.status-remote {
  background-color: var(--green);
  color: white;
}

/* Статус "Перерыв" - оранжевый #D97706 */
.status-break {
  background-color: var(--orange);
  color: white;
}

/* Статус "Отпуск" - фиолетовый #7E22CE */
.status-vacation {
  background-color: var(--purple-bg);
  color: var(--purple);
}

/* Статус "Неактивен" - красный #DC2626 */
.status-inactive {
  background-color: var(--red);
  color: white;
}
</style>
