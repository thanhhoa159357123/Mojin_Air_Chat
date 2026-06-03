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
import Cookies from "js-cookie";
import { extractErrorMessage } from "@/lib/errorHandler"; // <-- IMPORT THẰNG NÀY VÀO BÁC ƠI
import { useConversationStore } from "./useConversationStore";

const clearConversationState = () => {
  useConversationStore.getState().reset();
  useConversationStore.persist.clearStorage();
  if (typeof window !== "undefined") {
    localStorage.removeItem("mojin-conversation-storage");
  }
};

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
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
          console.log("auth store", res);
          set({
            user: res.user,
            isAuthenticated: true,
            loading: false,
          });
          clearConversationState();
        } catch (error: unknown) {
          // --- SẠCH ĐẸP GỌN GÀNG ---
          const message = extractErrorMessage(
            error,
            "Đăng ký toang rồi bác ơi!",
          );
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
        try {
          const res = await login(data);
          set({
            user: res.user,
            isAuthenticated: true,
            loading: false,
          });
          clearConversationState();
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
        } catch (error: unknown) {
          console.error("Logout API lỗi nhưng vẫn xóa trắng client", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });

          useAuthStore.persist.clearStorage();
          clearConversationState();
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("mojin-auth-storage");
            Cookies.remove("auth_token", { path: "/" });
          }

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      checkAuth: async () => {
        if (
          typeof window !== "undefined" &&
          !localStorage.getItem("auth_token")
        ) {
          set({ user: null, isAuthenticated: false, loading: false });
          useAuthStore.persist.clearStorage();
          clearConversationState();
          if (typeof window !== "undefined") {
            localStorage.removeItem("mojin-auth-storage");
          }
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
        } catch (error: unknown) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
          }
          console.error(
            "Check auth lỗi, có thể token hết hạn hoặc không hợp lệ",
            error,
          );
          set({ user: null, isAuthenticated: false, loading: false });
          useAuthStore.persist.clearStorage();
          clearConversationState();
          if (typeof window !== "undefined") {
            localStorage.removeItem("mojin-auth-storage");
          }
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
