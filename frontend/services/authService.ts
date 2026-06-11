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
    await axiosClient.post("/logout");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw error;
  }
};
