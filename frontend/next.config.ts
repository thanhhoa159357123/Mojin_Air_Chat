import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Các cấu hình cũ của bác nếu có (ví dụ: reactStrictMode...) giữ nguyên */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Cho phép lấy mọi đường dẫn ảnh thuộc domain này
      },
      // 💡 Bác giữ lại cái pattern của Supabase cũ ở đây (nếu vẫn cần render ảnh cũ)
    ],
  },
};

export default nextConfig;
