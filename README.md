# ✈️ Mojin_Air_Chat

> Một ứng dụng trò chuyện thời gian thực (Real-time Chat Application) Cyberpunk tốc độ cao, ứng dụng kiến trúc Decoupled (Laravel RESTful API & Next.js Frontend) kết hợp tối ưu hóa trải nghiệm người dùng tuyệt đối.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge&logo=react&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![FrankenPHP](https://img.shields.io/badge/FrankenPHP-00c7b7?style=for-the-badge&logo=php&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Pusher](https://img.shields.io/badge/Pusher-300D4F?style=for-the-badge&logo=pusher&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

---

## 🚀 Live Demo & Giới thiệu
- **Frontend Live Demo:** 
- **Vai trò dự án:** Solo Fullstack Developer (Tự nghiên cứu, thiết kế database, phát triển API và xây dựng giao diện từ con số 0).

---

## 🛠 Tech Stack & Kiến trúc hệ thống

Dự án được xây dựng theo mô hình **Decoupled Architecture**, tách biệt hoàn toàn giao diện người dùng và máy chủ xử lý logic, giao tiếp thông qua RESTful API.

| Thành phần | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| **Frontend** | NextJS 16 (App Router), TailwindCSS | Tối ưu hóa SEO (SSR/SSG), quản lý routing linh hoạt và UI/UX mượt mà. |
| **State Management** | Zustand, TanStack Query | Quản lý trạng thái ứng dụng toàn cục (RAM local) và đồng bộ bộ đệm cache API, tối ưu hóa dữ liệu real-time. |
| **Backend API** | Laravel 12, MySQL | Xây dựng hệ thống RESTful API chuẩn mực, xử lý các logic nghiệp vụ chat, authentication và quản lý cơ sở dữ liệu. |
| **Application Server** | FrankenPHP | Thay thế PHP-FPM truyền thống, chạy Worker Mode hiệu năng cao, giảm độ trễ phản hồi API xuống mức tối đa. | 
| **Real-time** | Pusher (WebSockets) | Kênh truyền dẫn tín hiệu thời gian thực, đồng bộ danh sách bạn bè, trạng thái typing, và tin nhắn tức thì giữa các client. |
| **Deployment** | Vercel, Render | Quản lý môi trường CI/CD cơ bản và đưa ứng dụng lên cloud. |

## 🧠 Technical Highlights & Điểm nhấn kỹ thuật

- **Tích hợp WebSockets Real-time:** Thiết lập thành công hệ thống Laravel Broadcasting kết hợp với Pusher, truyền dẫn tín hiệu thời gian thực (WebSockets Engine) để đồng bộ danh sách bạn bè, trạng thái typing lập lòe và tin nhắn tức thì giữa các client dưới 10ms.
- **Tối ưu hóa UI/UX với Optimistic UI:** Triển khai cơ chế giao diện lạc quan bằng cách đẻ Blob URL tạm thời hiển thị ảnh ngay lập tức khi người dùng ấn `Enter`, đẩy luồng upload lên Cloudinary chạy ngầm dưới background để triệt tiêu hoàn toàn độ trễ mạng.
- **Quản lý Cache & State Toàn Cục:** Kết hợp trường phái Zustand (quản lý RAM local) và TanStack Query (quản lý bộ đệm cache API), xây dựng cơ chế tự động thanh tẩy bộ nhớ ngầm khi đăng xuất hoặc chuyển đổi tài khoản để xử lý dứt điểm bẫy nhiễm độc dữ liệu.
- **Bảo mật Hệ thống & Điều hướng:** Cấu hình Next.js Middleware chặn file tĩnh thông minh (`.png`, `.svg`...), kết hợp đồng bộ trạng thái hội thoại và ép cứng giao diện khóa Read-only (`🔒 Hai người hiện không còn là bạn bè`) ngay khi hai user hủy kết bạn dưới Database.

---

## 📚 Những gì tôi học được (What I Learned)

Đóng vai trò là dự án cá nhân tâm huyết, **Mojin_Air_Chat** giúp tôi củng cố và thực hành các kỹ năng thực tế:
1. Làm chủ kiến trúc **Decoupled Architecture**, tổ chức luồng giao tiếp chuẩn Restful API giữa **Next.js (Frontend)** và **Laravel (Backend API)**.
2. Hiểu sâu về tư duy tối ưu hóa hiệu năng Runtime khi cấu hình ứng dụng chạy trên **FrankenPHP** với cơ chế Worker Mode giữ app luôn nằm trên RAM.
3. Nắm vững tư duy xử lý bất đồng bộ, xử lý lỗi Optimistic Update trên UI và nạp lại hàng chờ thông minh khi API thật xảy ra sự cố.
4. Nâng cao kỹ năng tổ chức Custom Hooks ở Frontend, cấu hình Laravel Events/Listeners ở Backend và kiểm soát vòng đời dữ liệu trên Local Storage.

---

## ✨ Tính năng cốt lõi

- ⚡ **Real-time Messaging System:** Đồng bộ tin nhắn hỗn hợp (Text, Images, Files), trạng thái đang soạn tin (Typing Indicator) và cập nhật danh sách bạn bè, phòng chat nhóm tức thì dưới 10ms thông qua luồng sự kiện WebSockets độc lập.
- 🖼️ **Optimistic Photo Delivery:** Đè Blob URL hiển thị hình ảnh cục bộ lên khung chat ngay khi nhấn `Enter`, đẩy toàn bộ tiến trình upload lên Cloudinary chạy ngầm dưới background nhằm triệt tiêu 100% cảm giác trễ mạng.
- 🔒 **Đồng bộ trạng thái bảo mật:** Tự động cô lập phòng hội thoại, ép cứng giao diện khóa Read-only khi phát hiện hai người dùng đã hủy kết bạn dưới Database, đồng thời dọn sạch cache TanStack Query và Zustand để chống bẫy nhiễm độc dữ liệu khi đổi account.
- 🖥️ **Web-Exclusive Interface:** Giao diện tối ưu hóa chuyên biệt cho nền tảng Web Desktop, tập trung toàn bộ không gian trải nghiệm vào luồng chat Cyberpunk ma mị, sắc nét và có chiều sâu.

---

## Database Schema (ERD)
<p align="center">
<img alt="Sơ đồ ERD dự án Mojin_Air_Chat" width="100%"  src="https://github.com/user-attachments/assets/659855c2-a17b-43f2-b517-9fa66011eb60" />

</p>

**Phân tích logic thiết kế hệ thống:**
- **Mô hình thực thể hội thoại (Conversation & Messaging Model):** Sử dụng cấu trúc quan hệ linh hoạt để quản lý tin nhắn thông qua bảng `messages` kết hợp trường loại tin nhắn (`type: text/mixed`). Hệ thống hỗ trợ đệ quy tin nhắn qua trường `parent_id` để xử lý tính năng trả lời (Reply) tin nhắn lồng nhau không giới hạn.
- **Tối ưu hóa cơ chế Real-time & Trạng thái bạn bè:** Thiết lập mối quan hệ Nhiều-Nhiều (Many-to-Many) qua bảng trung gian để quản lý trạng thái bạn bè, tích hợp cờ trạng thái đồng bộ ngầm giúp giao diện lập tức kích hoạt cơ chế Read-only chặn người dùng gửi tin nhắn ngay khi phát hiện mối quan hệ bạn bè bị hủy dưới Database.
- **Quản lý Payload Hỗn Hợp (Mixed Media Payload):** Cấu hình trường `content` lưu trữ dưới dạng JSON/Text linh hoạt để chứa payload tin nhắn phức tạp (bao gồm text thô, mảng URL hình ảnh từ Cloudinary và danh sách tệp đính kèm), giúp giảm thiểu số lượng bảng cần kết nối (Join) khi thực hiện truy vấn lịch sử tin nhắn tốc độ cao.

---

## 📸 Screenshots (Giao diện dự án)

### 🖥️ Giao diện chính (Main Dashboard)
*Hệ thống tự động đồng bộ ảnh theo chế độ hiển thị (Light/Dark Mode) của trình duyệt bác đang dùng.*

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/b6c644d3-43e7-4147-82f4-25eb571a3c08">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/ba2b4380-3550-4b68-b53c-b49c4d602d46">
  <img alt="Giao diện tổng quan Mojin_Air_Chat" src="https://github.com/user-attachments/assets/b6c644d3-43e7-4147-82f4-25eb571a3c08" width="100%">
</picture>

---

### 🔑 Giao diện Xác thực (Authentication UI)

| Giao diện Sáng (Light Mode) | Giao diện Tối (Dark Mode) |
| :---: | :---: |
| **Trang đăng nhập** | **Trang đăng nhập** |
| <img src="https://github.com/user-attachments/assets/9ff315bf-af1d-4ad1-9f72-02838e5bd6bb" width="100%" alt="Login Light"> | <img src="https://github.com/user-attachments/assets/f6724b0c-252e-45c7-948e-57b03e8f9f96" width="100%" alt="Login Dark"> |
| **Trang đăng ký** | **Trang đăng ký** |
| <img src="https://github.com/user-attachments/assets/4270056a-d297-41e2-b935-dc63803f84de" width="100%" alt="Register Light"> | <img src="https://github.com/user-attachments/assets/dba3e4a1-c168-4200-9b66-795fc2ae7afc" width="100%" alt="Register Dark"> |

---

## 🚀 Hướng dẫn cài đặt Local (Setup Guide)

<details>
<summary><b>🛠 Click để xem chi tiết các bước cài đặt</b></summary>

### 1. Cấu hình Backend (Laravel API)

Bác di chuyển vào thư mục backend và cài đặt các dependency:

cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed


#### 💡 Lưu ý: Chỉ lựa chọn 1 trong 2 cách sau để khởi chạy HTTP Server

##### 🔗 Cách 1: Chạy bằng FrankenPHP (Laravel Octane - Khuyến nghị cho High Performance)
Cách này tối ưu hiệu năng bằng cách giữ toàn bộ mã nguồn Laravel trên RAM, không mất công khởi động lại PHP ở mỗi request. 
*(Lưu ý: Do code được cache trên RAM nên mỗi lần thay đổi code bác phải khởi động lại server, hoặc dùng cờ --watch để tự động reload).*

* Bước 1: Bác phải đảm bảo máy local đã cài extension Swoole hoặc tích hợp FrankenPHP binary tương thích với PHP Octane.
* Bước 2: Cài đặt package Laravel Octane (nếu dự án chưa nạp sẵn):
  composer require laravel/octane
  php artisan octane:install --server=frankenphp
* Bước 3: Mở file .env lên, cấu hình Octane làm server chính:
  OCTANE_SERVER=frankenphp
* Bước 4: Kích hoạt server:
  # Chạy server cơ bản
  php artisan octane:start
  
  # HOẶC chạy kèm tính năng tự động reload khi sửa code (Watch Mode):
  php artisan octane:start --server=frankenphp --watch --poll

##### 🔗 Cách 2: Chạy bằng Web Server truyền thống (PHP Built-in Server)
Cách chạy basic, đơn giản, không cần cài đặt extension phức tạp và tự động nhận code mới mỗi khi chỉnh sửa mà không cần restart server.

* Bước 1: Bác chỉ cần chạy duy nhất một lệnh HTTP Development Server để nhận các request API từ Next.js:
  php artisan serve

---

### 📡 CẤU HÌNH REAL-TIME ENGINE (CHỌN PUSHER HOẶC REVERB)

Sau khi chọn cách chạy HTTP Server ở trên, bác cần cấu hình kênh truyền dẫn WebSockets thời gian thực để app chat hoạt động. Mở file .env và chọn 1 trong 2 cấu hình sau:

#### 🛰️ Lựa chọn A: Sử dụng Pusher (Cloud Service - Đang dùng mặc định)
Không cần chạy lệnh hay terminal riêng ở local, tín hiệu sẽ được đẩy qua server Cloud của Pusher.

* Cấu hình trong file .env (Bác copy đống này paste vào và nhớ xuống dòng cho từng biến nhé):
BROADCAST_CONNECTION=pusher<br>
PUSHER_APP_ID=your_pusher_app_id<br>
PUSHER_APP_KEY=your_pusher_app_key<br>
PUSHER_APP_SECRET=your_pusher_app_secret<br>
PUSHER_APP_CLUSTER=your_pusher_cluster<br>

#### 🌪️ Lựa chọn B: Sử dụng Laravel Reverb (Self-hosted WebSockets - Hàng tự trồng)
Nếu bác không muốn phụ thuộc vào bên thứ ba và muốn tự chạy WebSockets Server ngay tại máy local.

* Bước 1: Mở một terminal mới (Terminal riêng biệt độc lập với HTTP Server) và kích hoạt Reverb:
php artisan reverb:start
* Bước 2: Cấu hình thông số kết nối local trong file .env:
BROADCAST_CONNECTION=reverb<br>
REVERB_APP_ID=your_reverb_id<br>
REVERB_APP_KEY=your_reverb_key<br>
REVERB_APP_SECRET=your_reverb_secret<br>
REVERB_HOST="127.0.0.1"<br>
REVERB_PORT=8080<br>
REVERB_SCHEME=http<br>

---

### ⚠️ LƯU Ý CHÍ MẠNG VỀ HÀNG CHỜ SỰ KIỆN (QUEUE CONNECTIONS)

Đối với các sự kiện Real-time (như gửi tin nhắn, báo hiệu online/offline), mặc định Laravel sẽ đẩy vào hàng chờ (Queue) để tối ưu hiệu năng. Bác cần chỉnh biến QUEUE_CONNECTION trong file .env tùy theo nhu cầu:

* Môi trường Development (Local): Nên đổi thành sync để Laravel xử lý đồng bộ sự kiện tức thì trên cùng một request. Ưu điểm: Tín hiệu WebSockets bắn đi ngay lập tức mà đéo cần phải mở thêm terminal chạy lệnh worker ngầm.
  QUEUE_CONNECTION=sync
* Môi trường Testing/Production: Đổi thành database (hoặc redis) để quản lý hàng chờ tải lớn. 
  QUEUE_CONNECTION=database
  *(Lưu ý: Nếu để là database, bác bắt buộc phải mở thêm một terminal nữa và chạy lệnh php artisan queue:work thì tín hiệu Real-time mới được kích hoạt và truyền đi).*

---

### 2. Cấu hình Frontend (Next.js App)

Bác di chuyển vào thư mục frontend, chạy lệnh tương ứng với Package Manager đang xài để cài đặt và kích hoạt giao diện Web-Exclusive:

cd frontend

# Nếu bác xài npm:
npm install && npm run dev

# Nếu bác xài pnpm:
pnpm install && pnpm dev

# Nếu bác xài yarn:
yarn install && yarn dev

</details>

# ✅ Hoàn tất

Sau khi Backend và Frontend đều chạy thành công:

- Laravel API
- Next.js
- Database
- WebSocket (Pusher/Reverb)

Hệ thống sẽ sẵn sàng để sử dụng.

---

## 🚀 Future Roadmap (Dự kiến phát triển)

- [ ] 📞 **WebRTC Video/Audio Call:** Tích hợp tính năng gọi điện thoại và gọi có hình trực tiếp giữa các Client chuẩn WebRTC tốc độ cao.
- [ ] 🎭 **Conversation Customization:** Cho phép thay đổi biệt danh (Nickname) linh hoạt giữa các thành viên và ghi đè giao diện màu sắc, hình nền (Theme) riêng biệt cho từng phòng chat.
- [ ] 🔍 **Full-text Message Search:** Phát triển bộ lọc tìm kiếm tin nhắn thông minh theo từ khóa trong toàn bộ lịch sử hội thoại.
- [ ] 📁 **Shared Media Manager:** Tích hợp tab quản lý tập trung toàn bộ hình ảnh, liên kết (Links) và tệp tin đính kèm đã từng chia sẻ trong phòng chat.
- [ ] 🔒 **End-to-End Encryption (E2EE):** Nghiên cứu cơ chế mã hóa đầu cuối cho các đoạn hội thoại bí mật, đảm bảo tính riêng tư tuyệt đối cho dữ liệu người dùng.
- [ ] 🛡️ **Admin Control Panel (God Mode):** Xây dựng trang quản trị tối cao để theo dõi số lượng User đang online realtime, quản lý danh sách tài khoản bị khóa (Banned Users), giám sát các phòng chat nhóm công khai và xử lý các khiếu nại/báo cáo vi phạm (Reports Management) từ người dùng.

---

## 👨‍💻 Author
**Thanh Hòa**
- 📧 Email: ldthoaforwork@gmail.com
- 🐙 GitHub: [@thanhhoa159357123](https://github.com/thanhhoa159357123)

---
*Cảm ơn bạn đã ghé thăm dự án! Nếu thấy hữu ích, đừng quên tặng mình 1 ⭐ nhé!*
