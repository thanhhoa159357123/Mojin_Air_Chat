# Sử dụng base image FrankenPHP chính thức cực kỳ tối ưu cho Laravel
FROM dunglas/frankenphp:1-php8.3-alpine

# Cài đặt các extension hệ thống và LINUX-HEADERS cần thiết để compile sockets trên Alpine
RUN apk add --no-cache \
    git \
    unzip \
    bash \
    postgresql-dev \
    linux-headers \
    && docker-php-ext-install pdo pdo_pgsql bcmath sockets

# Cài đặt Composer vào container
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy toàn bộ mã nguồn Backend vào container
COPY . /app

# Cài đặt các dependency của Laravel (bỏ dev, tối ưu autoloader)
RUN composer install --no-dev --optimize-autoloader

# Phân quyền cho các thư mục cache và storage của Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# Cấu hình biến môi trường FrankenPHP để chạy production
ENV SERVER_NAME=:10000
ENV APP_ENV=production

# Mở port 10000 theo tiêu chuẩn của Render
EXPOSE 10000

# DÒNG CUỐI CÙNG NÀY: Chỉ chạy migrate sạch, ĐÃ XÓA hoàn toàn cụm db:seed tự động
CMD ["sh", "-c", "php artisan migrate --force && frankenphp php-server --listen :10000 --public-dir public/"]