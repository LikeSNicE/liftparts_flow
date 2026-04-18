import { statusOptionsData } from "@/data/statusOptionsData";


// Получить отображаемое название статуса
export const getStatusLabel = (status: string) => {
  const option = statusOptionsData.find((s) => s.value === status);
  return option ? option.label : status;
};
