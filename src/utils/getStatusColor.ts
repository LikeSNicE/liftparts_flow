import { statusOptionsData } from "@/data/statusOptionsData";

// Получить цвет статуса
export const getStatusColor = (status: string) => {
  const option = statusOptionsData.find((s) => s.value === status);
  return option?.color || "bg-gray-100 text-gray-700";
};
