import { urgencyOptions } from "@/data/partsRequestData";
export const getUrgencyLabel = (status: string) => {
  const option = urgencyOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};
