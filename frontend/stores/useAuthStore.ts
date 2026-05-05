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
import { createJSONStorage, persist } from "zustand/middleware";
import { login, logout, register } from "../services/authService";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      register: async (data: IAuthRegister) => {
        // 1. Chốt hạ bằng Zod trước khi bắn API
        const validation = registerSchema.safeParse(data);

        if (!validation.success) {
          // Lấy cái lỗi đầu tiên cho nó gọn
          const firstError = validation.error.issues[0].message;
          set({ error: firstError, loading: false });
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await register(data);
          console.log("auth soter", res)
          set({
            user: res.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Đăng ký toang rồi bác ơi!";
          set({ error: message, loading: false });
          throw error;
        }
      },

      login: async (data: IAuthLogin) => {
        // 2. Soi lỗi login luôn
        const validation = loginSchema.safeParse(data);

        if (!validation.success) {
          set({ error: validation.error.issues[0].message, loading: false });
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await login(data);
          set({
            user: res.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Sai pass hay gì rồi!";
          set({ error: message, loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await logout();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: "Lỗi khi đăng xuất, Token chắc có vấn đề!",
            loading: false,
          });
        }
      },

      checkAuth: async () => {
        if (
          typeof window !== "undefined" &&
          !localStorage.getItem("auth_token")
        ) {
          return;
        }

        set({ loading: true });
        try {
          const response = await axiosClient.get<IUser>("/user");
          set({
            user: response.data,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
          }
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },
    }),
    {
      name: "mojin-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
