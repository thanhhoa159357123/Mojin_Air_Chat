import CryptoJS from "crypto-js";

// 🔑 Khóa bí mật dùng để mã hóa (Bác ném vào file .env.local cho bảo mật nhé)
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || "mojin_secret_key_sieu_bao_mat_2026";

export const cryptoStorage = {
  // Hàm mã hóa trước khi ghi vào ổ cứng
  encrypt: (text: string): string => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  },

  // Hàm giải mã khi đọc từ ổ cứng ra
  decrypt: (cipherText: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Giải mã token toang rồi bác ơi:", error);
      return "";
    }
  }
};