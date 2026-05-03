<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button, InputText, InputMask } from "primevue";

import { useUserStore } from "@/stores/useUserStore";
import { getEmployeeStatus, getRoleLabel } from "@/utils/entityHelpers";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { storeToRefs } from "pinia";
import { api } from "@/service/apiInstance";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatDate } from "@/utils/formatDate";

// Данные пользователяavatarPreview
const userStore = useUserStore();
const { userData } = storeToRefs(userStore);
const employeeStore = useEmployeeStore();

// Активная вкладка
const activeTab = ref<"profile" | "security" | "notifications">("profile");

// Загруженный аватар
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const isUploadingAvatar = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Форма профиля для редактирования
const profileForm = ref({
  username: "",
  lastname: "",
  middlename: "",
  email: "",
  phone: "",
  avatar: "",
});

// Инициализация формы при загрузке
const initProfileForm = () => {
  if (userData.value) {
    profileForm.value = {
      username: userData.value.username || "",
      lastname: userData.value.lastname || "",
      middlename: userData.value.middlename || "",
      email: userData.value.email || "",
      phone: userData.value.phone || "",
      avatar: userData.value.avatar || "",
    };
    // Устанавливаем превью аватара из userData
    avatarPreview.value = userData.value.avatar || null;
  }
};

// ========== РАБОТА С АВАТАРОМ ==========

// Шаг 1: Выбор файла и локальное превью
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Проверка размера (максимум 1MB)
  if (file.size > 1000000) {
    alert("Файл слишком большой. Максимум 1MB");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Файл должен быть изображением");
    return;
  }

  avatarFile.value = file;

  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.value = reader.result as string;
  };

  reader.readAsDataURL(file);
};

// Шаг 2: Загрузка файла на сервер

