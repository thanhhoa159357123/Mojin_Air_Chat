# 🎓 Lessons Learned (Bài học đúc kết)

Chương này ghi lại những bài học xương máu, các góc nhìn kỹ thuật được khai phá và những kinh nghiệm thực tiễn mà tôi đã tích lũy được trong suốt hành trình phát triển dự án **Mojin Air Chat**.

---

### 1. Optimistic UI (Giao diện lạc quan)
* **Bài học rút ra:** Ban đầu tôi nghĩ đơn giản rằng chỉ cần chờ Backend xử lý xong, trả kết quả thành công về thì mới cập nhật giao diện là đủ. Tuy nhiên, khi bắt tay vào xây dựng một Chat Application thực tế, tôi nhận ra cách làm truyền thống này khiến trải nghiệm người dùng bị khựng, chậm chạp và vô cùng thiếu tự nhiên.
* **Kinh nghiệm thực chiến:** Sau khi nghiên cứu về giải pháp `Optimistic UI`, tôi đã áp dụng cơ chế hiển thị tin nhắn ngay lập tức lên giao diện client với một trạng thái chờ ngầm, rồi mới đồng bộ dữ liệu song song với Server. Sự thay đổi này giúp trải nghiệm nhắn tin mượt mà hơn hẳn và tiệm cận với các ứng dụng nhắn tin hàng đầu hiện nay. Qua đó tôi hiểu rằng đôi khi trải nghiệm người dùng (UX) quan trọng không kém gì tốc độ xử lý thuần túy của Backend.

---

### 2. Sự phân tách giữa Client State và Server State (`TanStack Query`)
* **Bài học rút ra:** Ở giai đoạn đầu, tôi lạm dụng `Zustand` để lưu trữ hầu hết mọi dữ liệu dội về từ Backend. Càng phát triển sâu các tính năng, Store của `Zustand` càng phình to kinh khủng và phải gánh vác quá nhiều tác vụ không thuộc phạm vi trách nhiệm của nó.
* **Kinh nghiệm thực chiến:** Việc bắt một công cụ quản lý Client State phải đi xử lý các logic thuộc về Server State như: tự viết cơ chế xoá cache thủ công, quản lý các cờ trạng thái `loading`, `error` hay đồng bộ dữ liệu sau khi gọi API là một sai lầm kiến trúc. Sau khi kiên quyết refactor và chuyển dịch sang `TanStack Query`, tôi đã hiểu sâu sắc ranh giới giữa Client State và Server State. Phân chia đúng công cụ, đúng trách nhiệm giúp mã nguồn sạch sẽ hơn và giảm đáng kể lượng code rác phải tự quản lý.

---

### 3. Tư duy hướng sự kiện luồng dữ liệu thời gian thực (`WebSocket`)
* **Bài học rút ra:** Trước khi thực hiện dự án này, thế giới quan của tôi chủ yếu xoay quanh mô hình request/response tuần tự và độc lập của giao thức HTTP thông thường.
* **Kinh nghiệm thực chiến:** Thông qua việc tự tay thiết kế và hiện thực hóa một loạt các tính năng phức tạp như: truyền tin nhắn real-time, chỉ báo đang nhập chữ (`Typing Indicator`), trạng thái hiện diện (`Online Status`) hay cơ chế xác nhận đã đọc (`Read Receipt`), tôi đã hiểu rõ cách thức kết nối dài hạn (Persistent Connection) của WebSockets hoạt động. Dự án này mang lại cho tôi trải nghiệm quý báu về cách quản lý nhiều luồng sự kiện Realtime đồng thời mà không làm xung đột dữ liệu dưới DB.

---

### 4. Khai thác hạ tầng lưu trữ đám mây (`Cloudinary`)
* **Bài học rút ra:** Trước đây tôi chỉ có góc nhìn đơn giản rằng việc upload ảnh chỉ là viết một hàm nhận file rồi lưu trực tiếp tệp tin đó vào thư mục lưu trữ cục bộ của Server Backend.
* **Kinh nghiệm thực chiến:** Sau khi triển khai tích hợp `Cloudinary`, tôi nhận ra việc đẩy toàn bộ luồng xử lý và lưu trữ media ra các dịch vụ chuyên biệt bên thứ ba giúp giải phóng hoàn toàn tài nguyên CPU/RAM cho server API. Quá trình này giúp tôi tích lũy thêm nhiều kinh nghiệm thực tiễn khi làm việc, xác thực và xử lý bất đồng bộ với các API của các dịch vụ đám mây lớn.

---

