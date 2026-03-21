<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "primevue";
import { InputText } from "primevue";
import { InputSwitch } from "primevue";
import { FileUpload } from "primevue";
import type { UserProfile, NotificationSettings, TwoFASettings } from "@/types/UserTypes";
import { useUserStore } from "@/stores/useUserStore";

const userStore = useUserStore();

// Активная вкладка
const activeTab = ref<"profile" | "security" | "notifications">("profile");

// Данные пользователя
const userData = computed(() => userStore.userData);

// Загруженный аватар
const avatarPreview = ref<string | null>(null);

// Форма профиля
const profileForm = ref<UserProfile>({
  id: 0,
  username: "",
  lastname: "",
  email: "",
  phone: "",
  avatar: "",
  userrole: "mechanic",
});

// Форма смены пароля
const isChangingPassword = ref(false);
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordError = ref("");
const passwordSuccess = ref("");

// 2FA настройки
const twoFA = ref<TwoFASettings>({
  enabled: false,
});
const twoFACode = ref("");
const twoFAError = ref("");
const twoFASuccess = ref("");
const showTwoFASetup = ref(false);
const twoFASecret = ref("");
const twoFAQRCode = ref("");

// Настройки уведомлений
const notifications = ref<NotificationSettings>({
  emailNotifications: true,
  pushNotifications: true,
  newRequests: true,
  orderStatus: true,
});

// Инициализация формы при загрузке
const initProfileForm = () => {
  if (userData.value) {
    profileForm.value = {
      id: userData.value.id,
      username: userData.value.username,
      lastname: userData.value.lastname || "",
      email: userData.value.email,
      phone: "",
      avatar: "",
      userrole: userData.value.userrole,
    };
  }
};

onMounted(() => {
  initProfileForm();
});

// Сохранить изменения профиля
const saveProfile = () => {
  // TODO: API вызов для обновления профиля
  console.log("Сохранение профиля:", profileForm.value);
  alert("Профиль успешно обновлён!");
};

// Загрузка аватара
const onAvatarUpload = (event: any) => {
  const file = event.files[0];
  const reader = new FileReader();
  reader.onload = (e: any) => {
    avatarPreview.value = e.target.result;
    profileForm.value.avatar = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Смена пароля
const startChangePassword = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  passwordError.value = "";
  passwordSuccess.value = "";
  isChangingPassword.value = true;
};

const savePassword = () => {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "Новые пароли не совпадают";
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = "Пароль должен быть не менее 6 символов";
    return;
  }

  // TODO: API вызов для смены пароля
  console.log("Смена пароля:", passwordForm.value);
  passwordSuccess.value = "Пароль успешно изменён";
  isChangingPassword.value = false;
};

const cancelChangePassword = () => {
  isChangingPassword.value = false;
  passwordError.value = "";
  passwordSuccess.value = "";
};

// 2FA функции
const enableTwoFA = () => {
  // TODO: API вызов для получения QR-кода
  twoFASecret.value = "JBSWY3DPEHPK3PXP";
  twoFAQRCode.value = "https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/LiftPartsFlow:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=LiftPartsFlow&size=200x200";
  showTwoFASetup.value = true;
  twoFAError.value = "";
};

const confirmTwoFA = () => {
  // TODO: API вызов для подтверждения 2FA
  if (twoFACode.value.length === 6) {
    twoFA.value.enabled = true;
    twoFASuccess.value = "2FA успешно включена";
    showTwoFASetup.value = false;
    twoFACode.value = "";
  } else {
    twoFAError.value = "Неверный код";
  }
};

const disableTwoFA = () => {
  // TODO: API вызов для отключения 2FA
  twoFA.value.enabled = false;
  twoFASuccess.value = "2FA отключена";
  twoFACode.value = "";
};

const cancelTwoFASetup = () => {
  showTwoFASetup.value = false;
  twoFAError.value = "";
  twoFASecret.value = "";
  twoFAQRCode.value = "";
};

// Сохранение настроек уведомлений
const saveNotificationSettings = () => {
  // TODO: API вызов для сохранения настроек
  console.log("Настройки уведомлений:", notifications.value);
  alert("Настройки уведомлений сохранены!");
};
</script>

