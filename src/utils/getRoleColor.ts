import { roleEmployeeOptions } from "@/data/roleEmployeeData";

export const getRoleColor = (role: string) => {
  const option = roleEmployeeOptions.find((r) => r.value === role);
  return option?.color || "bg-gray-100 text-gray-700";
};
