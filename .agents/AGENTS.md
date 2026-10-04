# Quy tắc nghiệp vụ & Kiến trúc Kỹ thuật Hệ thống PACA (PACA Bar System Rules)

Tài liệu quy định toàn bộ các nguyên tắc kiến trúc phần mềm, quy chuẩn nghiệp vụ quán Bar PACA, cơ chế đồng bộ đa thiết bị, và các biện pháp kỹ thuật xử lý triệt để bộ nhớ đệm (cache).

---

## 1. Cơ chế Quản lý Danh mục, Ẩn/Hiện & Lọc Trang Bìa Canvas (Category Lifecycle & Poster Filtering)
* **Tính toàn vẹn của danh mục (Category Integrity):**
  - Mọi danh mục trong hệ thống PACA (`week`, `bites`, `cocktail`, `beer`, `wine_shot`, và các danh mục động do quán tự tạo) được định danh duy nhất bằng trường `id` và liên kết với trang poster qua `pageId` (hoặc `sec_cat_{id}`).
* **Xử lý khi Ẩn danh mục (`is_active: false`):**
  - Khi một danh mục bị đánh dấu **Ẩn** trong Quản Trị (`admin.html`), hệ thống tự động gỡ tick cả **Trang Bìa** (`show_on_cover = false`) và **Thanh Nav** (`show_on_nav = false`).
  - **Trên Trang Bìa Poster (`page_cover`):** Nút liên kết điều hướng (`link_nav`) của danh mục này **bắt buộc bị loại bỏ ngay lập tức**. Các nút bấm của các danh mục còn lại sẽ tự động dãn cách và căn đều vị trí theo chiều dọc, tuyệt đối không để lại khoảng trống hoặc lỗ thủng trên trang bìa.
  - **Trên Thanh Điều Hướng Sticky Nav:** Hàm `renderCustomerNavBar()` trong `index.html` bắt buộc kiểm tra điều kiện kép: `c.is_active !== false && c.show_on_nav !== false`.
  - **Trên các Trang Danh mục & Thẻ Món:** Toàn bộ trang riêng (`page_{id}`, `sec_cat_{id}`) hoặc mục động (`renderDynamicCategorySection`) và các thẻ món (`card_product`, danh sách tiêu chuẩn `renderStandardMenu`) thuộc danh mục bị ẩn phải bị chặn hiển thị hoàn toàn.
* **Xử lý khi Xóa danh mục (Deleted Categories):**
  - Khi một danh mục bị xóa khỏi Quản Trị, mã nguồn kiểm tra trên Trang Bìa và các trang Canvas: Mọi liên kết `link_nav` mang ID dạng `nav_link_cat_...` hoặc trỏ đến `sec_cat_...` mà không tồn tại trong danh sách danh mục hoạt động hiện thời (`allCategories`) đều bị coi là **rác từ bản thiết kế cũ** và **tự động loại bỏ hoàn toàn**, không hiển thị ra cho khách.

---

## 2. Quy chuẩn Chống Lưu Đệm Trình duyệt Nhúng Zalo & Mobile WebView (Zalo In-App Browser Cache Busting)
* **Đặc tính kỹ thuật của Zalo WebView:**
  - Trình duyệt nhúng mở từ ứng dụng Zalo (In-App WebView trên iOS/Android) lưu bộ nhớ đệm (Cache) và `localStorage` độc lập, có xu hướng giữ lại các tệp tĩnh `.js` rất lâu nếu URL không thay đổi.
* **Cơ chế Cache-Busting bắt buộc:**
  - Mọi tệp kịch bản lõi nhúng trong `index.html`, `admin.html`, `studio.html` bắt buộc phải kèm tham số phiên bản dạng `?v=YYYYMMDD_HHMM` (ví dụ: `js/paca_canvas.js?v=20261003_2125`).
  - Khi có bản phát hành mới, bắt buộc cập nhật đồng loạt tham số `?v=` để ép WebView của Zalo tải mã nguồn mới 100% từ máy chủ.
