// types/auth.ts
import { IUpdateProfileInput } from "@/services/authService";
import { z } from "zod";

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string; // Đây là append từ Laravel trả về
  username?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null; // Laravel để là 'avatar'
  bio?: string | null;
  status: "online" | "offline";
  last_active_at?: string; // ISO Date string
}

export interface IAuthRegister {
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface IAuthLogin {
  login: string; // Có thể là email hoặc phone
  password: string;
}

export interface IAuthResponse {
  access_token: string;
  token_type: string;
  user: IUser;
}

export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  register: (data: IAuthRegister) => Promise<void>;
  login: (data: IAuthLogin) => Promise<void>;
  logout: () => Promise<void>;
  // Thêm cái này để lúc F5 trang nó tự nạp lại user từ Token
  checkAuth: () => Promise<void>;

  updateAvatarState: (avatarUrl: string) => void;
  updateProfileState: (updatedUser: IUser) => void;

  updateProfile: (data: IUpdateProfileInput) => Promise<void>;
}

// Schema cho Đăng ký
export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, "Họ không được để trống"),
    last_name: z.string().trim().min(1, "Tên không được để trống"),
    username: z
      .string()
      .min(3, "Username ít nhất 3 ký tự")
      .optional()
      .or(z.literal("")),
    email: z.string().email("Email không hợp lệ"),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["password_confirmation"],
  });

// Schema cho Đăng nhập
export const loginSchema = z.object({
  login: z.string().min(1, "Vui lòng nhập Email hoặc Username"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});
