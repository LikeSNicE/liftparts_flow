import { statusEmployeeOptions } from "@/data/statusEmployeeData";

export const getEmployeeColor = (status: string) => {
  const option = statusEmployeeOptions.find((opt) => opt.value === status);
  return option ? option.color : "bg-gray-100 text-gray-700";
};
