import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const compressImage = async (
  file: File,
  options = { maxWidth: 1920, quality: 0.8 },
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file); // Fallback: nếu lỗi thì trả về file gốc
          return;
        }

        let width = img.width;
        let height = img.height;

        // Bóp lại kích thước nếu to quá
        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Chuyển blob thành file gốc với đuôi jpeg hoặc giữ nguyên
            const newMimeType =
              file.type === "image/webp" || file.type === "image/png"
                ? file.type
                : "image/jpeg";
            const compressedFile = new File([blob], file.name, {
              type: newMimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type === "image/webp" || file.type === "image/png"
            ? file.type
            : "image/jpeg",
          options.quality,
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getFileNameFromUrl = (url: string) => {
  try {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const decoded = decodeURIComponent(lastPart).split("?")[0]; // bỏ param mặc định nếu có
    if (decoded.includes("___")) {
      return decoded.split("___").slice(1).join("___"); // Lấy phần thân sau chữ ___
    }
    return decoded;
  } catch {
    return "Tệp_đính_kèm.file";
  }
};
