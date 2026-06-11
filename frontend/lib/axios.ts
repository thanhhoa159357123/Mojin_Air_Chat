import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // 💡 BẮT BUỘC CÓ: Để nó tự động mang theo bánh quy HttpOnly gửi lên Server
  withCredentials: true,
});

// Hàng đợi để tránh gọi API Refresh nhiều lần cùng lúc
let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// TRẠM GÁC LƯỢT ĐI: Tự động móc AccessToken từ RAM nhét vào Header
axiosClient.interceptors.request.use((config) => {
  // Lấy thẳng từ RAM của Zustand
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TRẠM GÁC LƯỢT VỀ: Xử lý sự cố 401 (Chống giật UI)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu mã lỗi là 401 (Hết hạn Token) và request này CHƯA TỪNG được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua đường dẫn /login và /refresh để tránh lặp vô hạn
      if (originalRequest.url.includes("/login") || originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang có khứa khác đi lấy Token rồi, xếp hàng chờ đi em!
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
        console.log("🛰️ [Silent Refresh] Đang âm thầm đi lấy Token mới...");
        // Gọi thẳng bằng axios thường (để không dính cái interceptor này)
        const res = await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access_token;
        
        // 1. Cập nhật Token mới toanh vào RAM
        useAuthStore.setState({ accessToken: newAccessToken });
        
        // 2. Thả cửa cho hàng đợi đi tiếp
        processQueue(null, newAccessToken);
        
        // 3. Hồi sinh cái request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Toang hẳn, RefreshToken cũng chết -> Đuổi cổ ra trang Login
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;