### 5. Hiện thực hóa hệ thống xác thực bảo mật (`Authentication`)
* **Bài học rút ra:** Hệ thống xác thực trong môi trường production phức tạp hơn rất nhiều so với các ví dụ CRUD cơ bản hay các bài hướng dẫn mì ăn liền trên mạng.
* **Kinh nghiệm thực chiến:** Thông qua dự án, tôi đã tự mình xây dựng thành công cơ chế xác thực bảo mật hai tầng sử dụng `Access Token` và `Refresh Token`. Tôi đã phải tự tay giải quyết triệt để các bài toán hóc búa như: Luồng làm mới mã tự động khi `Access Token` hết hạn mà đéo ngắt quãng trải nghiệm của user, logic đăng xuất trên nhiều thiết bị (Multi-device Logout), lưu trữ an toàn `Refresh Token` trong `HttpOnly Cookie` chống tấn công XSS, và đồng bộ trạng thái session người dùng theo thời gian thực.

---

### 6. Tư duy thiết kế Cơ sở dữ liệu chuyên sâu (`Database Design`)
* **Bài học rút ra:** Đây chính là phân khúc ngốn của tôi nhiều thời gian và chất xám nhất trong toàn bộ dự án. Thiết kế DB ảnh hưởng trực tiếp và quyết định đến khả năng mở rộng (Scalability) của toàn bộ hệ thống.
* **Kinh nghiệm thực chiến:** Tôi nhận ra thiết kế một Chat Engine không đơn thuần là tạo hai cái bảng `users` và `messages` rồi nối khóa ngoại chéo là xong. Tôi đã buộc phải động não để giải quyết hàng loạt bài toán dữ liệu thực tế:
  * Mô hình hóa mối quan hệ Nhiều-Nhiều phức tạp giữa User và Conversation.
  * Theo dõi mốc thời gian đọc tin nhắn (`last_read_at`) độc lập để check trạng thái chưa đọc mà không làm nghẽn DB.
  * Phân quyền quản trị viên (`role`) linh hoạt trong các cuộc trò chuyện nhóm.
  * Cấu hình cấu trúc tự tham chiếu đệ quy (`parent_id`) để hỗ trợ Reply Message lồng nhau.
  * Xử lý cơ chế xóa mềm độc lập cho từng người dùng (`deleted_by_ids` dạng JSON) để đảm bảo người này xóa thì người kia vẫn xem được.

---

### 7. Tầm quan trọng của Cấu trúc dự án (`Project Structure`)
* **Bài học rút ra:** Khi số lượng tính năng ngày một nhiều lên, việc tổ chức, quy hoạch mã nguồn sạch sẽ quan trọng đéo kém gì việc viết thêm chức năng mới.
* **Kinh nghiệm thực chiến:** Trong suốt quá trình phát triển, tôi đã chủ động thực hiện nhiều đợt Refactoring lớn trên các file Controller, Model phía Backend và các Custom Hooks phía Frontend. Việc liên tục đập đi xây lại này giúp tôi thấm nhuần nguyên lý tách biệt trách nhiệm (Separation of Concerns), giảm thiểu trùng lặp mã nguồn (DRY Principle), giúp hệ thống có một bệ phóng vững chắc để dễ dàng cấy thêm tính năng mới thay vì để toàn bộ logic phình to thành một file quái vật.

---

### 8. If I rebuilt this project... (Nếu được làm lại từ đầu...)
* **Bài học rút ra:** Nếu có cơ hội quay lại vạch xuất phát để xây dựng lại hệ thống này từ đầu, dựa trên những kiến thức hiện tại, tôi chắc chắn sẽ thực hiện một số cải tiến mang tính chiến lược hơn:

> 🛠️ **Định hướng tối ưu lại kiến trúc:**
> * **Tách bảng Attachment:** Sẽ chủ động bóc tách trường JSON `content` thành một bảng phụ `attachments` chuyên biệt ngay từ đầu để quản lý chặt chẽ vòng đời của các file đa phương tiện lớn (Video, Voice Message).
> * **Cấu trúc quyền nâng cao:** Thiết lập hệ thống phân cấp Role cho Group Chat bài bản hơn để hỗ trợ nhiều cấp bậc admin tùy biến quyền hạn.
> * **Quy hoạch Schema sẵn:** Sẽ chuẩn bị sẵn sàng cấu trúc schema cho tính năng `Message Reaction` (Thả cảm xúc) và `Pin Message` (Ghim tin nhắn) ngay từ bước thiết kế ERD ban đầu.
> * **Tích hợp bộ đệm RAM:** Sẽ đưa `Redis` vào cấu hình ngay từ ngày đầu để làm tầng Cache cho danh sách phòng chat và xử lý hàng chờ (`Queue Worker`) cho hệ thống Broadcast Event.
> * **Tăng cường kiểm thử:** Sẽ đầu tư viết thêm nhiều Unit Test và Feature Test cho các luồng xử lý nghiệp vụ cốt lõi dưới Backend để đảm bảo tính ổn định tuyệt đối.

* **Chốt hạ:** Mặc dù hệ thống hiện tại vẫn còn nhiều không gian để tối ưu và cải tiến, nhưng tôi tin rằng chính quá trình tự mày mò, hoàn thiện và liên tục refactor này mới là phần giá trị nhất giúp tôi trưởng thành vượt bậc sau dự án này.