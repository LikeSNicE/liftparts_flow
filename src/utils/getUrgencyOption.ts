import { urgencyOptions } from "@/data/urgencyOptionsData";

export const getUrgencyColor = (urgency: string) => {
  const option = urgencyOptions.find((opt) => opt.value === urgency);
  console.log("getUrgencyColor: ", urgency, option);
  return option?.color || "bg-gray-100 text-gray-700";
};
