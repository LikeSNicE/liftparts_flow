import { defineStore } from "pinia";
import { api } from "@/service/apiInstance";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { type userRegisterPayload, type UserRole } from "@/types/UserTypes";

export const useRegisterStore = defineStore("register", () => {
  const email = ref("");
  const username = ref("");
  const lastname = ref("");
  const userrole = ref<UserRole>("mechanic");
  const password = ref("");

  const roles = [
    { label: "Механик", value: "mechanic" },
    { label: "Администратор", value: "admin" },
    { label: "Складской оператор", value: "warehouse_operator" },
  ];

  const router = useRouter();

  const reset = () => {
    email.value = "";
    username.value = "";
    lastname.value = "";
    userrole.value = "mechanic";
    password.value = "";
  };

  const registerUser = async () => {
    const userPayload: userRegisterPayload = {
      email: email.value,
      username: username.value,
      lastname: lastname.value,
      userrole: userrole.value,
      password: password.value,
    };

    try {
      const { status, statusText } = await api.post("/register", userPayload);

      if (status === 200 || status === 201) {
        reset();
        await router.push("/auth/login");
      } else {
        console.log(`${status} ${statusText}`);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(errorMessage.message);
    }
  };

  return {
    email,
    username,
    lastname,
    userrole,
    password,
    roles,

    registerUser,
  };
});
