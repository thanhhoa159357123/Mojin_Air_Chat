<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roomId = 1;
        $user1 = 1;
        $user2 = 2;
        $now = Carbon::now();

        if (!DB::table('conversations')->where('id', $roomId)->exists()) {
            DB::table('conversations')->insert([
                'id' => $roomId,
                'type' => 'private', // Hoặc loại gì tùy cấu hình của bác
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // (Tùy chọn) Nếu DB của bác bắt buộc phải có liên kết bảng participants (Thành viên phòng)
            // thì bác insert luôn 2 user vào phòng chat này cho chuẩn bài UI luôn:
            DB::table('participants')->insert([
                ['conversation_id' => $roomId, 'user_id' => $user1, 'created_at' => $now, 'updated_at' => $now],
                ['conversation_id' => $roomId, 'user_id' => $user2, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        $rawMessages = [
            [$user1, 'Ê ông, dậy chưa? Con app mojin_air_chat chạy ngon rồi nè.'],
            [$user1, 'Pusher nổ bth rồi, nãy config:clear phát ăn ngay mới ảo ma.'],
            [$user2, 'Ủa ngon vậy rồi hả bác? Tôi mới làm ly cafe xong.'],
            [$user2, 'Để tôi vào test thử xem sao.'],
            [$user1, 'Ok vào đi, tôi đang bật sẵn giao diện rồi.'],
            [$user1, 'Mà ông thấy UI/UX phần khung chat nhìn ổn không?'],
            [$user2, 'Nhìn cũng được nhưng cảm giác hơi trống trải ông ạ.'],
            [$user2, 'Chắc tại chưa có nhiều tin nhắn nên chưa thấy hết góc cạnh.'],
            [$user1, 'Thế để tôi spam cho một mớ tin nhắn để ông test cuộn trang nhé.'],
            [$user1, 'Bắt đầu nè! Tin nhắn số 1.'],
            [$user1, 'Tin nhắn số 2, test thử xem bubble chat nó có tự động xuống hàng khi viết dài dài dài dài dài dài dài dài dài dài dài dài không.'],
            [$user1, 'Tin nhắn số 3, spam liên tục để xem avatar nó có bị hiển thị lặp lại gây ngứa mắt không.'],
            [$user1, 'Tin nhắn số 4, vẫn là tôi đang spam đây.'],
            [$user1, 'Tin nhắn số 5, test quả border-radius xem các tin nhắn gần nhau nó có bo góc thông minh không nha.'],
            [$user2, 'Vcl ông ơi từ từ thôi, nó nhảy rầm rầm như sấm đánh kìa! 😂'],
            [$user2, 'Mà công nhận có data vào nhìn cái giao diện nó sống động hẳn ra.'],
            [$user2, 'Để tôi rep lại vài tin nhắn dài dài tí.'],
            [$user2, 'Lorem Ipsum chỉ đơn giản là một đoạn văn bản giả, được dùng vào việc trình bày và dàn trang phục vụ cho in ấn. Lorem Ipsum đã được sử dụng như một văn bản chuẩn cho ngành công nghiệp in ấn từ những năm 1500.'],
            [$user2, 'Đấy, tin nhắn dài cỡ đó xem cái box chat của ông có gánh nổi không, hay lại vỡ cụ nó layout.'],
            [$user1, 'Ngon lành nhé, tự động xuống hàng chuẩn chỉ đéo bị tràn viền.'],
            [$user1, 'Mà nãy giờ nghe bài Thiêu Tâm của Chung Thần Dao cuốn quá ông ạ.'],
            [$user1, 'Cứ nghe đi nghe lại đoạn luyến ấy, não tụt cmn xuống còn 1 luồng.'],
            [$user2, 'Haha quả nhạc cổ phong ma mị đó hả? Công nhận bả hát đỉnh thật.'],
            [$user2, 'Nghe xong muốn đi thiền định luôn chứ code gì tầm này nữa.'],
            [$user1, 'Thôi xin, thiền kiểu Tapion hôm bữa tí nữa thì người nóng rang như cục sắt.'],
            [$user1, 'Nghĩ lại vẫn thấy sợ, hệ thần kinh nó ép xung kinh quá.'],
            [$user2, 'Do ông thức đêm nhiều đấy, lo mà ngủ nghê đầy đủ vào.'],
            [$user2, 'Server chạy bằng cơm mà cứ đòi overload 32 luồng liên tục.'],
            [$user1, 'Biết thế nên giờ đang vừa code vừa dưỡng sinh đây.'],
            [$user1, 'Spam tiếp nè, tin nhắn số 30 rồi nha.'],
            [$user1, 'Test thử mấy cái icon xem hiển thị chuẩn không: 🚀 🔥 💯 👑 👻 🐧 🦄'],
            [$user1, 'Kèm theo mấy ký tự đặc biệt luôn: <script>alert("test_XSS")</script> - xem ông có filter chuẩn chưa hay lại dính quả lỗi bảo mật sơ đẳng.'],
            [$user2, 'Kaka tôi dùng Blade với Echo nó tự escape hết rồi, đố ông hack được.'],
            [$user2, 'Mà cái nút Send tin nhắn ông làm hiệu ứng hover chưa?'],
            [$user1, 'Làm rồi, di chuột vào nó đổi màu xanh nhìn mượt vcl.'],
            [$user2, 'Ok để tôi kéo thử cái scrollbar lên xem tin nhắn cũ hiển thị sao.'],
            [$user2, 'Ủa mà ông có làm quả tự động cuộn xuống bottom khi có tin nhắn mới tới không?'],
            [$user1, 'Có chứ, dùng cái `scrollTo({ top: element.scrollHeight, behavior: "smooth" })` trong JS ấy.'],
            [$user1, 'Mỗi lần Pusher nó bắn Event về là tự động trượt xuống êm ái luôn.'],
            [$user1, 'Spam tiếp tin nhắn thứ 40 để ông kéo mỏi tay chơi.'],
            [$user2, 'Đủ rồi ông ơi, ngập lụt màn hình của tôi rồi!'],
            [$user2, 'Nhưng mà công nhận có mớ data này test UI sướng thật.'],
            [$user2, 'Nhìn rõ được khoảng cách giữa các dòng, padding, margin chuẩn chỉ.'],
            [$user1, 'Chuẩn bài, làm dev lười nhập tay thì cứ dùng Seeder mà giã.'],
            [$user1, 'Đỡ tốn thời gian ngồi gõ bậy bạ "asdasdasd".'],
            [$user2, 'Mà tí nữa ông định làm tiếp bảng nào? Bảng `rooms` hay bảng `participants`?'],
            [$user1, 'Chắc làm cái Migration cho bảng `rooms` trước để quản lý phòng chat công khai với riêng tư.'],
            [$user2, 'Ok, lên xong bài đó là con app mojin_air_chat coi như húp được 50% chặng đường rồi.'],
            [$user1, 'Ừ, làm phát cho kịp tiến độ buổi sáng còn đi ngủ bù.'],
            [$user2, 'Chốt đơn! Giờ tôi ngồi lướt xem có chỗ nào lệch pixel nào nữa không rồi báo ông sửa nốt.'],
        ];

        $messages = [];
        foreach ($rawMessages as $index => $item) {
            // Giãn cách thời gian: tin cũ nằm trước (trang đầu tiên), tin mới nằm sau
            $time = (clone $now)->subSeconds((count($rawMessages) - $index) * 30);

            // 💡 CHỐT HẠ: Thay đổi nội dung theo số thứ tự (index + 1)
            $newContent = "Tin nhắn số " . ($index + 1) . ": " . $item[1];

            $messages[] = [
                'conversation_id' => $roomId,
                'user_id' => $item[0],
                'content' => $newContent, // Đã thay bằng số thứ tự
                'type' => 'text',
                'created_at' => $time,
                'updated_at' => $time,
            ];
        }

        DB::table('messages')->insert($messages);
    }
}
