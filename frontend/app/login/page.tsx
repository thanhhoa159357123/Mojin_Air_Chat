/* eslint-disable @next/next/no-img-element */
"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthHook } from "@/hooks/useAuthHook";
import { IAuthLogin, loginSchema } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const { handleLogin, loading } = useAuthHook();

  // Khởi tạo form với "vệ sĩ" Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAuthLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (data: IAuthLogin) => {
    // Bắn data qua Hook để xử lý login + toast + redirect
    await handleLogin(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl bg-card border border-border/50">
        {/* Left: Illustration */}
        <div className="hidden lg:flex w-2/5 items-center justify-center bg-primary/5 dark:bg-primary/10 p-12">
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
            <img
              src="/assets/mojinair.svg"
              alt="Logo Mojin Air"
              className="object-contain animate-float opacity-95 dark:opacity-95 w-65 h-65"
              style={{
                filter:
                  "drop-shadow(0 0 8px rgba(76,175,80,0.7)) drop-shadow(0 0 20px rgba(76,175,80,0.4)) drop-shadow(0 0 40px rgba(76,175,80,0.2))",
              }}
            />
            <div className="mt-10 space-y-2">
              <h3 className="text-foreground font-semibold text-lg tracking-tight">
                Chào mừng trở lại!
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mojin Air đã sẵn sàng cho những cuộc trò chuyện mới.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full lg:w-3/5 p-8 sm:p-12 flex flex-col justify-center bg-card">
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">
              Mojin Air
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Đăng nhập
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Nhập thông tin của bác để kết nối với chiến hữu.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <Field>
              <FieldLabel className="text-foreground font-medium text-sm">
                Tài khoản
              </FieldLabel>
              <Input
                {...register("login")}
                type="text"
                disabled={loading}
                placeholder="Email hoặc Username"
                className={`h-11 bg-background/50 focus-visible:ring-primary ${
                  errors.login
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
              {errors.login && (
                <p className="text-destructive text-xs mt-1.5 font-medium">
                  {errors.login.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="flex justify-between items-center mb-1.5">
                <FieldLabel className="text-foreground font-medium text-sm mb-0">
                  Mật khẩu
                </FieldLabel>
                {/* <a
                  href="#"
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Quên mật khẩu?
                </a> */}
              </div>
              <Input
                {...register("password")}
                type="password"
                disabled={loading}
                placeholder="••••••••"
                className={`h-11 bg-background/50 focus-visible:ring-primary ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </Field>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-base ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
              ) : (
                "Vào ngay"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6">
            <span className="text-sm text-muted-foreground border-t border-border/50 pt-6 px-4">
              Bác chưa có tài khoản à?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Tạo tài khoản mới
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
