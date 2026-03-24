<script setup lang="ts">
import { ref, onMounted, computed, inject } from "vue";
import { Dialog } from "primevue";
import { InputText } from "primevue";
import { Dropdown } from "primevue";
import { Textarea } from "primevue";
import { Button } from "primevue";
import type { Request, RequestStatus, RequestForm } from "@/types/RequestTypes";
import { useRequestStore } from "@/stores/useRequestStore";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { useRole } from "@/composables/useRole";

const requestStore = useRequestStore();
const userStore = useUserStore();
const { can } = useRole();

const { requestList } = storeToRefs(requestStore);
const { userData } = storeToRefs(userStore);

// Получаем функцию регистрации из provide
const registerOpenModal = inject<(fn: () => void) => void>("registerOpenModal", () => {});

onMounted(async () => {
  await requestStore.getRequests();
  // Регистрируем функцию открытия модального окна
  registerOpenModal(openCreateModal);
});

// Статусы заявок с отображаемыми названиями и цветами
const statusOptions = [
  { label: "Все статусы", value: "" },
  { label: "В ожидании", value: "pending", color: "bg-(--blue-bg) text-(--blue)" },
  { label: "В работе", value: "in_progress", color: "bg-orange-100 text-orange-700" },
  { label: "Согласовано", value: "approved", color: "bg-green-100 text-green-700" },
  { label: "Отклонено", value: "rejected", color: "bg-red-100 text-red-700" },
  { label: "Выполнено", value: "completed", color: "bg-(--purple-bg) text-(--purple)" },
];

// Список деталей для выбора
const partOptions = [
  { label: "Трос лебедки 8мм", value: "Трос лебедки 8мм" },
  { label: "Кнопка вызова 22мм", value: "Кнопка вызова 22мм" },
  { label: "Ремень привода дверей", value: "Ремень привода дверей" },
  { label: "Лампа LED 12В", value: "Лампа LED 12В" },
  { label: "Контактор главного привода", value: "Контактор главного привода" },
  { label: "Датчик положения кабины", value: "Датчик положения кабины" },
  { label: "Подшипник вала", value: "Подшипник вала" },
  { label: "Муфта сцепления", value: "Муфта сцепления" },
  { label: "Тормозная колодка", value: "Тормозная колодка" },
  { label: "Реле безопасности", value: "Реле безопасности" },
];

// Список проблем для аварийной заявки
const emergencyProblems = [
  { label: "Застрял лифт (люди внутри)", value: "Застрял лифт (люди внутри)" },
  { label: "Застрял лифт (без людей)", value: "Застрял лифт (без людей)" },
  { label: "Затопление / прорыв трубы", value: "Затопление / прорыв трубы" },
  { label: "Пожар / запах дыма / возгорание", value: "Пожар / запах дыма / возгорание" },
  { label: "Авария электроснабжения (отключение света)", value: "Авария электроснабжения (отключение света)" },
  { label: "Прорыв канализации", value: "Прорыв канализации" },
  { label: "Обрушение конструкции / трещина", value: "Обрушение конструкции / трещина" },
  { label: "Медицинская помощь (сердце, потеря сознания и т.д.)", value: "Медицинская помощь (сердце, потеря сознания и т.д.)" },
  { label: "Другое", value: "other" },
];

// Фильтрация заявок: админ и склад видят все, механик только свои
const userFilteredRequests = computed(() => {
  if (can("admin") || can("warehouse_operator")) {
    return requestList.value;
  }
  // Механик видит только свои заявки
  return requestList.value.filter(
    (request) => request.authorId === userData.value?.id
  );
});

// Поиск по названию
const searchQuery = ref("");

// Фильтр по статусу
const selectedStatus = ref("");

// Вид отображения: 'table' или 'list'
const viewMode = ref<"table" | "list">("table");

// Итоговая фильтрация (поиск + статус)
const filteredRequests = computed(() => {
  let result = userFilteredRequests.value;

  // Фильтр по статусу
  if (selectedStatus.value) {
    result = result.filter((r) => r.status === selectedStatus.value);
  }

  // Поиск по названию, автору или ID лифта
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.author.toLowerCase().includes(query) ||
        r.liftId.toLowerCase().includes(query)
    );
  }

  return result;
});

// === Модальное окно просмотра/редактирования ===
const isViewModalVisible = ref(false);
const currentRequest = ref<Request | null>(null);
const isEditMode = ref(false);

