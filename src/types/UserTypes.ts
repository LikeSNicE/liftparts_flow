export interface UserI {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  password: string;
  middlename?: string;
  status: EmployeeStatus;
}

// Основная роль - mechanic, остальные (admin, warehouse_operator) добавляются через БД
export type UserRole = "mechanic" | "admin" | "warehouse_operator";

export type User = Omit<UserI, "password">;
export type userRegisterPayload = Omit<UserI, "id">;

// Статусы сотрудников
export type EmployeeStatus =
  | "at_work"
  | "remote"
  | "break"
  | "vacation"
  | "inactive";

export interface Employee extends User {
  phone?: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

export type EmployeeForm = Omit<User, "id">;

// Расширенные данные профиля

// ? Настройки уведомлений
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newRequests: boolean;
  orderStatus: boolean;
}

// ? 2FA настройки
export interface TwoFASettings {
  enabled: boolean;
  secret?: string;
  qrCode?: string;
}
