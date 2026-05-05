import axios from "axios";

const axiosClient = axios.create({
  // Nhớ để đúng cổng 8000 của Laravel bác nhé
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// "Trạm thu phí" - Tự động đính kèm Token vào Header mỗi khi call API
axiosClient.interceptors.request.use((config) => {
  // Tạm thời lấy từ localStorage theo luồng Bearer Token anh em mình bàn
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi tập trung - Nhất là lỗi 401 (Hết hạn token) hoặc 422 (Validation)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu Token "toang", bác có thể xử lý logout hoặc đá về trang login ở đây
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
