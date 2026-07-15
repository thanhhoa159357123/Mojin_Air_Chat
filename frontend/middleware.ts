import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 💡 ĐỌC COOKIE MỒI NỘI BỘ (Do frontend tự set, chung domain nên bất tử)
  const isLoggedIn = request.cookies.get("mojin_logged_in")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Nếu chưa đăng nhập mà đòi vào private route -> Tống về login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Nếu đã đăng nhập thành công rồi mà cứ lượn lờ ở public route -> Đá sang trang chủ chat
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};