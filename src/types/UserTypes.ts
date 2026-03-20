export interface User {
  id: number;
  username: string;
  lastname: string;
  email: string;
  userrole: string;
  password: string;
}

export type userRegisterPayload = Omit<User, "id">;
