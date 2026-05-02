import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-matcha-lighter dark:bg-forest-lighter text-forest dark:text-mint">
      <div className="flex w-full max-w-3xl rounded-xl overflow-hidden shadow-lg bg-mint-light/80 dark:bg-forest/80">
        {/* Left: Illustration */}
        <div className="w-1/2 flex items-center justify-center bg-mint-lighter/60 dark:bg-forest-lighter/60">
          <Image
            src="/file.svg"
            alt="Login Illustration"
            width={320}
            height={320}
            className="object-contain animate-float"
            priority
          />
        </div>
        {/* Right: Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <p className="text-xl font-semibold text-matcha dark:text-mint">
              Mojin Air
            </p>
            <h1 className="text-2xl font-bold mt-2 text-forest dark:text-mint">
              Chào mừng bạn đến với Mojin Air
            </h1>
            <span className="text-sm text-sage dark:text-mint-light">
              Mời bạn đăng nhập để tham gia
            </span>
          </div>
          <form className="flex flex-col gap-4">
            <Field>
              <FieldLabel className="text-forest dark:text-mint font-medium">
                Email:
              </FieldLabel>
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-mint-lighter/60 dark:bg-forest-lighter/30 border border-mint dark:border-forest text-forest dark:text-mint input-base input-focus placeholder:text-sage/60 dark:placeholder:text-mint-light/60"
              />
            </Field>
            <Field>
              <FieldLabel className="text-forest dark:text-mint font-medium">
                Mật Khẩu:
              </FieldLabel>
              <Input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                className="bg-mint-lighter/60 dark:bg-forest-lighter/30 border border-mint dark:border-forest text-forest dark:text-mint input-base input-focus placeholder:text-sage/60 dark:placeholder:text-mint-light/60"
              />
            </Field>
            <button
              type="submit"
              className="mt-2 bg-linear-to-r from-matcha via-mint to-forest-dark text-white font-semibold py-3 px-4 rounded-xl shadow-lg btn-gradient-slide focus:ring-2 focus:ring-mint focus:outline-none cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-matcha dark:text-mint hover:underline transition-colors"
            >
              Quên mật khẩu?
            </a>
            <span className="mx-2 text-sage dark:text-mint-light">•</span>
            <Link
              href="/register"
              className="text-sm text-matcha dark:text-mint hover:underline transition-colors"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
