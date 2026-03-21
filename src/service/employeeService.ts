import type { Employee } from "@/types/UserTypes";

/**
 * API сервис для работы с сотрудниками
 * Временно использует заглушки, в будущем будет заменён на реальные API вызовы
 */

// Заглушка: получить всех сотрудников
export const getEmployees = async (): Promise<Employee[]> => {
  // TODO: заменить на реальный API вызов
  // const { data } = await api.get<Employee[]>("/employees");
  // return data;
  return [];
};

// Заглушка: добавить сотрудника
export const createEmployee = async (employee: Omit<Employee, "id">): Promise<Employee> => {
  // TODO: заменить на реальный API вызов
  // const { data } = await api.post<Employee>("/employees", employee);
  // return data;
  return { ...employee, id: Date.now() };
};

// Заглушка: обновить сотрудника
export const updateEmployee = async (id: number, employee: Partial<Employee>): Promise<Employee> => {
  // TODO: заменить на реальный API вызов
  // const { data } = await api.put<Employee>(`/employees/${id}`, employee);
  // return data;
  return { id, ...employee } as Employee;
};

// Заглушка: удалить сотрудника
export const deleteEmployee = async (): Promise<void> => {
  // TODO: заменить на реальный API вызов
  // await api.delete(`/employees/${id}`);
};
