/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuthHook } from "@/hooks/useAuthHook";
import { useFriends } from "@/hooks/useFriends";
import {
  Moon,
  X,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Camera,
  ArrowLeft,
  User as UserIcon,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils";
import { IUpdateProfileInput } from "@/services/authService";

interface IPopUpSettingAccount {
  onCloseAddFriend: () => void;
}

// Định nghĩa 2 view chính của Modal
type SettingTab = "settings" | "profile";

const PopUpSettingAccount = ({ onCloseAddFriend }: IPopUpSettingAccount) => {
  const { handleUpdateAvatar } = useFriends();
  const { theme, setTheme } = useTheme();

  // 🚀 Thu hoạch đầy đủ vũ khí từ useAuthHook của bác
  const {
    handleLogout,
    user,
    updateAvatarState,
    handleUpdateProfile,
    loading,
  } = useAuthHook();

  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 💡 STATE ĐIỀU HƯỚNG: Kiểm soát việc lật qua lật lại giữa Menu và Form
  const [activeTab, setActiveTab] = useState<SettingTab>("settings");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 📝 SETUP FORM: Giá trị mặc định cào trực tiếp từ Zustand User lên Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IUpdateProfileInput>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  // Đồng bộ lại dữ liệu form phòng trường hợp user được update ngầm từ đâu đó
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Luồng xử lý update avatar Cloudinary giữ nguyên của bác
  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      toast.loading("Đang thay đổi avatar, chờ tí nhé...");

      let fileToUpload = file;
      try {
        fileToUpload = await compressImage(file, {
          maxWidth: 500,
          quality: 0.8,
        });
      } catch (err) {
        console.error("Nén ảnh thất bại, giữ nguyên dữ liệu gốc", err);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "Mojin_Air_Chat");
      formData.append("folder", "mojin_air/avt");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dcds77ifp/image/upload`,
        { method: "POST", body: formData },
      );

      if (!cloudinaryResponse.ok)
        throw new Error("Cloudinary từ chối cấp phát vùng nhớ!");

      const cloudinaryData = await cloudinaryResponse.json();
      const secureUrl = cloudinaryData.secure_url;

      await handleUpdateAvatar(secureUrl);
      updateAvatarState(secureUrl);

      toast.dismiss();
      toast.success("Hệ thống cập nhật avatar mới thành công thực thụ!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error.message || "Xảy ra Exception chí mạng trong luồng đổi avatar.",
      );
    } finally {
      setIsUploading(false);
      if (e.target.value) e.target.value = "";
    }
  };

  // 🌟 SUBMIT FORM CHỮ: Kích hoạt hàm xử lý lưu qua Zustand Action của bác
  const onSaveProfileText = async (formData: IUpdateProfileInput) => {
    try {
      await handleUpdateProfile(formData);
      // Cập nhật thành công tự lật về màn hình chính
      setActiveTab("settings");
    } catch (err) {
      // Bắt lỗi đã có handleUpdateProfile gánh vác nổ Toast rồi
    }
  };

  if (!mounted) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCloseAddFriend}
        className="fixed inset-0 z-40 bg-black/40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh]">
          {/* HEADER THÔNG MINH BIẾN ĐỔI THEO TAB */}
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {activeTab === "profile" && (
                <button
                  onClick={() => setActiveTab("settings")}
                  className="p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-5 text-primary" />
                </button>
              )}
              <h2 className="text-lg font-black text-primary tracking-tight">
                {activeTab === "settings"
                  ? "Tùy chỉnh hệ thống"
                  : "Thông tin cá nhân"}
              </h2>
            </div>

            <button
              className="size-8 rounded-full bg-secondary/80 flex items-center justify-center cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-all"
              onClick={onCloseAddFriend}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* BLOCK HIỂN THỊ CHUYỂN TAB CÓ ĐỘNG HỌA MƯỢT MÀ */}
          <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
            <AnimatePresence mode="wait">
              {/* VIEW 1: MENU SETTINGS TIÊU CHUẨN CỦA BÁC */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.18 }}
                  className="p-6 space-y-6"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                  />

                  {/* Profile Card */}
                  <div className="p-4 rounded-2xl bg-primary/5 border border-border flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() =>
                          !isUploading && fileInputRef.current?.click()
                        }
                        className="relative size-14 rounded-full bg-primary p-0.5 shadow-md overflow-hidden group/avatar cursor-pointer"
                      >
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt="avatar"
                            className="size-full rounded-full object-cover"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="size-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            {user?.full_name?.charAt(0) || "M"}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                          <Camera className="size-4 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-base">
                          {user?.full_name || "Khách hữu danh"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          @{user?.username || "mojin_user"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút lật trang điều hướng profile */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? "Đang xử lý..." : "Đổi ảnh đại diện"}
                    </button>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl hover:bg-secondary/80 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserIcon className="size-3.5" />
                      Thông tin cá nhân
                    </button>
                  </div>

                  {/* Giao diện Theme */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 px-1">
                      <Moon className="size-4 text-primary" />
                      <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                        Chủ đề hiển thị
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          name="theme"
                          checked={theme === "light"}
                          onChange={() => setTheme("light")}
                          className="peer hidden"
                        />
                        <div className="p-3 rounded-xl border border-border bg-card transition-all peer-checked:border-primary peer-checked:bg-primary/5 text-center font-bold text-xs text-muted-foreground peer-checked:text-primary">
                          Vibe Sáng
                        </div>
                      </label>

                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          name="theme"
                          checked={theme === "dark"}
                          onChange={() => setTheme("dark")}
                          className="peer hidden"
                        />
                        <div className="p-3 rounded-xl border border-border bg-card transition-all peer-checked:border-primary peer-checked:bg-primary/5 text-center font-bold text-xs text-muted-foreground peer-checked:text-primary">
                          Vibe Tối
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Tiện ích khác */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[1.5px] px-1">
                      Tiện ích
                    </p>
                    <div className="space-y-1">
                      {[
                        {
                          icon: Bell,
                          label: "Thông báo",
                          color: "text-blue-500",
                          bg: "bg-blue-500/10",
                        },
                        {
                          icon: Shield,
                          label: "Bảo mật & Quyền riêng tư",
                          color: "text-purple-500",
                          bg: "bg-purple-500/10",
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-all cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}
                            >
                              <item.icon className="size-4" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: SUB-VIEW PHÂN HỆ FORM CHỈNH SỬA TEXT THUẦN */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.18 }}
                  className="p-6"
                >
                  <form
                    onSubmit={handleSubmit(onSaveProfileText)}
                    className="space-y-4"
                  >
                    {/* Họ và Tên */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">
                          Họ
                        </label>
                        <input
                          type="text"
                          {...register("last_name", { required: "Họ trống" })}
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">
                          Tên
                        </label>
                        <input
                          type="text"
                          {...register("first_name", { required: "Tên trống" })}
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors text-foreground"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm text-muted-foreground font-semibold">
                          @
                        </span>
                        <input
                          type="text"
                          {...register("username", {
                            required: "Username trống",
                          })}
                          className="w-full pl-7 pr-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors text-foreground font-medium"
                        />
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        {...register("phone")}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors text-foreground"
                        placeholder="Chưa cập nhật số điện thoại"
                      />
                    </div>

                    {/* Tiểu sử */}
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Tiểu sử (Bio)
                      </label>
                      <textarea
                        rows={3}
                        {...register("bio", {
                          maxLength: { value: 500, message: "Quá dài" },
                        })}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors text-foreground resize-none"
                        placeholder="Viết một lời tựa ngầu lòi cho bản thân nào..."
                      />
                    </div>

                    {/* Nút Hành Động Submit */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("settings")}
                        className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl hover:bg-secondary/80 transition-all cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="size-3.5" />
                        {loading ? "Đang lưu..." : "Xác nhận đổi"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER ĐĂNG XUẤT TIÊU CHUẨN */}
          <div className="p-4 bg-secondary/10 border-t border-border">
            <button
              onClick={() => handleLogout()}
              className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-xs flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-[0.99] cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Đăng xuất khỏi Mojin Air
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpSettingAccount;
