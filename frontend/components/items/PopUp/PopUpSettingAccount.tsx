import { useAuthHook } from "@/hooks/useAuthHook";
import { Moon, X, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface IPopUpSettingAccount {
  onCloseAddFriend: () => void;
}

const PopUpSettingAccount = ({ onCloseAddFriend }: IPopUpSettingAccount) => {
  const { theme, setTheme } = useTheme();
  const { handleLogout, user } = useAuthHook();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <>
      {/* Backdrop mờ ảo */}
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
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg overflow-hidden"
      >
        <div className="bg-card rounded-4xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header - Matcha Glassmorphism style */}
          <div className="px-6 py-4 border-b border-border bg-secondary/50 flex justify-between items-center backdrop-blur-md">
            <h2 className="text-xl font-black text-primary tracking-tight">
              Tùy chỉnh hệ thống
            </h2>
            <button
              className="size-9 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
              onClick={onCloseAddFriend}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Nội dung cuộn được */}
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            {/* 1. Account Profile Card */}
            <section>
              <div className="p-4 rounded-2xl bg-primary/5 border border-border flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary p-1 shadow-lg shadow-primary/20">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        className="size-full rounded-full border-2 border-background/50 object-cover"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="size-full rounded-full border-2 border-background/50 bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {user?.full_name?.charAt(0) || "M"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-primary text-lg">
                      {user?.full_name || "Khách hữu danh"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium tracking-wide">
                      @{user?.username || "mojin_user"}
                    </span>
                  </div>
                </div>
                <div className="size-8 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            </section>

            {/* 2. Theme System Settings (Cái cục bác yêu cầu đây) */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Moon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-primary">Giao diện</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Thay đổi vibe của Mojin Air
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Light Theme */}
                <label className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                    className="peer hidden"
                  />
                  <div className="p-3 rounded-2xl border-2 border-border bg-card transition-all duration-300 peer-checked:border-primary peer-checked:bg-background">
                    <div className="h-20 w-full bg-white rounded-xl mb-3 border border-slate-200 p-2 space-y-1.5 overflow-hidden">
                      <div className="h-2 w-1/3 bg-slate-200 rounded-full" />
                      <div className="h-2 w-full bg-slate-100 rounded-full" />
                      <div className="flex gap-2 pt-1">
                        <div className="size-6 rounded-lg bg-blue-500/10" />
                        <div className="h-6 flex-1 bg-slate-50 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        Chế độ Sáng
                      </span>
                    </div>
                  </div>
                </label>

                {/* Dark Theme */}
                <label className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="theme"
                    className="peer hidden"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <div className="p-3 rounded-2xl border-2 border-border bg-card transition-all duration-300 peer-checked:border-primary">
                    <div className="h-20 w-full bg-gray-900 rounded-xl mb-3 border border-gray-800 p-2 space-y-1.5 overflow-hidden">
                      <div className="h-2 w-1/3 bg-gray-700 rounded-full" />
                      <div className="h-2 w-full bg-gray-800 rounded-full" />
                      <div className="flex gap-2 pt-1">
                        <div className="size-6 rounded-lg bg-blue-500/10" />
                        <div className="h-6 flex-1 bg-gray-800 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        Chế độ Tối
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* 3. Quick Actions */}
            <section className="space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] px-1">
                Tiện ích khác
              </p>
              <div className="grid grid-cols-1 gap-2">
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
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${item.bg} ${item.color}`}
                      >
                        <item.icon className="size-4" />
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer - Logout Button */}
          <div className="p-6 bg-secondary/30 border-t border-border">
            <button
              onClick={() => handleLogout()}
              className="w-full py-3.5 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="size-4" />
              Đăng xuất khỏi Mojin Air
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpSettingAccount;
