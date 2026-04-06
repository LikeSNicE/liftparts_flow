import { defineStore } from "pinia";
import { api } from "@/service/apiInstance";
import { ref } from "vue";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Part } from "@/types/PartsTypes";

export const usePartsStore = defineStore("parts", () => {
  const partsList = ref<Part[]>([]);

  const getParts = async () => {
    try {
      const { data } = await api.get<Part[]>("/parts");
      partsList.value = data;
      console.log("Детали успешно загружены:", data);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Ошибка при загрузке деталей:", errorMessage);
      throw new Error(
        "Не удалось загрузить детали. Пожалуйста, попробуйте позже.",
      );
    }
  };

  const updatePart = async (id: number, part: Partial<Part>) => {
    try {
      const { data } = await api.patch<Part>(`/parts/${id}`, part);

      // Обновляем локальный список после успешного обновления на сервере
      const index = partsList.value.findIndex((p) => p.id === id);

      if (index !== -1) {
        partsList.value[index] = data;
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Ошибка при обновлении детали:", errorMessage);
      throw new Error(
        "Не удалось обновить деталь. Пожалуйста, попробуйте позже.",
      );
    }
  };

  return {
    partsList,
    getParts,
    updatePart,
  };
});
