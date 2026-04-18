import { roleEmployeeOptions } from "@/data/roleEmployeeData";


export const getRoleLabel = (role: string) => {
  const option = roleEmployeeOptions.find((r) => r.value === role);
  return option ? option.label : role;  
}
