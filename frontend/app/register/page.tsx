"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthHook } from "@/hooks/useAuthHook";
import { IAuthRegister, registerSchema } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

const RegisterPage = () => {
  const { handleRegister, loading } = useAuthHook();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAuthRegister>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: IAuthRegister) => {
    await handleRegister(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-matcha-lighter dark:bg-forest-lighter text-forest dark:text-mint p-4">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-mint-light/90 dark:bg-forest/90 backdrop-blur-md border border-white/20">
        {/* Left: Register Form */}
        <div className="w-full lg:w-3/5 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-xl font-bold text-matcha dark:text-mint tracking-wider uppercase">
              Mojin Air
            </p>
            <h1 className="text-3xl font-extrabold mt-2 text-forest dark:text-white">
              Tạo tài khoản mới
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Row 1: Họ và Tên */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-semibold">
                  Họ: <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                  {...register("first_name")}
                  placeholder="Nguyễn"
                  disabled={loading}
                  className={
                    errors.first_name ? "border-red-500" : "border-mint/50"
                  }
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.first_name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="font-semibold">
                  Tên: <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                  {...register("last_name")}
                  placeholder="Văn A"
                  disabled={loading}
                  className={
                    errors.last_name ? "border-red-500" : "border-mint/50"
                  }
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.last_name.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Row 2: Username & Phone (Quay trở lại lợi hại hơn xưa) */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-semibold">Username:</FieldLabel>
                <Input
                  {...register("username")}
                  placeholder="@biet_danh"
                  disabled={loading}
                  className={
                    errors.username ? "border-red-500" : "border-mint/50"
                  }
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.username.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="font-semibold">
                  Số điện thoại:
                </FieldLabel>
                <Input
                  {...register("phone")}
                  placeholder="09xxx..."
                  disabled={loading}
                  className={errors.phone ? "border-red-500" : "border-mint/50"}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Email (Full width cho thoải mái) */}
            <Field>
              <FieldLabel className="font-semibold">
                Email: <span className="text-red-600">*</span>
              </FieldLabel>
              <Input
                {...register("email")}
                type="email"
                placeholder="mojin@example.com"
                disabled={loading}
                className={errors.email ? "border-red-500" : "border-mint/50"}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </Field>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="font-semibold">
                  Mật khẩu: <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  className={
                    errors.password ? "border-red-500" : "border-mint/50"
                  }
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="font-semibold">
                  Xác nhận: <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                  {...register("password_confirmation")}
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  className={
                    errors.password_confirmation
                      ? "border-red-500"
                      : "border-mint/50"
                  }
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 bg-linear-to-r from-matcha via-forest to-forest-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 ${
                loading ? "opacity-70" : "hover:scale-[1.02] cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "🚀 Đăng ký ngay"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-mint/20 pt-4">
            <span className="text-sm text-sage dark:text-mint-light">
              Đã có tài khoản?{" "}
            </span>
            <Link
              href="/login"
              className="text-sm font-bold text-matcha dark:text-mint hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex w-2/5 items-center justify-center bg-linear-to-br from-mint-lighter to-matcha/20 p-12">
          <Image
            src="/file.svg"
            alt="Illustration"
            width={280}
            height={280}
            className="animate-float"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
