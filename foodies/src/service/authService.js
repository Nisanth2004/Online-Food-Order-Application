import api from "./CustomAxiosInstance";
export const login = async (data) => {
  try {
    return await api.post("/api/login", data); // ✅ return full response
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    return await api.post("/api/register", data); // ✅ return full response
  } catch (error) {
    throw error;
  }
};

