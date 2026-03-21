export interface UserI {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: UserRole;
  password: string;
}

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
