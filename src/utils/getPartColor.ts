import { warehouseStatusPart } from "@/data/warehouseTableData";

export const getPartColor = (status: string) => {
  const option = warehouseStatusPart.find(opt => opt.value === status);
  return option ? option.color : "";
}
