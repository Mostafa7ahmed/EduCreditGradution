import axios from "axios";
import { baseUrl } from "./../Env/Env";

const loginStudent = async (values) => {
  try {
    const response = await axios.post(`${baseUrl}/Account/login`, values, {
      headers: { "Content-Type": "application/json" },
    });

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error) {
    console.error("Login failed", error.response);
    throw error.response?.data?.errorMessage || "Login failed";
  }
};

export default { loginStudent };
