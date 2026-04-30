import { createOptionHelpers } from "./optionMappers";
import { statusEmployeeOptionsData } from "@/data/statusEmployeeData";
import { roleEmployeeOptionsData } from "@/data/roleEmployeeData";
import { warehouseStatusPartData } from "@/data/warehouseTableData";
import { statusOptionsData } from "@/data/statusOptionsData";
import { urgencyOptions } from "@/data/urgencyOptionsData";



// Employee helpers
export const employeeStatusHelpers = createOptionHelpers(statusEmployeeOptionsData);
export const getEmployeeStatus = employeeStatusHelpers.getLabel;
export const getEmployeeColor = employeeStatusHelpers.getColor;

// Role helpers
export const roleHelpers = createOptionHelpers(roleEmployeeOptionsData);
export const getRoleLabel = roleHelpers.getLabel;
export const getRoleColor = roleHelpers.getColor;

// Part helpers
export const partHelpers = createOptionHelpers(warehouseStatusPartData);
export const getPartStatus = partHelpers.getLabel;
export const getPartColor = partHelpers.getColor;

// Status helpers (general)
export const statusHelpers = createOptionHelpers(statusOptionsData);
export const getStatusLabel = statusHelpers.getLabel;
export const getStatusColor = statusHelpers.getColor;

// Urgency helpers
export const urgencyHelpers = createOptionHelpers(urgencyOptions);
export const getUrgencyLabel = urgencyHelpers.getLabel;
export const getUrgencyColor = urgencyHelpers.getColor;
