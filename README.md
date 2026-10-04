# 🍸 HỆ THỐNG GỌI MÓN QR & QUẢN TRỊ QUÁN BAR PACA (ĐÀ LẠT)

Hệ thống được thiết kế theo mô hình **Tiny Cozy Bar**, tối ưu hóa **100% trên điện thoại di động** cho cả khách hàng và thu ngân/chủ quán, **không phụ thuộc vào máy tính bàn**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Khách Quét QR Tự Đặt Món (`index.html`)
- **Giao diện Retro Vintage Cozy Bar**: Tái hiện trọn vẹn phong cách Canva thẩm mỹ cao (Navy `#10234d`, Đỏ mận `#940b05`, Be kem `#f6dcaf`).
- **Tự động nhận diện bàn**: Tự động nhận diện số bàn từ mã QR (`?table=1`, `?t=BAR02`...).
- **Hai chế độ xem linh hoạt**:
  - **Chế độ Poster Canvas Dài (Mặc định)**: Tương tác chạm mở chi tiết món, hiển thị hình ảnh món ăn sắc nét, hiệu ứng lướt mượt mà.
  - **Chế độ Danh sách Tiêu chuẩn**: Có ô tìm kiếm món ăn nhanh và lọc theo tên tiếng Việt/Anh.
- **Tự động lọc danh mục thông minh**:
  - Khi danh mục bị **Ẩn** hoặc **Xóa** ở Quản Trị, nút liên kết trên Trang Bìa Poster lập tức biến mất, các nút còn lại tự động dãn đều vị trí.
  - Các món thuộc danh mục bị ẩn hoàn toàn bị loại khỏi menu và tìm kiếm.
- **Chống lưu đệm (Anti-Caching) tối ưu cho Zalo & Mobile WebView**:
  - Gắn đuôi định danh phiên bản `?v=...` trên toàn bộ tệp script.
  - Thẻ `Cache-Control: no-cache` và cơ chế tự động làm sạch `localStorage` cũ khi mở từ Zalo In-App Browser.
- **Yêu cầu món ngoài menu (Off-menu)**: Cho phép khách tự yêu cầu đồ uống cocktail theo sở thích cá nhân.
- **Thanh toán VietQR động**: Hiển thị ngay mã QR ngân hàng đúng số tiền đơn hàng để khách chuyển khoản tức thì.
- **Cử chỉ bí mật mở Quản Trị**: Chạm liên tiếp 5 lần vào logo chữ "P" ở thanh tiêu đề để đăng nhập Quản Trị (ẩn hoàn toàn nút quản trị đối với khách).

---

### 2. PACA Studio Canvas Editor (`studio.html`)
- **Trình chỉnh sửa Canvas kéo-thả chuyên nghiệp**:
  - Thiết kế nhiều trang Canvas độc lập (Trang Bìa, Cocktail, Bites, Craft Beer, Wine & Shots...).
  - Hỗ trợ đổi nền, ảnh bìa, tỷ lệ co giãn phản hồi (Responsive 800px Base).
- **Hệ thống thẻ món đa sắc (Multi-Color Themes)**:
  - 4 bộ màu phong cách: **Navy Blue**, **Crimson Red**, **Retro White**, **Emerald Green**.
  - Tự động phối màu so le xen kẽ (Auto-alternating) và nút đổi màu 1-chạm.
- **Gán món thông minh (1-Click Product Binding)**:
  - Gán trực tiếp món từ menu Quản trị vào thẻ trên Canvas. Tự động đồng bộ tên song ngữ, hình ảnh món, huy hiệu và giá tiền.
- **Tự động đồng bộ Trang Bìa (Cover Page Synchronizer)**:
  - Nút đồng bộ tự động đọc danh mục hoạt động từ Quản Trị và căn đều các nút điều hướng trên Trang Bìa.
- **Tự động nới rộng trang (Auto-stretch Height)**:
  - Tự động kéo dãn chiều cao trang khi thêm món mới ở cuối trang mà không đè lên câu trích dẫn hoặc chân trang.
- **Nén ảnh thông minh khi upload (Client-Side Smart Compression)**:
  - Tự động nén ảnh tải lên từ máy tính/điện thoại qua `<canvas>` ẩn (max 800px-1000px, JPEG 0.8), loại bỏ nguy cơ tràn bộ nhớ `localStorage` và tăng tốc độ tải trang.
