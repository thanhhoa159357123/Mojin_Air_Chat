import { AxiosError } from "axios";

/**
 * Trích xuất message lỗi từ error object do backend trả về.
 * @param error Error object có thể từ Axios hoặc Error thông dụng
 * @param defaultMessage Message mặc định khi không tìm thấy thông tin lỗi chi tiết
 * @returns Chuỗi string message lỗi
 */
export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string = "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
): string => {
  if (!error) return defaultMessage;

  // Xử lý lỗi trả về từ Axios
  const axiosError = error as AxiosError<{ message?: string; errors?: any }>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // Xử lý lỗi từ code thông thường
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};
