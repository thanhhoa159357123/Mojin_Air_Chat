# 🧠 Technical Decisions (Quyết định kỹ thuật)

Chương này ghi lại toàn bộ triết lý thiết kế kiến trúc và lý do lựa chọn các giải pháp công nghệ trong dự án **Mojin Air Chat**, dựa trên quá trình nghiên cứu thực nghiệm và trải nghiệm phát triển thực tế.

---

### 1. Why Laravel? (Tại sao lại là Laravel/PHP?)
* **Lý do lựa chọn:** Trong quá trình nghiên cứu, tôi nhận thấy đa số các bài viết về Chat Application trên thị trường đều lựa chọn `MongoDB` hoặc `Cassandra`. Điều đó khiến tôi đặt ra câu hỏi liệu `Laravel` kết hợp với `MySQL` có còn phù hợp hay không.
* **Góc nhìn thực nghiệm:** Sau khi tìm hiểu lịch sử phát triển của Facebook, tôi biết rằng nền tảng này từng vận hành trong nhiều năm trên `PHP` và cơ sở dữ liệu quan hệ trước khi chuyển sang những giải pháp chuyên biệt hơn khi quy mô tăng lên. Điều đó giúp tôi nhận ra rằng vấn đề không nằm ở việc `PHP` có làm được Chat App hay không, mà nằm ở cách thiết kế kiến trúc và mô hình hóa dữ liệu.
* **Chốt hạ:** Chính vì vậy tôi quyết định lựa chọn `Laravel` để xây dựng dự án này như một cách kiểm chứng rằng một framework dựa trên `PHP` vẫn có thể đáp ứng tốt các tính năng của một Chat Application hiện đại ở quy mô phù hợp.

---

### 2. Why Next.js? (Tại sao lại là Next.js?)
* **Lý do lựa chọn:** Trước đây tôi đã từng sử dụng `React` để xây dựng giao diện người dùng. Khi bắt đầu dự án này, tôi muốn tiếp tục học sâu hơn về hệ sinh thái `React` nên quyết định lựa chọn `Next.js`.
* **Góc nhìn thực nghiệm:** Mặc dù dự án chủ yếu hoạt động theo mô hình Single Page Application (SPA), tôi nhận thấy `Next.js` vẫn mang lại nhiều lợi ích lớn như cấu trúc dự án rõ ràng, cơ chế routing (App Router) được tích hợp sẵn và quy trình build hoàn chỉnh. Điều này giúp tôi tập trung phát triển tính năng thay vì dành nhiều thời gian cho việc cấu hình môi trường.
* **Chốt hạ:** Ngoài ra, `Next.js` hiện cũng là một trong những framework `React` được sử dụng phổ biến nhất trong thực tế. Vì vậy tôi xem dự án này là cơ hội để làm quen với quy trình phát triển của một framework hiện đại, đồng thời chuẩn bị tốt hơn cho công việc sau này.

---

### 3. Why Zustand? (Tại sao lại là Zustand?)
* **Lý do lựa chọn:** Trước khi lựa chọn thư viện quản lý trạng thái, tôi đã tìm hiểu ba giải pháp phổ biến là `Context API`, `Redux Toolkit` và `Zustand`.
  * `Context API`: Được `React` cung cấp sẵn nên không cần cài đặt thêm thư viện. Tuy nhiên, khi số lượng Global State tăng lên, việc quản lý và tách nhiều Context trở nên phức tạp hơn, đặc biệt với một ứng dụng có nhiều module liên tục cập nhật như Chat Application.
  * `Redux Toolkit`: Là một giải pháp mạnh mẽ với kiến trúc rõ ràng, phù hợp cho các dự án lớn. Tuy nhiên, việc xây dựng Store, Slice và các luồng xử lý khiến lượng mã nguồn và cấu hình nhiều hơn rất nhiều so với nhu cầu thực tế của dự án này.
* **Góc nhìn thực nghiệm:** Sau khi so sánh các lựa chọn, tôi quyết định sử dụng `Zustand`. Mặc dù `Zustand` không cung cấp một kiến trúc quản lý state chặt chẽ như `Redux Toolkit`, điều này có thể khiến việc tổ chức Store trở nên khó bảo trì hơn khi dự án phát triển quá lớn. Tuy nhiên, với quy mô của một dự án cá nhân, số lượng Global State không nhiều nên tôi ưu tiên một giải pháp có API đơn giản, ít mã mẫu (boilerplate), dễ tiếp cận nhưng vẫn đáp ứng đầy đủ nhu cầu quản lý trạng thái.
* **Phân rã kiến trúc:** Trong hệ thống, `Zustand` chỉ được sử dụng để quản lý **Client State** như thông tin người dùng đăng nhập, cuộc trò chuyện đang được chọn và một số trạng thái giao diện. Đối với dữ liệu lấy từ Backend như danh sách cuộc trò chuyện, tin nhắn hay danh sách bạn bè, tôi sử dụng `TanStack Query` để quản lý **Server State**. Việc tách biệt rõ ràng này giúp mã nguồn trở nên gọn gàng, dễ bảo trì hơn, đồng thời mỗi thư viện chỉ đảm nhận đúng vai trò mà nó được thiết kế.

