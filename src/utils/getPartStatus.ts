import { warehouseStatusPart } from "@/data/warehouseTableData";

export const getPartStatus = (status: string) => {
  const option = warehouseStatusPart.find((opt) => opt.value === status);
  return option ? option.label : status;
};

