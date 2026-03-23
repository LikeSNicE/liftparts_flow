import { defineStore } from "pinia";
import { ref } from "vue";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { api } from "@/service/apiInstance";
import type { EmployeeForm, Employee } from "@/types/UserTypes";

export const useEmployeeStore = defineStore("employee", () => {
  const employeeList = ref<Employee[]>([]);

  const getEmployees = async () => {
    try {
      const { data } = await api.get<Employee[]>("/users");
      employeeList.value = data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
    }
  };

  const updateEmployee = async (id: number, payload: EmployeeForm) => {
    try {
      const { data } = await api.patch(`/users/${id}`, payload);

      // Обновляем локальный список после успешного обновления на сервере
      const index = employeeList.value.findIndex((emp) => emp.id === id);
      if (index !== -1) {
        employeeList.value[index] = data;
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      employeeList.value = employeeList.value.filter((emp) => emp.id !== id);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage);
    }
  };

  return {
    employeeList,
    getEmployees,
    updateEmployee,
    deleteEmployee,
  };
});
