import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Danh sách các route cho phép vào thoải mái mà không cần thẻ bài
  const publicRoutes = ["/login", "/register", "/forgot-password"];

  // Nếu không có token và cố tình vào các trang không phải public -> Đá về login
  if (!token && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Nếu có token rồi mà còn lượn lờ ở mấy trang login/register -> Tống sang chat cho làm việc
  if (token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// Cấu hình để Middleware chỉ chạy cho các route nhất định
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