const createEmptyForm = (): RequestForm => ({
  title: "",
  author: "",
  authorId: 0,
  status: "pending",
  liftId: "",
  type: "planned",
  partName: "",
  quantity: 1,
  objectAddress: "",
  comment: "",
});

const requestForm = ref<RequestForm>(createEmptyForm());

// Список выбранных деталей с количеством (для Плановой - создание)
const selectedParts = ref<{partName: string, quantity: string}[]>([
  { partName: '', quantity: '1' }
]);

// Выбранные проблемы для аварийной заявки (множественный выбор)
const selectedProblems = ref<string[]>([]);

// Текст для проблемы "Другое"
const otherProblemText = ref("");

// Для режима просмотра/редактирования
const viewSelectedParts = ref<{partName: string, quantity: string}[]>([]);
const viewSelectedProblems = ref<string[]>([]);
const viewOtherProblemText = ref("");

// Открыть модальное окно для просмотра/редактирования
const openViewModal = (request: Request) => {
  currentRequest.value = request;
  requestForm.value = {
    title: request.title,
    author: request.author,
    authorId: request.authorId,
    status: request.status,
    liftId: request.liftId,
    type: request.type,
    partName: request.partName,
    quantity: request.quantity,
    objectAddress: request.objectAddress,
    comment: request.comment || "",
  };
  
  // Парсим детали из строки (формат: "Деталь 1 (2 шт.), Деталь 2 (1 шт.)")
  viewSelectedParts.value = [];
  viewSelectedProblems.value = [];
  viewOtherProblemText.value = "";

  if (request.type === 'planned') {
    const parts = request.partName.split(',').map(p => p.trim());
    parts.forEach(part => {
      const match = part.match(/(.+?)\s*\((\d+)\s*шт\.\)/);
      if (match) {
        viewSelectedParts.value.push({
          partName: match[1].trim(),
          quantity: match[2] // оставляем как string
        });
      } else {
        viewSelectedParts.value.push({ partName: part, quantity: '1' });
      }
    });
    if (viewSelectedParts.value.length === 0) {
      viewSelectedParts.value = [{ partName: '', quantity: '1' }];
    }
  } else {
    // Для аварийной - парсим проблемы
    const problems = (request.comment || request.partName).split(';').map(p => p.trim());
    problems.forEach(prob => {
      const exactMatch = emergencyProblems.find(ep => ep.label === prob);
      if (exactMatch) {
        viewSelectedProblems.value.push(exactMatch.value);
      } else if (prob) {
        viewSelectedProblems.value.push('other');
        viewOtherProblemText.value = prob;
      }
    });
  }
  
  isEditMode.value = false; // Только просмотр
  isViewModalVisible.value = true;
};

// Закрыть модальное окно
const closeViewModal = () => {
  isViewModalVisible.value = false;
  currentRequest.value = null;
};

// Добавить деталь в режиме просмотра
const addViewPartRow = () => {
  viewSelectedParts.value.push({ partName: '', quantity: '1' });
};

// Удалить деталь в режиме просмотра
const removeViewPartRow = (index: number) => {
  if (viewSelectedParts.value.length > 1) {
    viewSelectedParts.value.splice(index, 1);
  }
};

// Сохранить изменения
const handleUpdateRequest = async () => {
  if (currentRequest.value) {
    // Формируем partName из выбранных деталей
    if (requestForm.value.type === 'planned') {
      const partsWithQty = viewSelectedParts.value
        .filter(p => p.partName)
        .map(p => `${p.partName} (${p.quantity} шт.)`);
      requestForm.value.partName = partsWithQty.join(", ");
    } else {
      // Для аварийной
      const problems = viewSelectedProblems.value.filter(p => p !== "other");
      if (viewOtherProblemText.value.trim()) {
        problems.push(viewOtherProblemText.value.trim());
      }
      requestForm.value.comment = problems.join("; ");
      requestForm.value.partName = problems.join(", ");
    }

    await requestStore.updateRequest(currentRequest.value.id, requestForm.value);
    closeViewModal();
  }
};

// === Модальное окно создания новой заявки ===
const isCreateModalVisible = ref(false);

const openCreateModal = () => {
  requestForm.value = createEmptyForm();
  selectedParts.value = [{ partName: '', quantity: '1' }];
  selectedProblems.value = [];
  otherProblemText.value = "";
  // Заполняем данные текущего пользователя
  if (userData.value) {
    requestForm.value.author = userData.value.username;
    requestForm.value.authorId = userData.value.id;
  }
  isCreateModalVisible.value = true;
};

