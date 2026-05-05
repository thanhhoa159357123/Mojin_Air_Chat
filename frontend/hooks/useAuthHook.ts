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
      await logout();
      toast.success("Đăng xuất thành công! Hẹn gặp lại bác sau.");
      router.push("/login");
    } catch (err) {
      toast.error("Lỗi khi đăng xuất, thử lại nhé!");
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
