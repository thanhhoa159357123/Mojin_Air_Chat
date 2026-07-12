// lib/pusher.ts
import Pusher from "pusher-js";

// Bật log ở môi trường dev để dễ debug
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Pusher.logToConsole = false; // Tắt log để tránh spam console, bật khi cần debug
}

// 💡 ÉP KIỂU KHÉO LÉO: Bảo TypeScript coi cục Pusher này là kiểu "any" tạm thời để qua mắt nó
export const pusherClient =
  typeof window !== "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new ((Pusher as any).default ?? Pusher)(
        process.env.NEXT_PUBLIC_PUSHER_KEY!,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          forceTLS: true,
        },
      )
    : null;
