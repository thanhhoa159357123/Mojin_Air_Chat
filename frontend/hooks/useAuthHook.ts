import { useAuthStore } from "@/stores/useAuthStore";
import { IAuthLogin, IAuthRegister } from "@/types/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 🌟 BẢO BỐI: Import router của Next.js chính chủ
import { IUpdateProfileInput } from "@/services/authService";
import { useQueryClient } from "@tanstack/react-query";

export const useAuthHook = () => {
  const store = useAuthStore();
  const router = useRouter(); // Khởi tạo đài điều hướng điều khiển SPA
  const queryClient = useQueryClient();

  const handleRegister = async (data: IAuthRegister) => {
    try {
      await store.register(data);
      queryClient.clear();
      toast.success("Đăng ký thành công! Vào chat thôi bác.");

      // 🌟 Dùng router chuyển trang, giữ nguyên RAM Zustand và kết nối Pusher
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Đăng ký toang rồi!");
      }
    }
  };

  const handleLogin = async (data: IAuthLogin) => {
    try {
      await store.login(data);
      queryClient.clear();
      toast.success("Chào mừng bác đã quay lại!");

      // 🌟 Dùng điều hướng Next.js xịn sò, không bị abort request ngầm
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Đăng nhập toang rồi!");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const toastId = toast.loading("Đang đăng xuất...");
      await store.logout();
      queryClient.clear();
      toast.dismiss(toastId);

      // Đăng xuất xóa sạch dữ liệu xong thì điều hướng an toàn về trang login
      router.push("/login");
    } catch (err: unknown) {
      console.error("Logout API lỗi nhưng vẫn tống về Login", err);
      queryClient.clear();
      toast.dismiss();

      // Kể cả lỗi hệ thống vẫn tống cổ ra màn hình đăng nhập
      router.push("/login");
    }
  };

  const handleUpdateProfile = async (data: IUpdateProfileInput) => {
    const toastId = toast.loading("Đang lưu thông tin...");
    try {
      await store.updateProfile(data);
      toast.dismiss(toastId);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Lưu thông tin thất bại rồi!");
      }
    }
  };

  return {
    ...store,
    handleRegister,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
  };
};
