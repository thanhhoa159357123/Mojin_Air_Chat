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
    <div className="min-h-screen flex items-center justify-center bg-matcha-lighter dark:bg-forest-lighter text-forest dark:text-mint p-4">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-mint-light/90 dark:bg-forest/90 backdrop-blur-md border border-white/20">
        {/* Left: Illustration */}
        <div className="hidden lg:flex w-2/5 items-center justify-center bg-linear-to-br from-mint-lighter to-matcha/20 dark:from-forest-lighter/50 dark:to-matcha/10 p-12">
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
            <Image
              src="/file.svg"
              alt="Login Illustration"
              width={280}
              height={280}
              className="object-contain animate-float drop-shadow-2xl"
              priority
            />
            <div className="mt-8 space-y-2">
              <h3 className="text-forest dark:text-white font-bold text-xl">
                Chào mừng trở lại!
              </h3>
              <p className="text-sage dark:text-mint-light text-sm">
                Mojin Air đã sẵn sàng cho những cuộc trò chuyện mới.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full lg:w-3/5 p-10 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-xl font-bold text-matcha dark:text-mint tracking-wider uppercase">
              Mojin Air
            </p>
            <h1 className="text-3xl font-extrabold mt-2 text-forest dark:text-white">
              Đăng nhập
            </h1>
            <p className="text-sm text-sage dark:text-mint-light mt-1">
              Nhập thông tin của bác để kết nối với chiến hữu.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <Field>
              <FieldLabel className="text-forest dark:text-mint font-semibold">
                Tài khoản:
              </FieldLabel>
              <Input
                {...register("login")}
                type="text"
                disabled={loading}
                placeholder="Email hoặc Username của bạn"
                className={`bg-white/50 dark:bg-forest-lighter/30 h-12 focus:border-matcha ${
                  errors.login ? "border-red-500" : "border-mint/50"
                }`}
              />
              {errors.login && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.login.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="flex justify-between items-center mb-1">
                <FieldLabel className="text-forest dark:text-mint font-semibold mb-0">
                  Mật khẩu:
                </FieldLabel>
                <a
                  href="#"
                  className="text-xs text-matcha hover:text-forest-dark dark:hover:text-white transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <Input
                {...register("password")}
                type="password"
                disabled={loading}
                placeholder="••••••••"
                className={`bg-white/50 dark:bg-forest-lighter/30 h-12 focus:border-matcha ${
                  errors.password ? "border-red-500" : "border-mint/50"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </Field>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 bg-linear-to-r from-matcha via-forest to-forest-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-lg ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.01] cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "🚀 Vào ngay"
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-mint/20 pt-6">
            <span className="text-sm text-sage dark:text-mint-light">
              Bác chưa có tài khoản à?{" "}
            </span>
            <Link
              href="/register"
              className="text-sm font-bold text-matcha dark:text-mint hover:text-forest transition-colors underline underline-offset-4"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
