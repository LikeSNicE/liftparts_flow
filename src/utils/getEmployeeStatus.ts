import { statusEmployeeOptions } from "@/data/statusEmployeeData";

export const getEmployeeStatus = (status: string) => {
  const option = statusEmployeeOptions.find(opt => opt.value === status);
  return option ? option.label : status;
}
