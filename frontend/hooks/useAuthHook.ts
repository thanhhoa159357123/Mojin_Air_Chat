import { useAuthStore } from "@/stores/useAuthStore";
import { IAuthLogin, IAuthRegister } from "@/types/auth";
import { useRouter } from "next/navigation"; // Hàng chính chủ NextJS
import { toast } from "sonner";

export const useAuthHook = () => {
  const router = useRouter();
  // Bốc thêm cái error từ store ra để vả vào Toast
  const { user, isAuthenticated, loading, error, register, login, logout } =
    useAuthStore();

  const handleRegister = async (data: IAuthRegister) => {
    try {
      await register(data);
      toast.success("Đăng ký thành công! Vào chat thôi bác.");
      router.push("/"); // Đăng ký xong là "phi" thẳng vào việc
    } catch (err) {
      // Dùng cái error 'tươi' nhất từ store vừa được set
      toast.error(useAuthStore.getState().error || "Đăng ký toang rồi!");
    }
  };

  const handleLogin = async (data: IAuthLogin) => {
    try {
      await login(data);
      toast.success("Chào mừng bác đã quay lại!");
      router.push("/");
    } catch (err) {
      toast.error(useAuthStore.getState().error || "Đăng nhập thất bại!");
    }
  };

  const handleLogout = async () => {
    try {
      toast.loading("Đang đăng xuất...");
      await logout();

      toast.success("Đã đăng xuất! Hẹn gặp lại bác.");

      // Nước đi chí mạng: Dùng window.location để Middleware và Client đồng bộ lại từ đầu
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (err) {
      // Kể cả lỗi vẫn phải tống về Login
      window.location.href = "/login";
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
