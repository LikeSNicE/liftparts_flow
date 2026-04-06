<script setup lang="ts">
import {
  Dialog,
  Button,
  Dropdown,
  InputText,
  Textarea,
  InputNumber,
} from "primevue";
import type { PartOption, RepairRequestForm } from "@/types/RepairRequestTypes";
import type { Elevator } from "@/types/ElevatorTypes";
import { partOptions } from "@/data/requestData";
import { emergencyProblems } from "@/data/emergencyProblems";
import { useRepairRequestStore } from "@/stores/useRepairRequestStore";
import { useModalStore } from "@/stores/useModalStore";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref } from "vue";
import {
  useAddressAutocomplete,
  type AddressSuggestion,
} from "@/composables/useAddressAutocomplete";

const CITY_OPTIONS = ["Астана", "Алматы", "Шымкент"];

const requestStore = useRepairRequestStore();
const modalStore = useModalStore();
const { userData } = storeToRefs(useUserStore());

const { requestForm, elevatorList } = defineProps<{
  requestForm: RepairRequestForm;
  elevatorList: Elevator[];
}>();

if (!requestForm.city) {
  requestForm.city = "Астана";
}

const selectedParts = ref<PartOption[]>([{ partName: "", quantity: 1 }]);
const addressError = ref("");
const selectedAddress = ref<AddressSuggestion | null>(null);
const isMapDialogVisible = ref(false);
const isSuggestionsVisible = ref(false);
let addressSearchTimeout: ReturnType<typeof setTimeout> | null = null;

const {
  suggestions: addressSuggestions,
  isLoading: addressLoading,
  searchAddresses,
  clearSuggestions,
} = useAddressAutocomplete();

const hasAddressSuggestions = computed(
  () => isSuggestionsVisible.value && addressSuggestions.value.length > 0,
);

const handleAddressInput = () => {
  selectedAddress.value = null;
  requestForm.latitude = null;
  requestForm.longitude = null;
  addressError.value = "";

  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
  }

  addressSearchTimeout = setTimeout(async () => {
    await searchAddresses(requestForm.objectAddress || "", requestForm.city);
    isSuggestionsVisible.value = addressSuggestions.value.length > 0;

    if (
      (requestForm.objectAddress || "").trim().length >= 3 &&
      addressSuggestions.value.length === 0
    ) {
      addressError.value = "Адреса не найдены";
    }
  }, 300);
};

const handleAddressBlur = () => {
  setTimeout(() => {
    isSuggestionsVisible.value = false;
  }, 120);
};

const handleCityChange = () => {
  requestForm.objectAddress = "";
  requestForm.latitude = null;
  requestForm.longitude = null;
  selectedAddress.value = null;
  addressError.value = "";
  isSuggestionsVisible.value = false;
  clearSuggestions();

  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
    addressSearchTimeout = null;
  }
};

const applyAddressSuggestion = (suggestion: AddressSuggestion) => {
  selectedAddress.value = suggestion;
  requestForm.objectAddress = suggestion.displayName;
  requestForm.latitude = suggestion.latitude;
  requestForm.longitude = suggestion.longitude;
  isSuggestionsVisible.value = false;
  clearSuggestions();
  addressError.value = "";
};

const openMapPicker = () => {
  isMapDialogVisible.value = true;
};

const closeMapPicker = () => {
  isMapDialogVisible.value = false;
};

const handleMapMessage = (event: MessageEvent) => {
  if (event.data?.type !== "ADDRESS_SELECTED") {
    return;
  }

  const payload = event.data.data;
  if (!payload) {
    return;
  }

  const latitude = Number(payload.lat);
  const longitude = Number(payload.lon);
  const address = String(payload.address || "");

  if (Number.isNaN(latitude) || Number.isNaN(longitude) || !address.trim()) {
    return;
  }

  requestForm.objectAddress = address;
  requestForm.latitude = latitude;
  requestForm.longitude = longitude;
  selectedAddress.value = {
    displayName: address,
    latitude,
    longitude,
  };

  clearSuggestions();
  isSuggestionsVisible.value = false;
  addressError.value = "";
  closeMapPicker();
};

if (typeof window !== "undefined") {
  window.addEventListener("message", handleMapMessage);
}

const addPartRow = () => {
  selectedParts.value.push({ partName: "", quantity: 1 });
};

const removePartRow = (index: number) => {
  selectedParts.value.splice(index, 1);
};

// Авариайная заявка
const selectedProblems = ref<string[]>([]);
const emergencyOtherProblem = ref<string>("");