---

### 4. Why TanStack Query? (Tại sao lại là TanStack Query?)
* **Lý do lựa chọn:** Ở giai đoạn đầu của dự án, tôi sử dụng `Zustand` để quản lý hầu hết dữ liệu của hệ thống, bao gồm cả dữ liệu lấy từ Backend như danh sách cuộc trò chuyện, tin nhắn và danh sách bạn bè.
* **Góc nhìn thực nghiệm:** Tuy nhiên, khi số lượng tính năng tăng lên, tôi nhận thấy Store của `Zustand` ngày càng phình to và phải đảm nhận nhiều công việc không đúng với mục đích ban đầu. Mỗi khi cập nhật dữ liệu hoặc bổ sung một tính năng mới, tôi thường phải chỉnh sửa trực tiếp các Store hiện có, khiến source code dần trở nên khó mở rộng và bảo trì.
* **Chốt hạ:** Sau khi tìm hiểu về `TanStack Query`, tôi nhận ra thư viện này được thiết kế chuyên biệt để quản lý **Server State**. Thay vì tự lưu dữ liệu từ API vào Global State, `TanStack Query` cung cấp sẵn các cơ chế mạnh mẽ như caching, background refetching, loading state, error handling và cache invalidation. Điều này giúp giảm đáng kể lượng mã nguồn cần viết và hạn chế việc đồng bộ dữ liệu thủ công. Vì vậy, tôi quyết định chuyển phần lớn dữ liệu lấy từ Backend sang `TanStack Query`, trong khi `Zustand` chỉ còn đảm nhiệm việc quản lý **Client State**.

---

### 5. Why Cloudinary? (Tại sao lại là Cloudinary?)
* **Lý do lựa chọn:** Ở giai đoạn đầu của dự án, tôi từng thử nghiệm lưu trữ hình ảnh bằng `Supabase Storage`. Tuy nhiên, trong quá trình phát triển tôi gặp một số vấn đề liên quan đến việc truy cập và trải nghiệm sử dụng, vì vậy tôi bắt đầu tìm hiểu thêm các giải pháp khác.
* **Góc nhìn thực nghiệm:** Sau khi nghiên cứu, tôi quyết định chuyển sang sử dụng `Cloudinary` vì đây là một dịch vụ chuyên biệt dành cho việc quản lý và lưu trữ đa phương tiện. `Cloudinary` cung cấp API đơn giản, tốc độ upload nhanh và trả về URL ngay sau khi tải lên, giúp Frontend và Backend dễ dàng tích hợp.
* **Chốt hạ:** Đối với dự án này, nhu cầu chủ yếu là lưu trữ ảnh đại diện và hình ảnh trong tin nhắn, vì vậy những tính năng mà `Cloudinary` cung cấp đã đáp ứng đầy đủ yêu cầu mà không cần tự xây dựng hệ thống riêng. Việc sử dụng `Cloudinary` cũng giúp Backend chỉ cần lưu URL của hình ảnh trong cơ sở dữ liệu thay vì phải quản lý trực tiếp các tệp tin, giúp hệ thống đơn giản và dễ mở rộng hơn.

---

### 6. Why FrankenPHP? (Tại sao lại là FrankenPHP?)
* **Lý do lựa chọn:** Trong giai đoạn đầu phát triển dự án, tôi sử dụng PHP Server mặc định của `Laravel` để chạy Backend.
* **Góc nhìn thực nghiệm:** Tuy nhiên trong quá trình phát triển, tôi nhận thấy thời gian phản hồi của các API chưa thực sự như mong muốn. Sau khi tìm hiểu, tôi biết đến `FrankenPHP` và thử chuyển toàn bộ dự án sang môi trường này. Qua quá trình sử dụng thực tế, tôi nhận thấy cùng một mã nguồn nhưng tốc độ phản hồi của API nhanh hơn rõ rệt so với khi chạy bằng PHP Server mặc định, đồng thời việc thiết lập cũng khá đơn giản.
* **Chốt hạ:** Mặc dù tôi chưa thực hiện các bài kiểm thử Benchmark chuyên sâu, nhưng với trải nghiệm thực tế trong quá trình phát triển, `FrankenPHP` mang lại cảm giác phản hồi tốt hơn và đáp ứng ổn định cho dự án. Vì vậy tôi quyết định sử dụng `FrankenPHP` trong suốt quá trình xây dựng hệ thống.

---

