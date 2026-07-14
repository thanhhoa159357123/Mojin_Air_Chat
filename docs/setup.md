# 🚀 Setup Guide

This guide explains how to run the project in your local environment.

Hướng dẫn dưới đây sẽ giúp bạn cài đặt và chạy dự án trên môi trường Local.

---

# 📋 Requirements

Before running the project, make sure the following tools are installed.

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau.

## Backend

- PHP >= **8.3**
- Composer
- MySQL
- Laravel 12
- _(Optional)_ FrankenPHP + Laravel Octane

## Frontend

- Node.js >= **20**
- npm / pnpm / yarn

## External Services

- Cloudinary Account
- Pusher Account _(or Laravel Reverb)_

---

# ⚙️ Backend Setup

Move to the backend folder.

Di chuyển vào thư mục Backend.

```bash
cd backend
```

Install dependencies.

Cài đặt các thư viện cần thiết.

```bash
composer install
```

Create the environment file.

Tạo file cấu hình môi trường.

```bash
cp .env.example .env
```

Generate the application key.

Sinh Application Key.

```bash
php artisan key:generate
```

Run database migrations.

Khởi tạo cơ sở dữ liệu.

```bash
php artisan migrate
```

---

## Option 1. PHP Development Server

Start Laravel using the built-in development server.

Khởi động Laravel bằng Development Server mặc định.

```bash
php artisan serve
```

---

## Option 2. FrankenPHP (Recommended)

Install Laravel Octane.

Cài đặt Laravel Octane.

```bash
composer require laravel/octane
```

Install FrankenPHP support.

Cài đặt FrankenPHP cho Laravel Octane.

```bash
php artisan octane:install --server=frankenphp
```

Start the server.

Khởi động HTTP Server.

```bash
php artisan octane:start
```

During development you can enable Watch Mode.

Trong quá trình phát triển có thể bật Watch Mode để tự động reload khi thay đổi mã nguồn.

```bash
php artisan octane:start --server=frankenphp --watch
```

> **Note**
>
> FrankenPHP keeps the application in memory for better performance.
>
> FrankenPHP giữ toàn bộ ứng dụng trên bộ nhớ (RAM) để tăng hiệu năng.
>
> Nếu không sử dụng `--watch`, hãy khởi động lại server sau khi thay đổi mã nguồn Backend.

---

# 💻 Frontend Setup

Move to the frontend folder.

Di chuyển vào thư mục Frontend.

```bash
cd frontend
```

### npm

```bash
npm install
npm run dev
```

### pnpm

```bash
pnpm install
pnpm dev
```

### yarn

```bash
yarn install
yarn dev
```

---

# 🔑 Environment Variables

Configure the following environment variables before running the project.

Cấu hình các biến môi trường trước khi khởi động dự án.

## Backend (`.env`)

```env
APP_NAME=Laravel
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_app
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=sync

BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=

CLOUDINARY_URL=
```

---

## Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

NODE_ENV=development
```

---

# 📡 Realtime

The project supports **two realtime providers**.

Dự án hỗ trợ hai giải pháp Realtime.

---

## Option 1. Pusher (Default)

Configure the following variables.

Cấu hình các biến môi trường sau.

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=
```

✅ No additional WebSocket server is required.

✅ Không cần chạy thêm WebSocket Server.

---

## Option 2. Laravel Reverb

Configure the environment.

Cấu hình các biến môi trường.

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=

REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Start the Reverb server.

Khởi động Reverb Server.

```bash
php artisan reverb:start
```

---

# ⚡ Queue

For local development, use synchronous queue processing.

Trong môi trường Local, nên sử dụng Queue đồng bộ.

```env
QUEUE_CONNECTION=sync
```

If using another queue driver such as **database** or **redis**, start a queue worker.

Nếu sử dụng **database** hoặc **redis**, hãy chạy Queue Worker.

```bash
php artisan queue:work
```

---

# ▶️ Run Project

Start each service in the following order.

