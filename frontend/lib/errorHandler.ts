import { AxiosError } from "axios";

/**
 * Hàm trích xuất chuỗi báo lỗi từ Axios hoặc Error thông thường
 * @param error Biến error nhận từ block catch (unknown)
 * @param fallbackMessage Thông báo mặc định nếu không tìm thấy lỗi từ server
 */
export const extractErrorMessage = (
  error: unknown,
  fallbackMessage: string = "Đã có lỗi xảy ra!",
) => {
  // 1. Nếu là lỗi do Axios (bắn API)
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    // Ưu tiên lấy message từ Laravel Resource/Controller trả về
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      fallbackMessage
    );
  }

  // 2. Nếu là lỗi Error thông thường (throw new Error)
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Trường hợp bất khả kháng
  return fallbackMessage;
};
