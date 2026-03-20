import axios from "axios";

// Ошибки разного вида
// throw new Error('test') // Native JS Error
// throw 'Ошибка string' // String Error;
// throw { message: 'Ошибка объекта' } // object error
// Promise.reject({ message: 'test object error' }) // object error
// throw null // fallback


interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

type ApiResponseDataError = {
  message: string;
};

export const getErrorMessage = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    console.log("isAxiosError: ", error);

    const status = error.response?.status;
    const data: ApiResponseDataError = error.response?.data;

    if (status === 400) {
      return {
        message: data?.message ?? "Плохой запрос",
        status,
        code: "BAD_REQUEST",
      };
    } else if (status === 401) {
      return {
        message: data?.message ?? "Сессия истекла. Пожалуйста, войдите снова.",
        status,
        code: "UNAUTHORIZED",
      };
    } else if (status === 403) {
      return {
        message: data?.message ?? "Доступ закрыт",
        status,
        code: "FORBIDDEN",
      };
    } else if (status === 404) {
      return {
        message: data?.message ?? "Not found",
        status,
        code: "NOT_FOUND",
      };
    } else if (status === 500) {
      return {
        message: data?.message ?? "Internal server error",
        status,
        code: "INTERNAL_SERVER_ERROR",
      };
    } else if (status === 503) {
      return {
        message: data?.message ?? "Service unavailable",
        status,
        code: "SERVICE_UNAVAILABLE",
      };
    }
  }
  // Native JS Error (object)
  if (error instanceof Error) {
    console.log("instanceof Error: ", error);
    return {
      message: error.message,
    };
  }
  // String error
  if (typeof error === "string") {
    console.log("string Error: ", error);
    return {
      message: error,
    };
  }

  // ukknown object error
  if (error && typeof error === "object" && "message" in error) {
    console.log("object Error: ", error);
    return {
      message: String((error as { message: unknown }).message),
    };
  }

  // Fallback
  return {
    message: "Произошла непредвиденная ошибка",
  };
};
