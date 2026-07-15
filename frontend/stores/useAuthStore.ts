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
import { persist, createJSONStorage } from "zustand/middleware"; // 🌟 BẢO BỐI GIỮ TOKEN QUA F5
import {
  IUpdateProfileInput,
  login,
  logout,
  register,
  updateProfile,
} from "../services/authService";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useConversationStore } from "./useConversationStore";
import { cryptoStorage } from "@/lib/crypto";

const clearConversationState = () => {
  useConversationStore.getState().reset();
  useConversationStore.persist.clearStorage();
  if (typeof window !== "undefined") {
    localStorage.removeItem("mojin-conversation-storage");
    // Xóa nốt cookie mồi của middleware
    document.cookie =
      "mojin_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
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

          // Tạo cookie mồi nội bộ để phục vụ Middleware Next.js
          document.cookie =
            "mojin_logged_in=true; path=/; max-age=604800; SameSite=Lax";

          set({
            user: res.user,
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: unknown) {
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
        clearConversationState();
        try {
          const res = await login(data);

          // Tạo cookie mồi nội bộ để phục vụ Middleware Next.js
          document.cookie =
            "mojin_logged_in=true; path=/; max-age=604800; SameSite=Lax";

          set({
            user: res.user,
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: unknown) {
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
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
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
          const response = await axiosClient.get<IUser>("/user");
          set({ user: response.data, isAuthenticated: true, loading: false });
        } catch (error) {
          console.error("Check auth toang", error);
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
          });
          clearConversationState();
        }
      },

      updateAvatarState: (avatarUrl: string) => {
        set((state) =>
          state.user ? { user: { ...state.user, avatar: avatarUrl } } : {},
        );
      },

      updateProfileState: (updatedUser: IUser) => {
        set((state) =>
          state.user ? { user: { ...state.user, ...updatedUser } } : {},
        );
      },

      updateProfile: async (data: IUpdateProfileInput) => {
        set({ loading: true, error: null });
        try {
          const res = await updateProfile(data);
          set((state) =>
            state.user
              ? { user: { ...state.user, ...res.user }, loading: false }
              : { loading: false },
          );
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Lưu thông tin toang rồi!",
          );
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },
    }),
    {
      name: "mojin-auth-storage",
      storage: createJSONStorage(() => ({
        // 🌟 BẪY ĐÁNH CHẶN LÚC ĐỌC: Giải mã dữ liệu trước khi nạp vào Zustand RAM
        getItem: (name) => {
          const value = localStorage.getItem(name);
          if (!value) return null;
          return cryptoStorage.decrypt(value);
        },
        // 🌟 BẪY ĐÁNH CHẶN LÚC GHI: Mã hóa banh xác dữ liệu rồi mới ném xuống ổ cứng
        setItem: (name, value) => {
          const encryptedValue = cryptoStorage.encrypt(value);
          localStorage.setItem(name, encryptedValue);
        },
        // Lúc xóa thì cứ xóa bình thường
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