Khởi động các dịch vụ theo đúng thứ tự dưới đây.

## 1. Start MySQL

Ensure your MySQL server is running.

Đảm bảo MySQL đã được khởi động.

---

## 2. Start Backend

### PHP Development Server

```bash
php artisan serve
```

or

### FrankenPHP

```bash
php artisan octane:start
```

---

## 3. Start Realtime (Optional)

If using Laravel Reverb.

```bash
php artisan reverb:start
```

If using **Pusher**, this step can be skipped.

---

## 4. Start Queue (Optional)

Required only when using **database** or **redis** queue drivers.

```bash
php artisan queue:work
```

---

## 5. Start Frontend

```bash
npm run dev
```

---

# 🌐 Application URLs

After starting all services, the application can be accessed via:

Sau khi khởi động thành công, có thể truy cập hệ thống tại:

| Service     | URL                       |
| ----------- | ------------------------- |
| Frontend    | http://localhost:3000     |
| Backend API | http://127.0.0.1:8000/api |

---

# ❗ Common Problems

## Database connection failed

Possible causes:

Nguyên nhân có thể gặp:

- MySQL is not running.
- Incorrect database credentials.
- Database has not been created.

---

- MySQL chưa được khởi động.
- Sai thông tin kết nối Database.
- Chưa tạo Database.

---

## Realtime is not working

Check the following:

Kiểm tra các mục sau:

- BROADCAST_CONNECTION
- PUSHER_APP_KEY
- PUSHER_APP_SECRET
- PUSHER_APP_CLUSTER
- Reverb Server is running (if using Reverb)

---

- BROADCAST_CONNECTION
- PUSHER_APP_KEY
- PUSHER_APP_SECRET
- PUSHER_APP_CLUSTER
- Đảm bảo Reverb Server đang hoạt động (nếu sử dụng Reverb)

---

## Queue is not processing

If the queue driver is **database** or **redis**, start a queue worker.

```bash
php artisan queue:work
```

---

## Cloudinary upload failed

Verify that the following environment variable is correctly configured.

```env
CLOUDINARY_URL=
```

---

## CORS Error

Ensure the frontend origin is allowed in Laravel's CORS configuration.

---

## 401 Unauthorized

Check:

- Access Token
- Refresh Token
- Sanctum Authentication
- Cookies are being sent correctly

---

## Images are not displayed

Verify:

- Cloudinary image URL is valid.
- `next.config.ts` allows the Cloudinary domain when using `next/image`.

---

## WSL2 cannot connect to MySQL

Nếu bạn chạy **Laravel Backend trong WSL2** nhưng **MySQL được cài trên Windows**, thì việc sử dụng:

```env
DB_HOST=127.0.0.1
```

có thể sẽ không kết nối được cơ sở dữ liệu.

Điều này xảy ra vì **WSL2 hoạt động trên một mạng ảo riêng**, nên `127.0.0.1` bên trong WSL2 chỉ trỏ đến chính môi trường Linux, không phải Windows Host.

### Cách khắc phục

Lấy địa chỉ IPv4 của Windows bằng lệnh:

```powershell
ipconfig
```

Ví dụ:

```text
IPv4 Address . . . . . . . . . : 192.168.1.100
```

Sau đó cập nhật trong file `.env`

```env
DB_HOST=192.168.1.100
```

Xóa cache cấu hình của Laravel.

```bash
php artisan config:clear
php artisan cache:clear
```

Khởi động lại Backend.

```bash
php artisan serve
```

hoặc

```bash
php artisan octane:start
```

> **Note**
>
> Nếu đổi sang mạng Wi-Fi khác hoặc đổi địa chỉ IP của máy Windows, hãy cập nhật lại `DB_HOST` tương ứng.

---

# ✅ Finished

If everything is configured correctly, the project should now support:

- ✅ Authentication
- ✅ Real-time Messaging
- ✅ Friend Management
- ✅ Image Upload
- ✅ Cloud Storage
- ✅ Queue Processing
- ✅ REST API