* **Chỉ thị HTTP Header & Thẻ Meta chống lưu đệm:**
  - Thẻ `<head>` của trang khách quét bắt buộc chứa đầy đủ:
    ```html
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    ```
* **Bộ tự động dọn sạch cache cục bộ (`paca_app_version`):**
  - Tại hàm khởi tạo `init()` trong `paca_core.js`, hệ thống duy trì hằng số `CURRENT_VERSION`.
  - Nếu phiên bản lưu trong `localStorage` khác với `CURRENT_VERSION`, hệ thống tự động xóa sạch các bản lưu đệm cũ (`paca_menu_data`, `paca_menu_saved_timestamp`, `paca_published_canvas_v2`, `paca_canvas_published_timestamp`) để nạp trực tiếp bản dữ liệu mới nhất từ Cloud Sync và máy chủ.
  - Các lệnh gọi `fetch()` nạp `menu.json` và `default_canvas_template.json` bắt buộc cấu hình `{ cache: 'no-store' }`.

---

## 3. Kiến trúc Đồng bộ Đám mây Thời gian thực (Realtime Cloud Sync)
* **Kênh đồng bộ Menu & Thiết kế Canvas:**
  - **Menu Thực đơn:** Đồng bộ qua kênh `ntfy.sh/paca_menu_sync_dalat_2025` định dạng JSON đính kèm. Mọi thay đổi về món ăn, giá, tình trạng còn/hết và danh mục từ Quản Trị được đẩy lên kênh này kèm mốc thời gian Unix milliseconds.
  - **Thiết kế Canvas Poster:** Đồng bộ qua kênh `ntfy.sh/paca_design_sync_dalat_2025`. Khi Quản lý bấm "Xuất bản" trên Studio, toàn bộ cấu trúc các trang và phần tử Canvas được đóng gói và phát sóng tới tất cả thiết bị di động.
* **Kênh đồng bộ Đơn hàng & Bàn (Order & Table Sync):**
  - Đồng bộ qua `ntfy.sh/paca_orders_sync_dalat_2025` sử dụng kết nối luồng sự kiện trực tiếp Server-Sent Events (SSE).
  - Thu ngân, Bar, Bếp và Khách hàng nhận cập nhật tức thì từng giây khi đơn hàng chuyển đổi trạng thái: `pending` (chờ xử lý) ➜ `preparing` (đang pha chế) ➜ `served` (đã phục vụ) ➜ `paid` (đã thanh toán).
* **Đồng bộ nội bộ cùng trình duyệt:**
  - Tích hợp `BroadcastChannel('paca_order_events')` để chia sẻ trạng thái đồng thời giữa các tab mà không cần tải lại trang.

---

## 4. Kiến trúc Studio Canvas & Thẻ Món Đa Màu (Studio Canvas Engine)
* **Hệ thống thẻ món đa sắc (Multi-Theme Product Cards):**
  - Cung cấp 4 chủ đề màu sắc cổ điển phù hợp phong cách quán bar:
    1. **Navy Blue:** Nền xanh tím than hoàng gia (`#10234d`), chữ be kem (`#f6dcaf`).
    2. **Crimson Red:** Nền đỏ mận cổ điển (`#940b05`), chữ trắng kem viền vàng.
    3. **Retro White:** Nền trắng ngà ánh vàng (`#fffdf9`), viền đậm navy retro.
    4. **Emerald Green:** Nền xanh ngọc bích vintage (`#0b4432`), điểm xuyết vàng gold.
  - Bộ phối màu tự động so le (Auto-alternating) giúp các món liền kề không bị trùng màu, tạo nhịp điệu thị giác ấn tượng.
* **Gán món thông minh (1-Click Product Binding):**
  - Mọi thẻ món trên Canvas có thể liên kết trực tiếp với dữ liệu món trong Quản Trị qua `binding.productId`.
  - Giá tiền, tên món song ngữ, huy hiệu và hình ảnh món ăn được tự động đồng bộ theo thời gian thực từ kho dữ liệu món.
* **Tự động co giãn trang (Auto-stretch Canvas Height):**
  - Khi thêm món mới vào cuối danh mục trên Canvas, chiều cao trang (`page.height`) tự động nới rộng để bao trọn thẻ món mới và tự động đẩy các phần tử trang trí / câu trích dẫn xuống đáy, không làm tràn hay mất chữ.

---

## 5. Quy định Bàn mở, Gọi món theo Phiên & Thanh toán (Running Tabs & Cash / VietQR)
* **Phiên gọi món theo bàn (Running Bill Tab Session):**
  - Khách ngồi tại bàn có thể quét mã QR gọi món nhiều đợt liên tiếp. Các món gọi thêm sẽ tự động gộp vào phiên bàn đang mở (`active_session`), cập nhật tổng hóa đơn tích lũy.
