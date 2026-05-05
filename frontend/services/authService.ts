import axiosClient from "@/lib/axios";
import { IAuthLogin, IAuthRegister, IAuthResponse } from "@/types/auth";
import Cookies from "js-cookie"; // Import hàng về bác ơi

/**
 * Service xử lý đăng ký thành viên
 */
export const register = async (data: IAuthRegister): Promise<IAuthResponse> => {
  try {
    // Bác nhớ thêm cái Generic <IAuthResponse> vào sau hàm post để nó hiểu data trả về là gì
    const response = await axiosClient.post<IAuthResponse>("/register", data);

    const { access_token } = response.data;

    if (typeof window !== "undefined") {
      // Lưu vào Cookie để Middleware (Server) có thể đọc được
      Cookies.set("auth_token", access_token, {
        expires: 7, // 7 ngày cho máu
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Vẫn giữ ở localStorage nếu bác muốn dùng cho các logic khác ở Client
      localStorage.setItem("auth_token", access_token);
    }

    // QUAN TRỌNG: Phải return cái response.data này về thì Store mới có cái mà xài
    return response.data;
  } catch (error) {
    console.error("Đăng ký toang:", error);
    throw error;
  }
};

/**
 * Service xử lý đăng nhập
 */
export const login = async (data: IAuthLogin): Promise<IAuthResponse> => {
  try {
    const response = await axiosClient.post<IAuthResponse>("/login", data);
    const { access_token } = response.data;

    if (typeof window !== "undefined") {
      // Lưu vào Cookie để Middleware (Server) có thể đọc được
      Cookies.set("auth_token", access_token, {
        expires: 7, // 7 ngày cho máu
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Vẫn giữ ở localStorage nếu bác muốn dùng cho các logic khác ở Client
      localStorage.setItem("auth_token", access_token);
    }
    return response.data;
  } catch (error) {
    console.error(
      "Đăng nhập thất bại, check lại tài khoản mật khẩu nhé:",
      error,
    );
    throw error;
  }
};

/**
 * Service xử lý đăng xuất
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosClient.post("/auth/logout");

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw error;
  }
};