// сброс формы заявки
const resetRequestForm = () => {
  requestForm.author = userData.value ? userData.value.username : "Unknown";
  requestForm.authorId = userData.value ? userData.value.id : 0;
  requestForm.status = "pending";
  requestForm.liftId = 0;
  requestForm.type = "planned";
  requestForm.parts = [];

  requestForm.city = "Астана";
  requestForm.latitude = null;
  requestForm.longitude = null;
  requestForm.objectAddress = "";
  requestForm.comment = "";

  clearSuggestions();
  isSuggestionsVisible.value = false;
  addressError.value = "";
  selectedAddress.value = null;

  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
    addressSearchTimeout = null;
  }

  selectedParts.value.splice(0, selectedParts.value.length);
  selectedParts.value.push({ partName: "", quantity: 1 });

  selectedProblems.value.splice(0, selectedProblems.value.length);
  emergencyOtherProblem.value = "";
};

// Скрытие модального окна
const onModalVisibilityChange = (value: boolean) => {
  if (!value) {
    resetRequestForm();
    closeMapPicker();
    modalStore.closeModal("createRepairRequest");
    return;
  }
};

// Создание заявки
const handleCreateRequest = async () => {
  requestForm.objectAddress = (requestForm.objectAddress || "").trim();

  if (
    !requestForm.objectAddress ||
    requestForm.latitude === null ||
    requestForm.latitude === undefined ||
    requestForm.longitude === null ||
    requestForm.longitude === undefined
  ) {
    addressError.value =
      "Выберите адрес из подсказок, чтобы заявка и карта были синхронизированы";
    return;
  }

  if (requestForm.type === "emergency") {
    // Заменяем "other" на текст из input
    const otherText = emergencyOtherProblem.value.toLowerCase().trim();

    requestForm.selectedProblems = selectedProblems.value
      .map((p) => (p === "other" && otherText ? otherText : p))
      .filter((p) => otherText || p !== "other");

    // map() заменяет "other" на текст из input, а filter() убирает "other" если текст не введён.

    requestForm.emergencyOtherProblem = emergencyOtherProblem.value
      .toLowerCase()
      .trim();
  } else {
    requestForm.parts = selectedParts.value;
  }

  try {
    await requestStore.createRequest(requestForm);
    resetRequestForm();
    closeMapPicker();
    modalStore.closeModal("createRepairRequest");
  } catch (error) {
    addressError.value = "Не удалось отправить заявку. Повторите попытку";
    console.log("Ошибка отправки заявки:", error);
  }
};

onBeforeUnmount(() => {
  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
  }

  if (typeof window !== "undefined") {
    window.removeEventListener("message", handleMapMessage);
  }
});
</script>

