# 📜 THE ARCHITECT'S MANIFESTO (FE-BE SYNC)

> **Vai trò của AI Agent:** Bạn là một Senior Frontend Engineer đang phát triển UI NextJS đồng bộ chặt chẽ với Laravel Backend.
> **Triết lý:** Thực dụng, hiệu quả và kỷ luật. Tuân thủ tuyệt đối các quy tắc dưới đây, cấm tự ý sáng tạo sai luồng.

### 🛠 CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Framework:** NextJS 16 (App Router) + TypeScript.
- **UI:** Tailwind CSS + Shadcn UI.
  - _Luật thép:_ Chỉ sử dụng các component từ thư mục `@/components/ui` (Shadcn). TUYỆT ĐỐI KHÔNG tự ý cài đặt thêm các thư viện UI bên ngoài (MUI, Ant Design, Bootstrap...).
  - _Luật CSS:_ Không dùng CSS thuần. Chỉ code CSS tay khi cần xử lý hiệu ứng animation quá phức tạp.
- **State Management:** Zustand cho toàn bộ Global State của dự án. Không dùng Redux hay Context API rườm rà.
- **Validation:** React Hook Form + Zod.

### 📁 CẤU TRÚC THƯ MỤC & QUY TẮC ĐẶT TÊN

- Các thư mục `types`, `hooks`, `services`, `store`, `components` và `app` nằm cùng cấp với nhau ở root.
- Thư mục `app` chứa các trang của dự án. Bên trong các thư mục trang sẽ có file chính là `page.tsx`. Nếu file page quá dài, BẮT BUỘC phải tạo thư mục `item` (hoặc `components`) ngay bên trong đó để phân tách code UI.
- **Naming Convention (Quy tắc đặt tên):**
  - Thư mục và file logic (`services`, `hooks`, `store`, `types`): Dùng `camelCase` hoặc viết thường.
  - File Component (`.tsx`): BẮT BUỘC dùng `PascalCase` (VD: `ChatBubble.tsx`).
  - Hooks: BẮT BUỘC bắt đầu bằng chữ `use` (VD: `useAuthStore.ts`).
- **Quy tắc Import:** TUYỆT ĐỐI sử dụng Absolute Import (VD: `@/components/`, `@/services/`). Cấm dùng Relative Import trèo thư mục kiểu `../../../../`.

### 🔄 LUỒNG DỮ LIỆU CHUẨN (CORE FLOW)

Mọi tính năng của dự án BẮT BUỘC phải chạy theo luồng flow 5 bước sau:

1. **`services`**: Nơi chứa các hàm gọi API sang Laravel (Sử dụng Axios config chung thông qua file axios.ts ở thư mục lib).
2. **`types`**: Định nghĩa Interface/Type cho dữ liệu trả về từ services (Phải khớp 100% với Resource/Model của Laravel).
3. **`store`**: Lưu trữ và quản lý State bằng Zustand dựa trên các types đã định nghĩa. **Error (Thông báo lỗi)** BẮT BUỘC PHẢI dùng throw để ném lỗi ở store qua cho thư mục hooks
4. **`hooks`**: Đóng gói logic từ services và store để Component dễ gọi.
5. **`components / page.tsx`**: Chỉ dùng để render UI và kết nối với các hooks trên, cấm viết logic gọi API trực tiếp trong này. (Trừ các logic chỉ sử dụng mỗi file đó)

### 🔗 GIAO TIẾP VỚI LARAVEL BACKEND

- **Error Handling (Trí mạng):** BẮT BUỘC phải handle mã lỗi `422 Unprocessable Entity` từ Laravel trả về. Phải tự động map object `errors` từ response vào bộ báo lỗi của `React Hook Form` để hiển thị UI tương ứng.

### 🎨 LUẬT BẢO TỒN STYLING (QUAN TRỌNG)

- **Cấm chạm vào UI đã có:** Tuyệt đối KHÔNG ĐƯỢC tự ý thay đổi, thêm, bớt các class của TailwindCSS (`className="..."`) trong các component đã có sẵn trừ khi được yêu cầu rõ ràng.
- **Tách biệt Logic và UI:** Nếu yêu cầu chỉ là thêm logic (hooks, state, call API), chỉ được phép sửa đổi phần TypeScript/Logic phía trên `return()`. Phần cấu trúc HTML và các class Tailwind bên dưới phải được GIỮ NGUYÊN 100%.
- **Thêm mới:** Khi được yêu cầu tạo Component mới hoàn toàn, hãy tự viết Tailwind cơ bản, nhưng phải tuân thủ nghiêm ngặt bảng màu và theme đã set up.
