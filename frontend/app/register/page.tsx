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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl bg-card border border-border/50 flex-col-reverse lg:flex-row">
        {/* Left: Register Form */}
        <div className="w-full lg:w-3/5 p-8 sm:p-12 flex flex-col justify-center bg-card">
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">
              Mojin Air
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Chỉ mất 1 phút để bắt đầu trò chuyện.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Row 1: Họ và Tên */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Họ <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("last_name")}
                  placeholder="Nguyễn"
                  disabled={loading}
                  className={`h-11 bg-background/50 focus-visible:ring-primary ${
                    errors.last_name
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {errors.last_name && (
                  <p className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.last_name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Tên <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("first_name")}
                  placeholder="Văn A"
                  disabled={loading}
                  className={`h-11 bg-background/50 focus-visible:ring-primary ${
                    errors.first_name
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {errors.first_name && (
                  <p className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.first_name.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Row 2: Username & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Username
                </FieldLabel>
                <Input
                  {...register("username")}
                  placeholder="@biet_danh"
                  disabled={loading}
                  className={`h-11 bg-background/50 focus-visible:ring-primary ${
                    errors.username
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {errors.username && (
                  <p className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.username.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Số điện thoại
                </FieldLabel>
                <Input
                  {...register("phone")}
                  placeholder="09xxx..."
                  disabled={loading}
                  className={`h-11 bg-background/50 focus-visible:ring-primary ${
                    errors.phone
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Email */}
            <Field>
              <FieldLabel className="text-foreground font-medium text-sm">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("email")}
                type="email"
                placeholder="mojin@example.com"
                disabled={loading}
                className={`h-11 bg-background/50 focus-visible:ring-primary ${
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </Field>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Mật khẩu <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
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
              <Field>
                <FieldLabel className="text-foreground font-medium text-sm">
                  Xác nhận <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...register("password_confirmation")}
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  className={`h-11 bg-background/50 focus-visible:ring-primary ${
                    errors.password_confirmation
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {errors.password_confirmation && (
                  <p className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </Field>
            </div>

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
                "Đăng ký ngay"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6">
            <span className="text-sm text-muted-foreground border-t border-border/50 pt-6 px-4">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </span>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex w-2/5 items-center justify-center bg-primary/5 dark:bg-primary/10 p-12">
          <Image
            src="/file.svg"
            alt="Illustration"
            width={260}
            height={260}
            className="animate-float opacity-90 dark:opacity-80"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