const closeCreateModal = () => {
  isCreateModalVisible.value = false;
  selectedParts.value = [{ partName: '', quantity: '1' }];
  selectedProblems.value = [];
  otherProblemText.value = "";
};

// Добавить новую деталь
const addPartRow = () => {
  selectedParts.value.push({ partName: '', quantity: '1' });
};

// Удалить деталь
const removePartRow = (index: number) => {
  if (selectedParts.value.length > 1) {
    selectedParts.value.splice(index, 1);
  }
};

const handleCreateRequest = async () => {
  if (requestForm.value.type === "emergency") {
    // Для аварийной - формируем список проблем
    const problems = selectedProblems.value.filter(p => p !== "other");
    if (otherProblemText.value.trim()) {
      problems.push(otherProblemText.value.trim());
    }
    requestForm.value.comment = problems.join("; ");
    requestForm.value.partName = problems.join(", ");
    requestForm.value.title = `Аварийная: ${problems.length} проблем(ы)`;
  } else {
    // Для плановой - собираем детали с количеством
    const partsWithQty = selectedParts.value
      .filter(p => p.partName)
      .map(p => `${p.partName} (${p.quantity} шт.)`);
    
    requestForm.value.partName = partsWithQty.join(", ");
    requestForm.value.title = `Плановая: ${partsWithQty.length} деталей`;
  }

  await requestStore.createRequest(requestForm.value);
  closeCreateModal();
};

// Получить отображаемое название статуса
const getStatusLabel = (status: RequestStatus) => {
  return statusOptions.find((s) => s.value === status)?.label || status;
};

// Получить цвет статуса
const getStatusColor = (status: RequestStatus) => {
  return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";
};

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Проверка: может ли пользователь редактировать заявку
const canEditRequest = (request: Request) => {
  return can("admin") || can("warehouse_operator") || request.authorId === userData.value?.id;
};
</script>

