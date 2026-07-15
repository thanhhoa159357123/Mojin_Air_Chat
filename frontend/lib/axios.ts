/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // 💡 Đmax ĐÃ XÓA withCredentials: true. Đéo thèm chơi với Cookie chéo domain!
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// TRẠM GÁC LƯỢT ĐI: Tự động móc AccessToken từ Zustand nhét vào Header
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TRẠM GÁC LƯỢT VỀ: Xử lý sự cố 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("/login") || originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🛰️ [Silent Refresh] Đang âm thầm đi lấy Token mới qua Body JSON...");
        const currentRefreshToken = useAuthStore.getState().refreshToken;
        
        if (!currentRefreshToken) throw new Error("Không có Refresh Token");

        // Gọi thẳng endpoint /refresh bằng instance axios thường, ném token vào body
        const res = await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh`,
          { refresh_token: currentRefreshToken },
          { headers: { "Content-Type": "application/json", Accept: "application/json" } }
        );

        const newAccessToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;
        
        // 1. Ghi đè cập nhật cặp Token mới toanh vào Zustand
        useAuthStore.setState({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        
        // 2. Thông báo thông tuyến cho hàng đợi
        processQueue(null, newAccessToken);
        
        // 3. Hồi sinh request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Hết thuốc chữa -> Xóa sạch RAM & Ổ cứng -> Đá về login
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;