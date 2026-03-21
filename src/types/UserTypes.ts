export interface UserI {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  password: string;
}

// Основная роль - mechanic, остальные (admin, warehouse_operator) добавляются через БД
export type UserRole = "mechanic" | "admin" | "warehouse_operator";

export type User = Omit<UserI, "password">;
export type userRegisterPayload = Omit<UserI, "id">;

// Статусы сотрудников
export type EmployeeStatus = "at_work" | "remote" | "break" | "vacation" | "inactive";

export interface Employee {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  status: EmployeeStatus;
}

// Расширенные данные профиля
export interface UserProfile {
  id: number;
  username: string;
  lastname: string;
  email: string;
  phone?: string;
  avatar?: string;
  userrole: UserRole;
  createdAt?: string;
  lastLogin?: string;
}

// Настройки уведомлений
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newRequests: boolean;
  orderStatus: boolean;
}

// 2FA настройки
export interface TwoFASettings {
  enabled: boolean;
  secret?: string;
  qrCode?: string;
}
