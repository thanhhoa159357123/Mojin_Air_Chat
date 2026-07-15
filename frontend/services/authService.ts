import axiosClient from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { IAuthLogin, IAuthRegister, IAuthResponse } from "@/types/auth";

export interface IUpdateProfileInput {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

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
    // 💡 BỐC REFRESH TOKEN GỬI KÈM LÊN ĐỂ BACKEND XÓA SẠCH DẤU VẾT
    const refreshToken = useAuthStore.getState().refreshToken;
    await axiosClient.post("/logout", { refresh_token: refreshToken });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    throw error;
  }
};

export const updateProfile = async (data: IUpdateProfileInput) => {
  // 🚀 Chạy PUT thuần JSON, không sợ bị nuốt dữ liệu
  const response = await axiosClient.put("/user/update-information", data);
  return response.data;
};

