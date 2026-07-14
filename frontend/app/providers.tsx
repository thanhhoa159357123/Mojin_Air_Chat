"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo QueryClient trong useState để tránh bị share trùng instance giữa các request trên Server
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Cache data trong 5 phút mới coi là "cũ" (stale)
            refetchOnWindowFocus: true, // Tự động refetch khi user tab qua tab lại
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Cục này để bật bảng Debug dưới góc màn hình lúc dev */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}