- **Đồng bộ Đám mây 1-chạm (Cloud Sync Publish)**:
  - Xuất bản thiết kế mới nhất tức thì tới tất cả điện thoại khách quét qua `ntfy.sh/paca_design_sync_dalat_2025` (chuẩn hóa đồng bộ 100% tất cả các trang, bao gồm Món Nhắm - Bites & Popcorn Chicken Cheese).

---

### 3. Quản Trị Thu Ngân & Pha Chế Mobile-First (`admin.html`)
- **Đơn Hàng Realtime & Bàn Mở (Running Tabs)**:
  - Khách gọi thêm món nhiều đợt tự động gộp vào phiên bàn đang mở.
  - Đổi trạng thái: *Chờ xử lý ➜ Đang pha chế / làm bếp ➜ Đã ra món ➜ Đã thanh toán*.
  - Chuông báo âm thanh ting-ting khi có đơn mới từ khách.
- **Thanh Toán Tiền Mặt & VietQR**:
  - Hộp thoại thanh toán tiền mặt với các nút mệnh giá nhanh (50k, 100k, 200k, 500k) và tự động tính tiền thừa trả khách.
  - Mã VietQR động cho thu ngân quét nhận tiền.
- **In Phiếu Nhiệt Trực Tiếp (ESC/POS Printing)**:
  - In Bill Thu Ngân (kèm mã VietQR).
  - In Phiếu Bếp / Quầy Bar (tự động giấu giá tiền).
  - In tem mã QR dán bàn khổ K80/K58.
- **Chốt Ca Kinh Doanh Cuối Ngày (Daily Shift Close)**:
  - Kiểm đếm tiền mặt, đối soát chuyển khoản VietQR, ghi chú chênh lệch.
  - Tự động in Phiếu chốt ca thu ngân lưu quầy.
  - Tự động bắn báo cáo ca kinh doanh về nhóm Telegram của Quản lý.
- **Quản Lý Bàn & QR Studio**:
  - Thêm, sửa, xóa bàn; tải ảnh mã QR PNG chất lượng cao.
- **Quản Lý Thực Đơn & Kho Món**:
  - Quản lý danh mục (Bật/Tắt Hiện/Ẩn, Trang Bìa, Thanh Nav, sắp xếp thứ tự).
  - Thêm món mới, tải ảnh món ăn, thiết lập giá vốn, theo dõi tồn kho.
  - Công tắc "Còn món / Hết món" 1-chạm.
- **Phân Quyền Mã PIN Bảo Mật**:
  - Mã PIN 4 số phân quyền: **Quản Lý** (toàn quyền) và **Nhân Viên** (nhận đơn, in bill, pha chế).

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI ONLINE & CẬP NHẬT

### 1. Triển khai qua GitHub & Cloudflare Pages (Tự động 100%)
- Mã nguồn được đồng bộ trực tiếp lên GitHub: `https://github.com/tommywoong/paca-menu.git` (nhánh `main` và `preview`).
- Cloudflare Pages / Workers tự động lấy mã nguồn mới mỗi khi đẩy commit lên GitHub.

### 2. Triển khai 1-Chạm bằng Batch Script
- `deploy-preview.bat`: Đẩy bản xem thử lên Cloudflare / Vercel.
- `deploy-production.bat`: Đẩy bản chính thức phục vụ khách hàng.

---

## 🖨️ HƯỚNG DẪN IN BILL TỪ ĐIỆN THOẠI
1. Đảm bảo điện thoại kết nối chung Wi-Fi với máy in nhiệt tại quán.
2. Bấm nút **"🖨️ In Bill Thu Ngân"** hoặc **"🍳 In Bếp"**:
   - **iOS (iPhone/iPad):** Chọn máy in qua hộp thoại AirPrint mặc định.
   - **Android:** In qua dịch vụ in mặc định hoặc ứng dụng **RawBT Print Service**.
3. Cài đặt khổ giấy K80 (80mm) hoặc K58 (58mm) trong mục Cài Đặt.

---

## ✈️ CẤU HÌNH BOT TELEGRAM
1. Tạo bot qua `@BotFather` trên Telegram, copy Token API.
2. Lấy Chat ID nhóm hoặc cá nhân qua `@userinfobot`.
3. Nhập Token và Chat ID vào mục **Cài Đặt** trong `admin.html`, bấm **Lưu & Thử nghiệm**.
