/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X, Phone, Mail, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { getUserDetail } from "@/services/friendService";

interface PopUpDetailFriendProps {
  onClose: () => void;
  partnerId: number;
}

const PopUpDetailFriend = ({ onClose, partnerId }: PopUpDetailFriendProps) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 Gọi API kéo data chi tiết của thằng này ngay khi mở Popup
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        // Bác thay endpoint này bằng API xem chi tiết user của Laravel nhé
        // Ví dụ: GET /api/users/{id}
        const response = await getUserDetail(partnerId); // Gọi API lấy chi tiết user

        // Tùy vào cấu trúc API trả về, ví dụ response.data.data hoặc response.data.user
        setUserData(response.data.data || response.data);
      } catch (error) {
        console.error("Lỗi khi kéo thông tin chi tiết user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchUserDetail();
    }
  }, [partnerId]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
      >
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden min-h-87.5 relative">
          {/* Header Bìa */}
          <div className="relative h-32 bg-linear-to-tr from-blue-600 to-cyan-400">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors z-10"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Hiệu ứng xoay xoay chờ Data */}
          {loading ? (
            <div className="absolute inset-0 top-32 flex flex-col items-center justify-center bg-card">
              <Loader2 className="size-8 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                Đang tải thông tin...
              </p>
            </div>
          ) : !userData ? (
            <div className="absolute inset-0 top-32 flex flex-col items-center justify-center bg-card">
              <p className="text-sm font-bold text-destructive">
                Không tìm thấy thông tin người dùng!
              </p>
            </div>
          ) : (
            /* Nội dung Profile thật */
            <div className="px-6 pb-6 relative">
              <div className="relative -mt-12 mb-3 size-24 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-md">
                {userData.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt={userData.full_name || userData.name || "User Avatar"}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-primary">
                    {(userData.full_name || userData.name)?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {userData.full_name || userData.name}
                </h2>
                <p className="text-sm font-medium text-muted-foreground">
                  @{userData.username || `user_${userData.id}`}
                </p>
              </div>

              <div className="space-y-4">
                {/* Bio */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Info className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wide">
                      Tiểu sử
                    </p>
                    <p className="text-sm font-medium text-foreground whitespace-pre-line">
                      {userData.bio ||
                        "Người này rất lười, chưa viết tiểu sử nào..."}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 size-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wide">
                      Số điện thoại
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {userData.phone || "Đang ẩn số điện thoại"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 size-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wide">
                      Email liên hệ
                    </p>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {userData.email || "Không có dữ liệu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PopUpDetailFriend;
