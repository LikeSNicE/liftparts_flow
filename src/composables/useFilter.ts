import { ref } from "vue";

export const useFilter = () => {
  const searchQuery = ref("");
  const selectedStatus = ref("");

  return { searchQuery, selectedStatus };
};
