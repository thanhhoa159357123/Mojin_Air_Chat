import axiosClient from "@/lib/axios";
import {
  IAuthLogin,
  IAuthRegister,
  IAuthState,
  IUser,
  loginSchema,
  registerSchema,
} from "@/types/auth";
import { create } from "zustand";
import {
  IUpdateProfileInput,
  login,
  logout,
  register,
  updateProfile,
} from "../services/authService";
import { extractErrorMessage } from "@/lib/errorHandler"; // <-- IMPORT THẰNG NÀY VÀO BÁC ƠI
import { useConversationStore } from "./useConversationStore";
import { updateUserStatus } from "@/services/conversationService";

const clearConversationState = () => {
  useConversationStore.getState().reset();
  useConversationStore.persist.clearStorage();
  if (typeof window !== "undefined") {
    localStorage.removeItem("mojin-conversation-storage");
  }
};

export const useAuthStore = create<IAuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  register: async (data: IAuthRegister) => {
    const validation = registerSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      set({ error: firstError, loading: false });
      throw new Error(firstError);
    }

    set({ loading: true, error: null });
    try {
      const res = await register(data);
      clearConversationState();
      set({
        user: res.user,
        accessToken: res.access_token, // 💡 Lưu token vào RAM
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: unknown) {
      // --- SẠCH ĐẸP GỌN GÀNG ---
      const message = extractErrorMessage(error, "Đăng ký toang rồi bác ơi!");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  login: async (data: IAuthLogin) => {
    const validation = loginSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      set({ error: firstError, loading: false });
      throw new Error(firstError);
    }

    set({ loading: true, error: null });
    clearConversationState();
    try {
      const res = await login(data);
      set({
        user: res.user,
        accessToken: res.access_token, // 💡 Lưu token vào RAM
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: unknown) {
      // --- SẠCH ĐẸP GỌN GÀNG ---
      const message = extractErrorMessage(error, "Sai pass hay gì rồi!");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logout();
    } catch (error) {
      console.error("Logout API lỗi nhưng vẫn xóa trắng client", error);
    } finally {
      // 💡 Xóa trắng RAM, đéo còn dính dáng gì ổ cứng
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      clearConversationState();
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      // 💡 F5 trang -> Mất AccessToken -> Gọi API này -> Axios Interceptor sẽ tự âm thầm đi Refresh ngầm để cứu giá!
      const response = await axiosClient.get<IUser>("/user");

      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error("Check auth toang, user đã mất tích quá 7 ngày", error);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
      });
      clearConversationState();
    }
  },

  updateAvatarState: (avatarUrl: string) => {
    set((state) => {
      // Nếu có user đang đăng nhập thì mới tiến hành đè data
      if (state.user) {
        return {
          user: {
            ...state.user,
            avatar: avatarUrl, // Ghi đè link ảnh mới từ Cloudinary dội về
          },
        };
      }
      return {};
    });
  },

  updateProfileState: (updatedUser: IUser) => {
    set((state) => {
      if (state.user) {
        return {
          user: {
            ...state.user,
            ...updatedUser,
          },
        };
      }
      return {};
    });
  },

  // 💡 HÀM THỰC THI GỌI API BỊ THIẾU
  updateProfile: async (data: IUpdateProfileInput) => {
    set({ loading: true, error: null });
    try {
      const res = await updateProfile(data); // Gọi axios.put

      // Thành công thì bốc cục res.user ném vào hàm cập nhật RAM
      set((state) => {
        if (state.user) {
          return {
            user: { ...state.user, ...res.user },
            loading: false,
          };
        }
        return { loading: false };
      });
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Lưu thông tin toang rồi!");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));