const uploadAvatarToServer = async (): Promise<string | null> => {
  if (!avatarFile.value) return null;

  try {
    isUploadingAvatar.value = true;

    const formData = new FormData();
    formData.append("file", avatarFile.value);

    const { data } = await api.post<{ id: number; url: string }>(
      "/uploads",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data.url;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.log(errorMessage.message);
    return null;
  } finally {
    isUploadingAvatar.value = false;
  }
};

// Шаг 3 Удаление аватара

const removeAvatar = () => {
  avatarPreview.value = null;
  avatarFile.value = null;
  profileForm.value.avatar = "";
};

// ========== РАБОТА С ВКЛАДКОЙ БЕЗОПАСНОТЬЮ ==========
// Форма смены пароля
const isChangingPassword = ref(false);

const passwordForm = ref({
  // currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordError = ref("");
const passwordSuccess = ref("");

const startChangePassword = () => {
  passwordForm.value = {
    newPassword: "",
    confirmPassword: "",
  };
  isChangingPassword.value = true;
  passwordError.value = "";
  passwordSuccess.value = "";
};

const savePassword = async () => {
  passwordSuccess.value = "";
  passwordError.value = "";

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "Пароли не совпадают";
    return;
  }

  if (!userData.value) return;

  try {
    await employeeStore.updateEmployee(userData.value.id, {
      ...userData.value,
      password: passwordForm.value.newPassword.trim(),
    });
    // passwordForm.value.currentPassword = passwordForm.value.newPassword.trim();

    passwordSuccess.value = "Пароль успешно изменен";

    console.log(passwordForm.value);
  } catch (error) {}
};

const cancelChangePassword = () => {
  passwordForm.value = {
    // currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  isChangingPassword.value = false;
};

onMounted(() => {
  initProfileForm();
});

// Сохранить изменения профиля
const saveProfile = async () => {
  if (!userData.value) return;

  try {
    // Если выбран новый файл, сначала загружаем его
    if (avatarFile.value) {
      const avatarUrl = await uploadAvatarToServer();
      if (avatarUrl) {
        profileForm.value.avatar = avatarUrl;
      }
    }

    // Сохраняем профиль (без дополнительной проверки)
    await employeeStore.updateEmployee(userData.value.id, {
      ...userData.value,
      username: profileForm.value.username,
      lastname: profileForm.value.lastname,
      middlename: profileForm.value.middlename,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      avatar: profileForm.value.avatar,
    });

    // Обновляем userData после сохранения
    await userStore.getAuthUser();
    initProfileForm();
    avatarFile.value = null;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.log(errorMessage.message);
    throw new Error(
      "Не удалось сохранить профиль. Пожалуйста, попробуйте позже.",
    );
  }
};

console.log(userData.value);
</script>

<template>
  <div class="settings-page">
    <!-- Вкладки -->
    <div class="flex gap-2 mb-6 border-b border-(--border)">
      <button
        @click="activeTab = 'profile'"
        class="px-4 py-2 font-medium transition-colors border-b-2"
        :class="
          activeTab === 'profile'
            ? 'text-(--blue) border-(--blue)'
            : 'text-(--placeholder) border-transparent hover:text-(--text)'
        "
      >
        <i class="pi pi-user mr-2"></i>
        Профиль
      </button>
      <button
        @click="activeTab = 'security'"
        class="px-4 py-2 font-medium transition-colors border-b-2"
        :class="
          activeTab === 'security'
            ? 'text-(--blue) border-(--blue)'
            : 'text-(--placeholder) border-transparent hover:text-(--text)'
        "
      >
        <i class="pi pi-shield mr-2"></i>
        Безопасность
      </button>
    </div>

    <!-- Вкладка: Профиль -->
    <div v-if="activeTab === 'profile'" class="settings-content">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Аватар -->
        <div class="md:col-span-1">
          <div
            class="settings-card bg-white rounded-lg border border-(--border) p-6"
          >
            <h2 class="text-lg font-semibold text-(--title) mb-4">
              Фото профиля
            </h2>

            <div class="flex flex-col items-center gap-4">
              <div
                class="avatar-container w-32 h-32 rounded-full bg-(--bg) flex items-center justify-center overflow-hidden border-2 border-(--border)"
              >
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <i v-else class="pi pi-user text-4xl text-(--placeholder)"></i>

                <!-- Индикатор загрузки -->
                <!-- <div
                  v-if="isUploadingAvatar"
                  class="absolute inset-0 bg-opacity-50 flex items-center justify-center "
                >
                  <i class="pi pi-spin pi-spinner text-white text-2xl"></i>
                </div> -->
              </div>

              <div class="flex flex-col gap-2 w-full">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  class="hidden"
                />

                <Button
                  @click="fileInput?.click()"
                  :label="avatarPreview ? 'Изменить фото' : 'Загрузить фото'"
                  icon="pi pi-upload"
                  :disabled="isUploadingAvatar"
                  class="w-full"
                />

                <Button
                  v-if="avatarPreview"
                  @click="removeAvatar"
                  label="Удалить фото"
                  severity="danger"
                  outlined
                  size="small"
                  class="w-full"
                  :disabled="isUploadingAvatar"
                />
              </div>

              <p class="text-xs text-(--placeholder) text-center">
                JPG, PNG до 1MB
              </p>
            </div>
          </div>

          <!-- Информация о роли -->
          <div
            v-if="userData"
            class="settings-card bg-white rounded-lg border border-(--border) p-6 mt-6"
          >
            <h2 class="text-lg font-semibold text-(--title) mb-4">
              Информация
            </h2>
            <div class="space-y-3 grid grid-cols-2 gap-4">
              <div>
                <div>
                  <label class="text-xs text-(--placeholder) uppercase"
                    >Роль</label
                  >
                  <p class="text-(--text) font-medium capitalize">
                    {{ getRoleLabel(userData.userrole) }}
                  </p>
                </div>
              </div>
              <div>
                <label class="text-xs text-(--placeholder) uppercase"
                  >Статус</label
                >
                <p class="text-(--text) font-medium capitalize">
                  {{ getEmployeeStatus(userData.status) }}
                </p>
              </div>
              <div>
                <label class="text-xs text-(--placeholder) uppercase"
                  >Дата регистрации</label
                >
                <p class="text-(--text) font-medium">
                  {{ userData.createdAt ? formatDate(userData.createdAt) : "—" }}
                </p>
              </div>
              <div>
                <label class="text-xs text-(--placeholder) uppercase"
                  >Последний вход</label
                >
                <p class="text-(--text) font-medium">
                  {{ userData.lastLogin ? formatDate(userData.lastLogin) : "—" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма профиля -->
        <div class="md:col-span-2" v-if="userData">
          <div
            class="settings-card bg-white rounded-lg border border-(--border) p-6"
          >
            <h2 class="text-lg font-semibold text-(--title) mb-4">
              Личная информация
            </h2>

            <div class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="flex flex-col gap-2">
                  <label for="username" class="text-sm text-(--text)"
                    >Имя</label
                  >
                  <InputText
                    id="username"
                    class="w-full"
                    placeholder="Иванов Иван"
                    v-model="profileForm.username"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="lastname" class="text-sm text-(--text)"
                    >Фамилия</label
                  >
                  <InputText
                    id="lastname"
                    class="w-full"
                    placeholder="Иванов"
                    v-model="profileForm.lastname"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="middlename" class="text-sm text-(--text)"
                  >Отчество</label
                >
                <InputText
                  id="middlename"
                  v-model="profileForm.middlename"
                  type="text"
                  class="w-full"
                  placeholder="Иванович"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label for="email" class="text-sm text-(--text)">Email</label>
                <InputText
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="w-full"
                  placeholder="email@example.com"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label for="phone" class="text-sm text-(--text)">Телефон</label>
                <InputMask
                  id="phone"
                  mask="9-(999)-999-99-99"
                  placeholder="9-(999)-999-99-99"
                  class="w-full"
                  v-model="profileForm.phone"
                />
              </div>

              <div class="flex justify-end pt-4">
                <Button
                  label="Сохранить изменения"
                  class="bg-(--blue) border-none"
                  @click="saveProfile"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else>Данные пользователя не найдены</div>
      </div>
    </div>

    <!-- Вкладка: Безопасность -->
    <div v-if="activeTab === 'security'" class="settings-content">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Смена пароля -->
        <div
          class="settings-card bg-white rounded-lg border border-(--border) p-6"
        >
          <h2 class="text-lg font-semibold text-(--title) mb-4">
            Смена пароля
          </h2>

          <template v-if="!isChangingPassword">
            <p class="text-(--placeholder) text-sm mb-4">
              Регулярно меняйте пароль для безопасности вашего аккаунта
            </p>
            <Button
              label="Изменить пароль"
              icon="pi pi-key"
              class="bg-(--blue) border-none"
              @click="startChangePassword"
            />
          </template>

          <template v-else>
            <div class="space-y-4">
              <div
                v-if="passwordError"
                class="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200"
              >
                <i class="pi pi-exclamation-circle mr-2"></i>
                {{ passwordError }}
              </div>
              <div
                v-if="passwordSuccess"
                class="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm border border-green-200"
              >
                <i class="pi pi-check-circle mr-2"></i>
                {{ passwordSuccess }}
              </div>

              <!-- <div class="flex flex-col gap-2">
                <label for="current-password" class="text-sm text-(--text)"
                  >Текущий пароль</label
                >

                <InputText
                  id="current-password"
                  v-model="passwordForm.currentPassword"
                  type="text"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div> -->
              <div class="flex flex-col gap-2">
                <label for="new-password" class="text-sm text-(--text)"
                  >Новый пароль</label
                >
                <InputText
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="confirm-password" class="text-sm text-(--text)"
                  >Подтвердите пароль</label
                >
                <InputText
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <Button
                  label="Отмена"
                  severity="secondary"
                  @click="cancelChangePassword"
                />
                <Button
                  label="Сохранить"
                  class="bg-(--blue) border-none"
                  @click="savePassword"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.capitalize {
  text-transform: capitalize;
}
</style>
