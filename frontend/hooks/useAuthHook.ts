import { useAuthStore } from "@/stores/useAuthStore";
import { IAuthLogin, IAuthRegister } from "@/types/auth";
import { useRouter } from "next/navigation"; // Hàng chính chủ NextJS
import { toast } from "sonner";
import { updateUserStatus } from "@/services/conversationService";

export const useAuthHook = () => {
  const router = useRouter();
  // Bốc thêm cái error từ store ra để vả vào Toast
  const store = useAuthStore();

  const handleRegister = async (data: IAuthRegister) => {
    try {
      await store.register(data);
      toast.success("Đăng ký thành công! Vào chat thôi bác.");
      router.push("/"); // Đăng ký xong là "phi" thẳng vào việc
    } catch (err: unknown) {
      // err lúc này chính là Error(message) được throw từ Store sang
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
      toast.success("Chào mừng bác đã quay lại!");
      updateUserStatus("online").catch(() => {});
      router.push("/");
    } catch (err: unknown) {
      // Để là unknown nhé bác
      // Ép TS nhận diện err là instance của class Error
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Đăng nhập toang rồi!");
      }
    }
  };

  const handleLogout = async () => {
    try {
      // 1. Lưu lại cái ID của Toast loading để tý nữa dismiss hoặc update nó
      const toastId = toast.loading("Đang đăng xuất...");

      await store.logout();

      // 2. Thay vì hiện thêm 1 cái toast success, ta tắt cái loading đi
      toast.dismiss(toastId);

      // Nước đi chí mạng: Dùng window.location để Middleware và Client đồng bộ lại từ đầu
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (err: unknown) {
      console.error("Logout API lỗi nhưng vẫn tống về Login", err);

      // Bác có thể hiện toast báo lỗi nhanh trước khi chuyển trang
      if (err instanceof Error) {
        toast.error(`Đăng xuất có vấn đề: ${err.message}`);
      } else {
        toast.error("Đăng xuất có vấn đề rồi!");
      }

      // 3. ĐƯA RA NGOÀI DẤU NGOẶC: Kể cả lỗi vẫn phải tống về Login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    ...store,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