<template>
  <div class="requests-page flex flex-col gap-6">
    <!-- Карточка со списком заявок -->
    <div class="requests-card bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-(--title)">Список заявок</h2>
        <div class="flex items-center gap-2">
          <!-- Переключатель вида -->
          <button
            type="button"
            class="view-mode-btn"
            :class="viewMode === 'table' ? 'active' : ''"
            @click="viewMode = 'table'"
            title="Таблица"
          >
            <i class="pi pi-table"></i>
          </button>
          <button
            type="button"
            class="view-mode-btn"
            :class="viewMode === 'list' ? 'active' : ''"
            @click="viewMode = 'list'"
            title="Список"
          >
            <i class="pi pi-list"></i>
          </button>
        </div>
      </div>

      <!-- Поиск и фильтры -->
      <div class="flex gap-4 mb-4">
        <div class="flex-auto">
          <InputText
            v-model="searchQuery"
            placeholder="Поиск по названию, автору или ID лифта..."
            class="w-full"
          />
        </div>
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Статус"
          class="w-48"
        />
      </div>

      <!-- Вид: Таблица -->
      <div v-if="viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left bg-(--bg) text-(--text)">
              <th class="px-4 py-3 font-semibold rounded-tl-lg">Название заявки</th>
              <th class="px-4 py-3 font-semibold">Автор заявки</th>
              <th class="px-4 py-3 font-semibold">Статус</th>
              <th class="px-4 py-3 font-semibold">ID лифта</th>
              <th class="px-4 py-3 font-semibold rounded-tr-lg">Дата создания</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
              class="border-t border-(--border) hover:bg-(--bg) cursor-pointer"
              @click="openViewModal(request)"
            >
              <td class="px-4 py-3 text-(--text) font-medium">
                {{ request.title }}
              </td>
              <td class="px-4 py-3 text-(--text)">
                {{ request.author }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(request.status)"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-(--text)">
                <span class="font-mono text-sm">{{ request.liftId }}</span>
              </td>
              <td class="px-4 py-3 text-(--text) text-sm">
                {{ formatDate(request.createdAt) }}
              </td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-(--placeholder)">
                Список заявок пуст
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Вид: Список -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="request-item bg-(--bg) rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
          @click="openViewModal(request)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-auto">
              <h4 class="font-semibold text-(--title) mb-1">{{ request.title }}</h4>
              <div class="flex flex-wrap gap-3 text-sm text-(--text)">
                <span><span class="text-gray-500">Автор:</span> {{ request.author }}</span>
                <span><span class="text-gray-500">ID лифта:</span> <span class="font-mono">{{ request.liftId }}</span></span>
                <span><span class="text-gray-500">Дата:</span> {{ formatDate(request.createdAt) }}</span>
              </div>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              :class="getStatusColor(request.status)"
            >
              {{ getStatusLabel(request.status) }}
            </span>
          </div>
        </div>
        <div v-if="filteredRequests.length === 0" class="text-center text-(--placeholder) py-8">
          Список заявок пуст
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра/редактирования заявки -->
    <Dialog
      v-model:visible="isViewModalVisible"
      :header="isEditMode ? 'Редактирование заявки' : 'Просмотр заявки'"
      :style="{ width: '35rem' }"
      position="center"
      :modal="true"
      :draggable="false"
      :closable="true"
    >
      <div v-if="currentRequest" class="flex flex-col gap-4">
        <!-- Тип заявки (переключатель) -->
        <div class="flex gap-0 rounded-lg overflow-hidden border border-(--border)">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            :class="requestForm.type === 'planned' ? 'planned-active' : 'planned-inactive'"
            @click="requestForm.type = 'planned'"
            :disabled="!isEditMode"
          >
            Плановая
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            :class="requestForm.type === 'emergency' ? 'emergency-active' : 'emergency-inactive'"
            @click="requestForm.type = 'emergency'"
            :disabled="!isEditMode"
          >
            Аварийная
          </button>
        </div>

        <!-- Детали (для Плановой - множественный выбор с количеством) -->
        <div v-if="requestForm.type === 'planned'" class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-(--title)">
            ДЕТАЛИ <span class="text-(--red)">*</span>
          </label>
          
          <div class="flex flex-col gap-3">
            <div
              v-for="(part, index) in viewSelectedParts"
              :key="index"
              class="flex items-start gap-2"
            >
              <Dropdown
                v-model="part.partName"
                :options="partOptions"
                option-label="label"
                option-value="value"
                class="flex-auto"
                placeholder="Деталь"
                :disabled="!isEditMode"
                show-clear
                filter
              />
              <InputText
                v-model="part.quantity"
                type="number"
                min="1"
                class="w-20"
                :disabled="!isEditMode"
                placeholder="Кол-во"
              />
              <Button
                v-if="isEditMode && viewSelectedParts.length > 1"
                type="button"
                icon="pi pi-trash"
                class="p-button-danger p-button-rounded p-button-text"
                @click="removeViewPartRow(index)"
              />
            </div>
          </div>
          
          <Button
            v-if="isEditMode"
            type="button"
            label="+ Добавить деталь"
            icon="pi pi-plus"
            class="p-button-text p-button-sm"
            @click="addViewPartRow"
          />
        </div>

        <!-- Проблемы (для Аварийной) -->
        <div v-else class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-(--title)">
            ПРОБЛЕМА <span class="text-(--red)">*</span>
          </label>
          <div class="border border-(--border) rounded-lg p-3 max-h-64 overflow-y-auto">
            <div
              v-for="problem in emergencyProblems"
              :key="problem.value"
              class="flex items-start gap-2 py-1.5"
            >
              <input
                type="checkbox"
                :id="'view-problem-' + problem.value"
                :value="problem.value"
                v-model="viewSelectedProblems"
                class="w-4 h-4 text-(--red) rounded focus:ring-(--red) mt-0.5 flex-shrink-0"
                :disabled="!isEditMode"
              />
              <label :for="'view-problem-' + problem.value" class="text-sm text-(--text) cursor-pointer flex-1 break-words">
                {{ problem.label }}
              </label>
            </div>
          </div>
          
          <div v-if="viewSelectedProblems.includes('other') && isEditMode" class="mt-2">
            <InputText
              v-model="viewOtherProblemText"
              placeholder="Опишите проблему..."
              class="w-full"
            />
          </div>
        </div>

        <!-- Адрес объекта -->
        <div class="flex flex-col gap-2">
          <label for="viewObjectAddress" class="text-sm font-semibold text-(--title)">
            АДРЕС ОБЪЕКТА <span class="text-(--red)">*</span>
          </label>
          <InputText
            id="viewObjectAddress"
            v-model="requestForm.objectAddress"
            class="w-full"
            placeholder="Например: ул. Ленина 42, лифт №7"
            :disabled="!isEditMode"
          />
        </div>

        <!-- Комментарий -->
        <div class="flex flex-col gap-2">
          <label for="viewComment" class="text-sm font-semibold text-(--title)">
            КОММЕНТАРИЙ
          </label>
          <Textarea
            id="viewComment"
            v-model="requestForm.comment"
            class="w-full"
            rows="3"
            placeholder="Опишите проблему подробно..."
            :disabled="!isEditMode"
          />
          <span class="text-xs text-(--placeholder)">
            Необязательно, но помогает ускорить обработку заявки
          </span>
        </div>

        <!-- Статус (только для админа и склада) -->
        <div v-if="can('admin') || can('warehouse_operator')" class="flex flex-col gap-2">
          <label for="viewStatus" class="text-sm font-semibold text-(--title)">
            СТАТУС
          </label>
          <Dropdown
            id="viewStatus"
            v-model="requestForm.status"
            :options="statusOptions.slice(1)"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="Выберите статус"
            :disabled="!isEditMode"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <template v-if="!isEditMode">
          <Button
            v-if="canEditRequest(currentRequest!)"
            type="button"
            label="Редактировать"
            class="edit-btn"
            @click="isEditMode = true"
          />
          <Button
            type="button"
            label="Закрыть"
            severity="secondary"
            @click="closeViewModal"
          />
        </template>
        <template v-else>
          <Button
            type="button"
            label="Отмена"
            severity="secondary"
            @click="closeViewModal"
          />
          <Button
            type="button"
            label="Сохранить"
            class="save-btn"
            @click="handleUpdateRequest"
          />
        </template>
      </div>
    </Dialog>

    <!-- Модальное окно создания новой заявки -->
    <Dialog
      v-model:visible="isCreateModalVisible"
      header="Новая заявка"
      :style="{ width: '35rem' }"
      position="center"
      :modal="true"
      :draggable="false"
      :closable="true"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-(--text)">
          Механик подаёт запрос на получение детали
        </p>

        <!-- Тип заявки (переключатель) -->
        <div class="flex gap-0 rounded-lg overflow-hidden border border-(--border)">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            :class="requestForm.type === 'planned' ? 'planned-active' : 'planned-inactive'"
            @click="requestForm.type = 'planned'"
          >
            Плановая
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            :class="requestForm.type === 'emergency' ? 'emergency-active' : 'emergency-inactive'"
            @click="requestForm.type = 'emergency'"
          >
            Аварийная
          </button>
        </div>

        <!-- Детали (для Плановой - множественный выбор с количеством) -->
        <div v-if="requestForm.type === 'planned'" class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-(--title)">
            ДЕТАЛИ <span class="text-(--red)">*</span>
          </label>
          
          <div class="flex flex-col gap-3">
            <div
              v-for="(part, index) in selectedParts"
              :key="index"
              class="flex items-start gap-2"
            >
              <Dropdown
                v-model="part.partName"
                :options="partOptions"
                option-label="label"
                option-value="value"
                class="flex-auto"
                placeholder="Деталь"
                show-clear
                filter
              />
              <InputText
                v-model="part.quantity"
                type="number"
                min="1"
                class="w-20"
                placeholder="Кол-во"
              />
              <Button
                v-if="selectedParts.length > 1"
                type="button"
                icon="pi pi-trash"
                class="p-button-danger p-button-rounded p-button-text"
                @click="removePartRow(index)"
              />
            </div>
          </div>
          
          <Button
            type="button"
            label="+ Добавить деталь"
            icon="pi pi-plus"
            class="p-button-text p-button-sm"
            @click="addPartRow"
          />
        </div>

        <!-- Проблемы (для Аварийной) -->
        <div v-else class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-(--title)">
            ПРОБЛЕМА <span class="text-(--red)">*</span>
          </label>
          <div class="border border-(--border) rounded-lg p-3 max-h-64 overflow-y-auto">
            <div
              v-for="problem in emergencyProblems"
              :key="problem.value"
              class="flex items-start gap-2 py-1.5"
            >
              <input
                type="checkbox"
                :id="'create-problem-' + problem.value"
                :value="problem.value"
                v-model="selectedProblems"
                class="w-4 h-4 text-(--red) rounded focus:ring-(--red) mt-0.5 flex-shrink-0"
              />
              <label :for="'create-problem-' + problem.value" class="text-sm text-(--text) cursor-pointer flex-1 break-words">
                {{ problem.label }}
              </label>
            </div>
          </div>
          
          <div v-if="selectedProblems.includes('other')" class="mt-2">
            <InputText
              v-model="otherProblemText"
              placeholder="Опишите проблему..."
              class="w-full"
            />
          </div>
          
          <div v-if="selectedProblems.length > 0" class="text-xs text-(--placeholder)">
            Выбрано проблем: {{ selectedProblems.length }}
          </div>
        </div>

        <!-- Адрес объекта -->
        <div class="flex flex-col gap-2">
          <label for="createObjectAddress" class="text-sm font-semibold text-(--title)">
            АДРЕС ОБЪЕКТА <span class="text-(--red)">*</span>
          </label>
          <InputText
            id="createObjectAddress"
            v-model="requestForm.objectAddress"
            class="w-full"
            placeholder="Например: ул. Ленина 42, лифт №7"
          />
        </div>

        <!-- Комментарий -->
        <div class="flex flex-col gap-2">
          <label for="createComment" class="text-sm font-semibold text-(--title)">
            КОММЕНТАРИЙ
          </label>
          <Textarea
            id="createComment"
            v-model="requestForm.comment"
            class="w-full"
            rows="3"
            placeholder="Опишите проблему подробно..."
          />
          <span class="text-xs text-(--placeholder)">
            Необязательно, но помогает ускорить обработку заявки
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          @click="closeCreateModal"
        />
        <Button
          type="button"
          label="Отправить заявку"
          class="submit-btn"
          @click="handleCreateRequest"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.requests-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Заголовок "Список заявок" */
.requests-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1E293B;
}

