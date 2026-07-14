# ✈️ Mojin Air Chat

> **Mojin Air Chat** là một ứng dụng trò chuyện thời gian thực (Real-time Chat Application) được xây dựng theo kiến trúc **Decoupled Architecture**, sử dụng **Laravel RESTful API** và **Next.js**. Dự án tập trung vào hiệu năng, khả năng mở rộng và tối ưu trải nghiệm người dùng thông qua WebSocket, Optimistic UI và các kỹ thuật quản lý trạng thái hiện đại.

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

## 🚀 Live Demo

| Service | URL |
|----------|-----|
| Frontend | Coming Soon |
| Backend API | Private |

---

## 👨‍💻 Vai trò

Dự án được phát triển hoàn toàn bởi một cá nhân.

Trong quá trình thực hiện, mình đảm nhiệm toàn bộ các công việc:

- Thiết kế Database
- Thiết kế RESTful API
- Phát triển Backend (Laravel)
- Phát triển Frontend (Next.js)
- Triển khai Realtime với Pusher
- Thiết kế UI/UX
- Deploy ứng dụng

---

## 🛠 Tech Stack & Kiến trúc hệ thống

Dự án được xây dựng theo mô hình **Decoupled Architecture**, tách biệt hoàn toàn giao diện người dùng và máy chủ xử lý logic, giao tiếp thông qua RESTful API.

| Thành phần         | Công nghệ               | Vai trò                              |
| ------------------ | ----------------------- | ------------------------------------ |
| Frontend           | Next.js 16, TailwindCSS | Xây dựng giao diện và định tuyến     |
| State Management   | Zustand, TanStack Query | Quản lý Client State và Server State |
| Backend            | Laravel 12              | RESTful API và Business Logic        |
| Database           | MySQL                   | Lưu trữ dữ liệu                      |
| Application Server | FrankenPHP              | Chạy Laravel với hiệu năng cao       |
| Realtime           | Pusher                  | Đồng bộ dữ liệu thời gian thực       |
| Storage            | Cloudinary              | Lưu trữ hình ảnh                     |
| Deployment         | Vercel, Render          | Triển khai ứng dụng                  |


## 🧠 Technical Highlights & Điểm nhấn kỹ thuật

- **Realtime Messaging:** Đồng bộ tin nhắn, trạng thái đang nhập (Typing Indicator) và danh sách bạn bè theo thời gian thực thông qua Laravel Broadcasting và Pusher.
- **Optimistic UI:** Hiển thị hình ảnh ngay lập tức bằng Blob URL trước khi quá trình upload lên Cloudinary hoàn tất nhằm giảm cảm giác chờ của người dùng.
- **State Management:** Phân tách Client State bằng Zustand và Server State bằng TanStack Query giúp mã nguồn dễ bảo trì và hạn chế dữ liệu không đồng bộ.
- **Authentication & Route Protection:** Bảo vệ các trang riêng tư bằng Next.js Middleware, đồng thời đồng bộ trạng thái quan hệ bạn bè để tự động chuyển cuộc trò chuyện sang chế độ Read-only khi cần.

---

## 📚 Documentation

Để README ngắn gọn hơn, toàn bộ tài liệu kỹ thuật được tách riêng trong thư mục **docs/**.

| Tài liệu | Mô tả |
|----------|------|
| 📐 [Architecture](docs/architecture.md) | Kiến trúc tổng thể của hệ thống |
| 🗄️ [Database Design](docs/database.md) | Thiết kế cơ sở dữ liệu và các quyết định liên quan |
| ⚙️ [Technical Decisions](docs/technical-decisions.md) | Giải thích lý do lựa chọn công nghệ |
| 📘 [Lessons Learned](docs/lessons-learned.md) | Những bài học rút ra trong quá trình phát triển |
| 🚀 [Setup Guide](docs/setup.md) | Hướng dẫn cài đặt và chạy dự án |

---

## 📚 Những gì mình học được (What I Learned)

Thông qua dự án này mình có cơ hội:

- Thiết kế kiến trúc Decoupled.
- Xây dựng RESTful API.
- Làm việc với WebSocket.
- Tối ưu trải nghiệm bằng Optimistic UI.
- Quản lý Server State và Client State.
- Tổ chức dự án Fullstack.

👉 Chi tiết xem tại **[docs/lessons-learned.md](docs/lessons-learned.md)**.

---

## ✨ Tính năng cốt lõi

- ⚡ Real-time Messaging
- 🖼️ Optimistic Image Upload
- 👥 Friend Management
- ⌨️ Typing Indicator
- 🌙 Dark / Light Mode
- 🔒 Authentication & Authorization
- 📂 File & Image Upload
- 📱 Responsive Web Interface

---

## 🗄️ Database Schema (ERD)

<p align="center">

...

</p>

👉 Chi tiết xem tại **[docs/database.md](docs/database.md)**.

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

### 📁 Project Structure

```text
Mojin-Air-Chat
├── backend/
├── frontend/
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── technical-decisions.md
│   ├── lessons-learned.md
│   └── setup.md
└── README.md
```

---

## 🚀 Future Roadmap (Dự kiến phát triển)

- [ ] 📞 **WebRTC Video/Audio Call:** Tích hợp tính năng gọi điện thoại và gọi có hình trực tiếp giữa các Client chuẩn WebRTC tốc độ cao.
- [ ] 🎭 **Conversation Customization:** Cho phép thay đổi biệt danh (Nickname) linh hoạt giữa các thành viên và ghi đè giao diện màu sắc, hình nền (Theme) riêng biệt cho từng phòng chat.
- [ ] 🔍 **Full-text Message Search:** Phát triển bộ lọc tìm kiếm tin nhắn thông minh theo từ khóa trong toàn bộ lịch sử hội thoại.
- [ ] 📁 **Shared Media Manager:** Tích hợp tab quản lý tập trung toàn bộ hình ảnh, liên kết (Links) và tệp tin đính kèm đã từng chia sẻ trong phòng chat.
- [ ] 🔒 **End-to-End Encryption (E2EE):** Nghiên cứu cơ chế mã hóa đầu cuối cho các đoạn hội thoại bí mật, đảm bảo tính riêng tư tuyệt đối cho dữ liệu người dùng.
- [ ] 🛡️ **Admin Control Panel (God Mode):** Xây dựng trang quản trị tối cao để theo dõi số lượng User đang online realtime, quản lý danh sách tài khoản bị khóa (Banned Users), giám sát các phòng chat nhóm công khai và xử lý các khiếu nại/báo cáo vi phạm (Reports Management) từ người dùng.

---

## ⭐ Support

Nếu dự án hữu ích hoặc giúp bạn tham khảo trong quá trình học tập, hãy cân nhắc để lại một ⭐ cho repository.

Đó sẽ là động lực để mình tiếp tục phát triển và chia sẻ thêm nhiều dự án khác.

## 👨‍💻 Author
**Thanh Hòa**
- 📧 Email: ldthoaforwork@gmail.com
- 🐙 GitHub: [@thanhhoa159357123](https://github.com/thanhhoa159357123)