<template>
  <div class="settings-page">
    <h1 class="text-2xl font-bold text-(--title) mb-6">Настройки</h1>

    <!-- Вкладки -->
    <div class="flex gap-2 mb-6 border-b border-(--border)">
      <button
        @click="activeTab = 'profile'"
        class="px-4 py-2 font-medium transition-colors border-b-2"
        :class="activeTab === 'profile' ? 'text-(--blue) border-(--blue)' : 'text-(--placeholder) border-transparent hover:text-(--text)'"
      >
        <i class="pi pi-user mr-2"></i>
        Профиль
      </button>
      <button
        @click="activeTab = 'security'"
        class="px-4 py-2 font-medium transition-colors border-b-2"
        :class="activeTab === 'security' ? 'text-(--blue) border-(--blue)' : 'text-(--placeholder) border-transparent hover:text-(--text)'"
      >
        <i class="pi pi-shield mr-2"></i>
        Безопасность
      </button>
      <button
        @click="activeTab = 'notifications'"
        class="px-4 py-2 font-medium transition-colors border-b-2"
        :class="activeTab === 'notifications' ? 'text-(--blue) border-(--blue)' : 'text-(--placeholder) border-transparent hover:text-(--text)'"
      >
        <i class="pi pi-bell mr-2"></i>
        Уведомления
      </button>
    </div>

    <!-- Вкладка: Профиль -->
    <div v-if="activeTab === 'profile'" class="settings-content">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Аватар -->
        <div class="md:col-span-1">
          <div class="settings-card bg-white rounded-lg border border-(--border) p-6">
            <h2 class="text-lg font-semibold text-(--title) mb-4">Фото профиля</h2>
            
            <div class="flex flex-col items-center gap-4">
              <div class="avatar-container w-32 h-32 rounded-full bg-(--bg) flex items-center justify-center overflow-hidden border-2 border-(--border)">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <i v-else class="pi pi-user text-4xl text-(--placeholder)"></i>
              </div>
              
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                :max-file-size="1000000"
                @select="onAvatarUpload"
                label="Загрузить фото"
                class="w-full"
              />
              
              <p class="text-xs text-(--placeholder) text-center">
                JPG, PNG до 1MB
              </p>
            </div>
          </div>

          <!-- Информация о роли -->
          <div class="settings-card bg-white rounded-lg border border-(--border) p-6 mt-6">
            <h2 class="text-lg font-semibold text-(--title) mb-4">Информация</h2>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-(--placeholder) uppercase">Роль</label>
                <p class="text-(--text) font-medium capitalize">{{ userData?.userrole }}</p>
              </div>
              <div>
                <label class="text-xs text-(--placeholder) uppercase">Дата регистрации</label>
                <p class="text-(--text) font-medium">—</p>
              </div>
              <div>
                <label class="text-xs text-(--placeholder) uppercase">Последний вход</label>
                <p class="text-(--text) font-medium">—</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма профиля -->
        <div class="md:col-span-2">
          <div class="settings-card bg-white rounded-lg border border-(--border) p-6">
            <h2 class="text-lg font-semibold text-(--title) mb-4">Личная информация</h2>
            
            <div class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="flex flex-col gap-2">
                  <label for="username" class="text-sm text-(--text)">ФИО</label>
                  <InputText
                    id="username"
                    v-model="profileForm.username"
                    class="w-full"
                    placeholder="Иванов Иван"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="lastname" class="text-sm text-(--text)">Фамилия</label>
                  <InputText
                    id="lastname"
                    v-model="profileForm.lastname"
                    class="w-full"
                    placeholder="Иванов"
                  />
                </div>
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
                <InputText
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="w-full"
                  placeholder="+7 (___) ___-__-__"
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
      </div>
    </div>

    <!-- Вкладка: Безопасность -->
    <div v-if="activeTab === 'security'" class="settings-content">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Смена пароля -->
        <div class="settings-card bg-white rounded-lg border border-(--border) p-6">
          <h2 class="text-lg font-semibold text-(--title) mb-4">Смена пароля</h2>
          
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

              <div class="flex flex-col gap-2">
                <label for="current-password" class="text-sm text-(--text)">Текущий пароль</label>
                <InputText
                  id="current-password"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="new-password" class="text-sm text-(--text)">Новый пароль</label>
                <InputText
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="confirm-password" class="text-sm text-(--text)">Подтвердите пароль</label>
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

        <!-- 2FA -->
        <div class="settings-card bg-white rounded-lg border border-(--border) p-6">
          <h2 class="text-lg font-semibold text-(--title) mb-4">Двухфакторная аутентификация</h2>
          
          <template v-if="!twoFA.enabled">
            <p class="text-(--placeholder) text-sm mb-4">
              Защитите свой аккаунт с помощью двухфакторной аутентификации
            </p>
            
            <template v-if="!showTwoFASetup">
              <Button
                label="Включить 2FA"
                icon="pi pi-shield"
                class="bg-(--blue) border-none"
                @click="enableTwoFA"
              />
            </template>

            <template v-else>
              <div class="space-y-4">
                <div
                  v-if="twoFAError"
                  class="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200"
                >
                  <i class="pi pi-exclamation-circle mr-2"></i>
                  {{ twoFAError }}
                </div>

                <div class="flex flex-col items-center gap-4">
                  <p class="text-sm text-(--text) text-center">
                    Отсканируйте QR-код в приложении аутентификации
                  </p>
                  <img
                    :src="twoFAQRCode"
                    alt="QR Code"
                    class="w-48 h-48 border rounded-lg"
                  />
                  <p class="text-xs text-(--placeholder) font-mono">
                    {{ twoFASecret }}
                  </p>
                </div>

                <div class="flex flex-col gap-2">
                  <label for="twoFA-code" class="text-sm text-(--text)">Код из приложения</label>
                  <InputText
                    id="twoFA-code"
                    v-model="twoFACode"
                    type="text"
                    class="w-full"
                    placeholder="123456"
                    maxlength="6"
                  />
                </div>

                <div class="flex justify-end gap-2 pt-2">
                  <Button
                    label="Отмена"
                    severity="secondary"
                    @click="cancelTwoFASetup"
                  />
                  <Button
                    label="Подтвердить"
                    class="bg-(--blue) border-none"
                    @click="confirmTwoFA"
                  />
                </div>
              </div>
            </template>
          </template>

          <template v-else>
            <div class="flex items-center gap-3 mb-4">
              <i class="pi pi-check-circle text-green-500 text-2xl"></i>
              <div>
                <p class="font-medium text-(--title)">2FA включена</p>
                <p class="text-sm text-(--placeholder)">Ваш аккаунт защищён</p>
              </div>
            </div>
            <Button
              label="Отключить 2FA"
              icon="pi pi-shield"
              severity="danger"
              text
              @click="disableTwoFA"
            />
          </template>

          <div
            v-if="twoFASuccess"
            class="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm border border-green-200 mt-4"
          >
            <i class="pi pi-check-circle mr-2"></i>
            {{ twoFASuccess }}
          </div>
        </div>
      </div>
    </div>

    <!-- Вкладка: Уведомления -->
    <div v-if="activeTab === 'notifications'" class="settings-content">
      <div class="settings-card bg-white rounded-lg border border-(--border) p-6 max-w-2xl">
        <h2 class="text-lg font-semibold text-(--title) mb-4">Настройки уведомлений</h2>
        
        <div class="space-y-4">
          <div
            v-if="notifications.emailNotifications || notifications.pushNotifications"
            class="bg-(--blue-bg) text-(--blue) px-4 py-3 rounded-lg text-sm border border-(--blue)"
          >
            <i class="pi pi-info-circle mr-2"></i>
            Настройте какие уведомления вы хотите получать
          </div>

          <!-- Общие настройки -->
          <div class="border-b border-(--border) pb-4">
            <h3 class="font-medium text-(--title) mb-3">Общие</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-(--text)">Email-уведомления</p>
                  <p class="text-xs text-(--placeholder)">Получать уведомления на почту</p>
                </div>
                <InputSwitch
                  v-model="notifications.emailNotifications"
                  class="ml-4"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-(--text)">Push-уведомления</p>
                  <p class="text-xs text-(--placeholder)">Получать push-уведомления в браузере</p>
                </div>
                <InputSwitch
                  v-model="notifications.pushNotifications"
                  class="ml-4"
                />
              </div>
            </div>
          </div>

          <!-- Типы уведомлений -->
          <div class="pb-4">
            <h3 class="font-medium text-(--title) mb-3">Типы уведомлений</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-(--text)">О новых заявках</p>
                  <p class="text-xs text-(--placeholder)">Уведомлять о поступлении новых заявок</p>
                </div>
                <InputSwitch
                  v-model="notifications.newRequests"
                  class="ml-4"
                  :disabled="!notifications.emailNotifications && !notifications.pushNotifications"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-(--text)">О статусе заказов</p>
                  <p class="text-xs text-(--placeholder)">Уведомлять об изменении статуса заказов</p>
                </div>
                <InputSwitch
                  v-model="notifications.orderStatus"
                  class="ml-4"
                  :disabled="!notifications.emailNotifications && !notifications.pushNotifications"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button
              label="Сохранить настройки"
              class="bg-(--blue) border-none"
              @click="saveNotificationSettings"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 2rem;
}

.settings-content {
  max-width: 1200px;
}

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
