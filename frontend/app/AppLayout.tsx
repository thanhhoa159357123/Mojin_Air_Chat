"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname } from "next/navigation";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, checkAuth } = useAuthStore();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }
    checkAuth();
  }, [isPublicRoute, checkAuth]);

  // 💡 SỬA LẠI KHÚC NÀY ĐỂ DIỆT TẬN GỐC BỆNH NHÁY UI:
  // Nếu KHÔNG PHẢI trang Public VÀ đồng thời CHƯA CÓ USER trên RAM
  // -> Thì bất kể thằng `loading` đang là true hay false, tao vẫn GIỮ CHẶT màn hình chờ!
  if (!isPublicRoute && !user) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background gap-3">
        <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Mojin Air đang đồng bộ bảo mật...
        </p>
      </div>
    );
  }

  // Chỉ khi là trang Public (Login/Register) HOẶC đã check xong và có user đầy đủ trên RAM
  // thì mới cho phép render children (Page tổng)
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