/* Кнопка "Сохранить" - синяя #2563EB */
.save-btn {
  background-color: #2563EB !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}

.save-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Редактировать" */
.edit-btn {
  background-color: #2563EB !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}

.edit-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Отправить заявку" - как в макете */
.submit-btn {
  background-color: #2563EB !important;
  border: none !important;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.625rem 2rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.submit-btn:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Отмена" */
:deep(.submit-btn + .p-button) {
  color: #94A3B8;
}

/* Hover эффект для строк таблицы */
tbody tr:hover {
  background-color: #F1F5F9;
}

/* Отключаем cursor для кнопок внутри переключателя */
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Стили для модального окна */
:deep(.p-dialog-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E2E8F0;
}

:deep(.p-dialog-header .p-dialog-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1E293B;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #E2E8F0;
}

:deep(.p-dialog) {
  max-width: 35rem;
}

/* Поля ввода */
:deep(.p-inputtext) {
  border-radius: 0.5rem;
  border: 1px solid #E2E8F0;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus) {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Textarea */
:deep(.p-textarea) {
  border-radius: 0.5rem;
  border: 1px solid #E2E8F0;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
}

/* Dropdown */
:deep(.p-dropdown) {
  border-radius: 0.5rem;
  border: 1px solid #E2E8F0;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Лейблы */
label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E293B;
}

/* Переключатель Плановая/Аварийная */
button[class*="transition-colors"] {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Кнопка "Плановая" - активная (синяя) */
.planned-active {
  background-color: #2563EB !important;
  color: white !important;
  border: none;
}

.planned-active:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Плановая" - неактивная */
.planned-inactive {
  background-color: white !important;
  color: #94A3B8 !important;
  border: none;
}

.planned-inactive:hover {
  background-color: #F1F5F9 !important;
  color: #2563EB !important;
}

/* Кнопка "Аварийная" - активная (красная) */
.emergency-active {
  background-color: #DC2626 !important;
  color: white !important;
  border: none;
}

.emergency-active:hover {
  background-color: #b91c1c !important;
}

/* Кнопка "Аварийная" - неактивная */
.emergency-inactive {
  background-color: white !important;
  color: #94A3B8 !important;
  border: none;
}

.emergency-inactive:hover {
  background-color: #F1F5F9 !important;
  color: #DC2626 !important;
}

/* Кнопки переключателя вида (таблица/список) */
.view-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  background-color: white;
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-mode-btn:hover {
  background-color: #F1F5F9;
  color: #2563EB;
}

.view-mode-btn.active {
  background-color: #2563EB;
  border-color: #2563EB;
  color: white;
}

/* Элемент списка заявок */
.request-item {
  transition: all 0.2s;
}

.request-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
