import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/settings/tax";

export const getSettings = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