* **Thanh toán Tiền Mặt & Chuyển Khoản:**
  - Hỗ trợ thanh toán nhanh bằng **Mã VietQR động** (tự động điền số tiền và nội dung chuyển khoản).
  - Hộp thoại thanh toán tiền mặt tích hợp sẵn bộ nút bấm mệnh giá nhanh (50k, 100k, 200k, 500k) và tự động tính tiền thừa trả lại cho khách chính xác từng đồng.
* **In hóa đơn nhiệt (POS ESC/POS Printing):**
  - Hỗ trợ in trực tiếp từ điện thoại không cần máy tính bàn qua kết nối Wi-Fi mạng LAN khổ giấy K80 (80mm) và K58 (58mm).
  - Phiếu Bếp/Bar tự động ẩn giá tiền; Phiếu Thu ngân in kèm mã VietQR thanh toán.

---

## 6. Chốt ca Doanh thu & Báo cáo Tự Động (Daily Shift Close Settlement)
* **Quy trình chốt ca cuối ngày:**
  - Thu ngân thực hiện kiểm đếm tiền mặt, tiền chuyển khoản VietQR, ghi chú chênh lệch và bấm **Chốt ca**.
  - Hệ thống tự động in **Phiếu chốt ca thu ngân** ra máy in nhiệt lưu trữ tại quầy.
  - Tự động định dạng tin nhắn báo cáo chi tiết (Doanh thu tổng, Tiền mặt, Chuyển khoản, Số đơn, Top món bán chạy) và bắn ngay về nhóm Telegram của Quản lý.

---

## 7. Quy định Phân quyền & Mã PIN Bảo Mật (Security & Access Control)
* **Bảo vệ trang Quản Trị (`admin.html`):**
  - Đăng nhập bảo vệ bằng mã PIN số 4 chữ số. Phân quyền rõ ràng giữa **Quản Lý (Admin - toàn quyền cấu hình)** và **Nhân Viên (Staff - chỉ nhận đơn, pha chế, in bill)**.
* **Cử chỉ bí mật mở Quản Trị từ Menu Khách (`index.html`):**
  - Toàn bộ các nút bấm lộ liễu dẫn vào Quản trị hay Studio đều bị ẩn khỏi trang khách.
  - Nhân viên trực quầy mở trang Quản trị bằng thao tác chạm liên tiếp **5 lần vào logo chữ "P"** ở góc trên bên trái thanh tiêu đề.

---

## 8. Quy chuẩn Đồng bộ Trang Món Nhắm Canvas & Nén Ảnh Tự Động (Bites Canvas Sync & Smart Compression)
* **Đồng bộ Trang Món Nhắm Canvas (`page_bites`):**
  - Trang món nhắm `page_bites` được kết xuất đồng nhất qua bộ máy Canvas `createCustomerElementNode`, bãi bỏ hoàn toàn mã kết xuất tĩnh cũ `renderCustomerBitesPage`.
  - Mọi tinh chỉnh từ Studio: thẻ phối màu đỏ đô (`#940b05`), thẻ xanh navy (`#10234d`), ảnh chụp món tải lên, huy hiệu và tùy chọn món (`variants`, `options`) tự động phản ánh 100% trung thực trên trang menu khách quét.
* **Cơ chế Tự Động Nén Ảnh khi Upload (Client-Side Image Compression):**
  - Mọi thao tác tải ảnh từ máy tính hoặc điện thoại trong Studio (`handleCardImageUpload`, `handleImageUpload`) bắt buộc đi qua hàm nén bất đồng bộ `compressImageFile` (giới hạn tối đa 800px - 1000px, chất lượng JPEG 0.8).
  - Loại bỏ hoàn toàn nguy cơ vượt hạn mức lưu trữ trình duyệt `QuotaExceededError` (5MB của `localStorage`) và giảm kích thước gói tin đồng bộ `ntfy` từ vài Megabytes xuống dưới 50KB, giúp điện thoại khách tải ảnh tức thì.
* **Món Popcorn Chicken Cheese (`b08`):**
  - Ảnh đại diện chính thức lưu tại `assets/canva/popcorn_chicken_cheese.jpg`.
  - Đồng bộ thống nhất trên `data/menu.json`, `data/default_canvas_template.json`, kênh đám mây `ntfy` và hiển thị đầy đủ trên trang menu khách quét.
