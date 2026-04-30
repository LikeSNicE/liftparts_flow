export interface UserI {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  password?: string;
  middlename?: string;
  status: EmployeeStatus;
}

// Основная роль - mechanic, остальные (admin, warehouse_operator) добавляются через БД
export type UserRole = "mechanic" | "admin" | "warehouse_operator";

// export type User = Omit<UserI, "password">;

export type userRegisterPayload = Omit<UserI, "id" | "lastLogin">;

// Статусы сотрудников
export type EmployeeStatus =
  | "at_work"
  | "remote"
  | "break"
  | "vacation"
  | "inactive";

export interface Employee extends UserI {
  phone?: string;
  avatar?: string;
}

export type EmployeeForm = Omit<Employee, "id" >;