### 7. Why Pusher? (Tại sao lại là Pusher?)
* **Lý do lựa chọn:** Để xây dựng các tính năng Realtime cốt lõi như gửi tin nhắn, trạng thái Online/Offline, Typing hay cập nhật cuộc trò chuyện, tôi đã tìm hiểu cả `Laravel Reverb` và `Pusher`.
* **Góc nhìn thực nghiệm:** `Reverb` là giải pháp chính thức mới của `Laravel` và hoàn toàn có thể tự triển khai (Self-hosted). Tuy nhiên, mục tiêu trọng tâm của dự án là tập trung vào việc phát triển chức năng của Chat Application thay vì dành quá nhiều thời gian xây dựng, cấu hình và vận hành hạ tầng Realtime ngầm.
* **Chốt hạ:** Vì vậy tôi lựa chọn `Pusher`. Đây là dịch vụ đã cung cấp sẵn hạ tầng Realtime cực kỳ ổn định, có tài liệu đầy đủ, tích hợp trực tiếp với hệ thống `Laravel Broadcasting` và hỗ trợ mượt mà cả trong quá trình phát triển lẫn khi triển khai Production. Việc sử dụng `Pusher` giúp tôi có thể tập trung nhiều hơn vào nghiệp vụ của hệ thống thay vì quản lý máy chủ WebSocket.

---

### 8. Why JSON Payload? (Tại sao lại dùng JSON Payload?)
* **Lý do lựa chọn:** Trong một hệ thống Chat hiện đại, một tin nhắn không chỉ đơn thuần là văn bản (text) mà còn có thể bao gồm hình ảnh, tệp tin hoặc kết hợp nhiều loại nội dung phức tạp trong cùng một lần gửi. Ban đầu tôi cân nhắc việc tách riêng thành nhiều bảng phụ như `images`, `files` hay `attachments`. Tuy nhiên với quy mô của dự án, cách làm này khiến số lượng bảng và quan hệ truy vấn `JOIN` tăng lên đáng kể.
* **Góc nhìn thực nghiệm:** Vì vậy tôi quyết định lưu nội dung của các tin nhắn phức tạp dưới dạng **JSON** trong duy nhất trường `content` của bảng `messages`. 
> **Cấu trúc payload JSON:**
> * **Text Message:** Lưu chuỗi ký tự văn bản thuần túy.
> * **Image Message:** Lưu mảng danh sách URL hình ảnh kết xuất từ Cloudinary.
> * **Mixed Message:** Kết hợp cả text và mảng hình ảnh/tệp tin trong cùng cấu trúc.
* **Chốt hạ:** Cách tiếp cận này giúp việc mở rộng thêm các loại nội dung mới trong tương lai trở nên đơn giản hơn mà không cần thay đổi cấu trúc schema cơ sở dữ liệu. Đổi lại, dữ liệu JSON sẽ khó truy vấn và thống kê nâng cao trực tiếp bằng SQL, tuy nhiên đây là sự đánh đổi hoàn toàn phù hợp với mục tiêu linh hoạt của dự án.

---

### 9. Why Decoupled Architecture? (Tại sao lại tách biệt FE và BE?)
* **Lý do lựa chọn:** Ngay từ đầu tôi lựa chọn tách riêng hoàn toàn Backend và Frontend thay vì sử dụng công cụ render `Blade` truyền thống của `Laravel`. Lý do không phải vì dự án bắt buộc phải tách, mà vì tôi muốn mô phỏng chính xác cách triển khai phổ biến của các hệ thống hiện đại trong thực tế.
* **Góc nhìn thực nghiệm:** Backend chỉ chịu trách nhiệm cung cấp REST API, xác thực người dùng và xử lý nghiệp vụ. Frontend được xây dựng độc lập bằng `Next.js` và giao tiếp với Backend thông qua HTTP API cũng như các sự kiện Realtime. Việc tách hai hệ thống giúp mỗi phần có thể phát triển, kiểm thử và triển khai độc lập. Sau này nếu muốn thay thế Frontend bằng React Native hoặc Flutter thì tầng Backend gần như không cần thay đổi.
* **Chốt hạ:** Mặc dù cách tiếp cận này làm tăng độ phức tạp trong quá trình cấu hình ban đầu (CORS, Cookie Authentication chéo tên miền, luồng Realtime...), nhưng đổi lại tôi có được một kiến trúc rõ ràng, tường minh và gần với cách xây dựng các sản phẩm thực tế tại doanh nghiệp hơn.

---

### 10. Looking Back (Nhìn lại chặng đường thiết kế)
* Quá trình hoàn thành dự án giúp tôi nhận ra rằng việc lựa chọn công nghệ không chỉ dựa trên việc công nghệ nào đang phổ biến hay thịnh hành nhất, mà còn phụ thuộc lớn vào mục tiêu học tập và định hướng nghiên cứu của bản thân.
* Trong suốt quá trình thực hiện, tôi đã nhiều lần lựa chọn những công nghệ không phải là phương án được sử dụng nhiều nhất trong các bài hướng dẫn (tự học trên mạng), như chọn `Laravel` cho Chat Application hay ứng dụng `FrankenPHP` để triển khai Backend. Mục tiêu của tôi không phải chứng minh một công nghệ tốt hơn công nghệ khác, mà là thực nghiệm kiểm chứng xem liệu với một kiến trúc phù hợp, những công nghệ đó có thể đáp ứng tối đa yêu cầu của hệ thống hay không.
* **Bài học rút ra:** Thiết kế kiến trúc, tổ chức mô hình dữ liệu và cách kết hợp các thành phần của hệ thống lại với nhau luôn là yếu tố quan trọng hơn việc chỉ tập trung vào một framework hay cơ sở dữ liệu cụ thể.