<template>
  <Dialog
    :visible="modalStore.modalState.createRepairRequest"
    @update:visible="onModalVisibilityChange"
    header="Новая заявка"
    modal
    :draggable="false"
    position="center"
    :style="{ width: '35rem' }"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-(--text)">
        Механик подаёт запрос на получение детали
      </p>

      <!-- Тип заявки (переключатель) -->
      <div
        class="flex gap-0 rounded-lg overflow-hidden border border-(--border)"
      >
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
          :class="
            requestForm.type === 'planned'
              ? 'planned-active'
              : 'planned-inactive'
          "
          @click="requestForm.type = 'planned'"
        >
          Плановая
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
          :class="
            requestForm.type === 'emergency'
              ? 'emergency-active'
              : 'emergency-inactive'
          "
          @click="requestForm.type = 'emergency'"
        >
          Аварийная
        </button>
      </div>

      <!-- Лифты -->
      <div>
        <label class="text-sm font-semibold text-(--title) uppercase">
          лифты <span class="text-(--red)">*</span>
        </label>
        <Dropdown
          v-model="requestForm.liftId"
          :options="elevatorList"
          option-label="name"
          option-value="id"
          class="w-full"
          placeholder="Лифты"
          show-clear
          filter
        >
          <template #option="slotProps">
            <div>
              {{ slotProps.option.name }} ({{ slotProps.option.location }})
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Детали (для Плановой - множественный выбор с количеством) -->
      <div class="flex flex-col gap-2">
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
            <InputNumber
              v-model="part.quantity"
              type="number"
              :min="1"
              :max="1000"
              class="w-20"
              placeholder="Кол-во"
              showButtons
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
          label="Добавить деталь"
          icon="pi pi-plus"
          class="p-button-text p-button-sm"
          @click="addPartRow"
        />
      </div>

      <!-- Проблемы (для Аварийной) -->
      <div v-if="requestForm.type === 'emergency'" class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-(--title)">
          ПРОБЛЕМА <span class="text-(--red)">*</span>
        </label>
        <div
          class="border border-(--border) rounded-lg p-3 max-h-64 overflow-y-auto"
        >
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
              class="w-4 h-4 text-(--red) rounded focus:ring-(--red) mt-0.5 shrink-0"
            />
            <label
              :for="'create-problem-' + problem.value"
              class="text-sm text-(--text) cursor-pointer flex-1 wrap-break-word"
            >
              {{ problem.label }}
            </label>
          </div>
        </div>

        <div v-if="selectedProblems.includes('other')" class="mt-2">
          <InputText
            v-model="emergencyOtherProblem"
            placeholder="Опишите проблему..."
            class="w-full"
          />
        </div>

        <div
          v-if="selectedProblems.length > 0"
          class="text-xs text-(--placeholder)"
        >
          Выбрано проблем: {{ selectedProblems.length }}
        </div>
      </div>

      <!-- Город -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-(--title)">
          ГОРОД <span class="text-(--red)">*</span>
        </label>
        <Dropdown
          v-model="requestForm.city"
          :options="CITY_OPTIONS"
          class="w-full"
          placeholder="Выберите город"
          @change="handleCityChange"
        />
      </div>

      <!-- Адрес объекта -->
      <div class="flex flex-col gap-2">
        <label
          for="createObjectAddress"
          class="text-sm font-semibold text-(--title)"
        >
          АДРЕС ОБЪЕКТА <span class="text-(--red)">*</span>
        </label>
        <div class="flex gap-2">
          <InputText
            id="createObjectAddress"
            v-model="requestForm.objectAddress"
            class="w-full"
            placeholder="Начните вводить адрес и выберите вариант"
            @input="handleAddressInput"
            @focus="isSuggestionsVisible = addressSuggestions.length > 0"
            @blur="handleAddressBlur"
          />
          <Button
            type="button"
            label="На карте"
            icon="pi pi-map-marker"
            severity="secondary"
            @click="openMapPicker"
          />
        </div>

        <div v-if="addressLoading" class="text-xs text-(--placeholder)">
          Идет поиск адресов...
        </div>

        <div
          v-if="hasAddressSuggestions"
          class="border border-(--border) rounded-lg max-h-44 overflow-y-auto"
        >
          <button
            v-for="suggestion in addressSuggestions"
            :key="`${suggestion.latitude}-${suggestion.longitude}`"
            type="button"
            class="w-full text-left px-3 py-2 text-sm hover:bg-(--bg) transition-colors border-b border-(--border) last:border-b-0"
            @click="applyAddressSuggestion(suggestion)"
          >
            {{ suggestion.displayName }}
          </button>
        </div>

        <div
          v-if="selectedAddress && requestForm.latitude && requestForm.longitude"
          class="text-xs text-emerald-600"
        >
          Адрес зафиксирован. Координаты: {{ requestForm.latitude.toFixed(6) }},
          {{ requestForm.longitude.toFixed(6) }}
        </div>

        <div v-if="addressError" class="text-xs text-(--red)">
          {{ addressError }}
        </div>
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
        @click="onModalVisibilityChange(false)"
      />
      <Button
        type="button"
        label="Отправить заявку"
        class="submit-btn"
        @click="handleCreateRequest"
      />
    </div>
  </Dialog>

  <Dialog
    :visible="isMapDialogVisible"
    @update:visible="closeMapPicker"
    header="Выбор адреса на карте"
    modal
    :draggable="false"
    :closable="true"
    :style="{ width: '70rem', maxWidth: '95vw' }"
  >
    <iframe
      src="/elevator-map-picker.html"
      title="Выбор адреса"
      class="w-full border-0 rounded-lg"
      style="height: 65vh"
    />
  </Dialog>
</template>

<style scoped>
/* Кнопка "Плановая" - активная (синяя) */
.planned-active {
  background-color: #2563eb !important;
  color: white !important;
  border: none;
}

.planned-active:hover {
  background-color: #1d4ed8 !important;
}

/* Кнопка "Плановая" - неактивная */
.planned-inactive {
  background-color: white !important;
  color: #94a3b8 !important;
  border: none;
}

.planned-inactive:hover {
  background-color: #f1f5f9 !important;
  color: #2563eb !important;
}

/* Кнопка "Аварийная" - активная (красная) */
.emergency-active {
  background-color: #dc2626 !important;
  color: white !important;
  border: none;
}

.emergency-active:hover {
  background-color: #b91c1c !important;
}

/* Кнопка "Аварийная" - неактивная */
.emergency-inactive {
  background-color: white !important;
  color: #94a3b8 !important;
  border: none;
}

.emergency-inactive:hover {
  background-color: #f1f5f9 !important;
  color: #dc2626 !important;
}
</style>
