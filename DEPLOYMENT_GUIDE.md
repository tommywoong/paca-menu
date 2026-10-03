# HƯỚNG DẪN TRIỂN KHAI ONLINE & QUY TRÌNH DUYỆT CẬP NHẬT NHANH CHO PACA

Tài liệu hướng dẫn quản trị viên đưa website PACA lên Online và quy trình cập nhật nhanh nhất mỗi khi có thay đổi.

---

## I. CÁCH KẾT NỐI VÀ UPLOAD LÊN ONLINE LẦN ĐẦU (CHỌN 1 TRONG 2 CÁCH)

### CÁCH 1: Dùng Lệnh 1-Chạm Siêu Nhanh (Không Cần Tạo GitHub Ngay)

Hệ thống đã tích hợp sẵn 2 công cụ dòng lệnh **Cloudflare Pages** (`wrangler`) và **Vercel** (`vercel`):

1. **Upload bản Xem Thử (Preview):**
   - Nhấp đúp vào tệp `deploy-preview.bat` trong thư mục `D:\paca`.
   - Chọn phím `1` (Cloudflare Pages) hoặc `2` (Vercel).
   - Trình duyệt sẽ mở một tab nhỏ để bạn bấm cấp quyền đăng nhập (chỉ cần làm 1 lần đầu).
   - Sau 15 - 30 giây, hệ thống sẽ in ra một đường link xem thử (ví dụ: `https://preview.paca-menu.pages.dev`).

2. **Upload bản Chính Thức (Production cho khách quét QR):**
   - Nhấp đúp vào tệp `deploy-production.bat`.
   - Chọn phím `1` hoặc `2`.
   - Toàn bộ menu online chính thức sẽ cập nhật ngay lập tức.

---

### CÁCH 2: Kết Nối Qua GitHub (Chuẩn Chuyên Nghiệp & Tự Động Hoá 100%)

Hệ thống đã liên kết với repository GitHub:
- **Repository:** `https://github.com/tommywoong/paca-menu.git`
- **Nhánh chính (Production):** `main`
- **Nhánh thử nghiệm (Preview):** `preview`

Lệnh đẩy mã nguồn thủ công từ Terminal / PowerShell:
```bash
git add .
git commit -m "Cập nhật menu PACA"
git push origin main
git push origin main:preview
```

---

## II. GẮN TÊN MIỀN RIÊNG CHO QUÁN (CUSTOM DOMAIN)

Sau khi có link chạy trực tuyến:
- Bạn có thể gắn tên miền riêng bất kỳ (ví dụ: `menu.pacabar.vn`, `qr.pacabar.com`, hoặc `pacabar.vn`).
- Vào Cloudflare Pages hoặc Vercel ➜ Chọn mục **Custom Domains** ➜ Nhập tên miền của quán.
- Hệ thống sẽ hướng dẫn trỏ 1 bản ghi CNAME hoặc DNS duy nhất. Chứng chỉ bảo mật xanh **HTTPS/SSL** sẽ được cấp tự động miễn phí vĩnh viễn.

---

## III. QUY TRÌNH "CHỈNH SỬA NHANH & GỬI DUYỆT" SAU NÀY

Mỗi khi bạn cần chỉnh sửa menu, hãy áp dụng quy trình 3 bước sau:

```
[BẠN GỬI YÊU CẦU] ──▶ [AI CHỈNH SỬA & TEST PLAYWRIGHT] ──▶ [ĐẨY LÊN LINK PREVIEW]
                                                                     │
[BẢN CHÍNH THỨC LIVE (15s)] ◀─── [BẠN XEM ẢNH/LINK & DUYỆT "OK"] ────┘
```

1. **Bạn gửi yêu cầu cho AI:**
   - Ví dụ: *"Đổi giá món b01 thành 75k, thay ảnh món b07, thêm khuyến mãi giờ vàng"*.
2. **AI thực hiện & tự động kiểm tra:**
   - AI sửa code, chạy kiểm thử tự động trên màn hình điện thoại (Playwright iPhone 390×844) để đảm bảo không bị lỗi giao diện.
   - AI đẩy lên link **Preview**.
3. **AI gửi báo cáo nghiệm thu cho bạn:**
   - Gửi **link Preview trực tiếp** để bạn bấm vào lướt menu trên điện thoại cá nhân.
   - Gửi **ảnh chụp thực tế** các vị trí đã chỉnh sửa.
   - Tóm tắt các điểm đã sửa.
4. **Bạn duyệt:**
   - Bạn nhắn: *"OK"*, *"Duyệt"* hoặc *"Lên bản chính"*.
   - AI chạy lệnh phát hành lên Production trong **15 - 30 giây**. Khách tại quán quét QR sẽ tự động thấy bản mới nhất mà không bị mất dữ liệu đơn hàng.

---

## IV. LƯU Ý KHI QUẢN LÝ MENU HÀNG NGÀY (KHÔNG CẦN CAN THIỆP CODE)

Đối với các tác vụ thường ngày tại quán, bạn và nhân viên có thể thao tác tức thì ngay trên điện thoại qua màn hình **PACA ADMIN** (`/admin.html`):
- **Bật/Tắt còn món hoặc hết món:** Bấm công tắc gạt ngay trong trang quản trị.
- **Đổi giá / Đổi tên / Thêm món mới:** Mở form Sửa/Thêm món trên Admin, bấm Lưu là menu khách cập nhật ngay.
- **Tạo danh mục / Ẩn hiện danh mục:** Dùng tab "Quản Lý Danh Mục" đã tích hợp.
- **Tùy biến poster đồ hoạ Canva:** Dùng trình biên tập **Canva Studio** (`/studio.html`) và bấm **Xuất Bản Menu**.

---

## V. CƠ CHẾ CHỐNG LƯU ĐỆM KHI MỞ LINK TỪ ZALO & MOBILE WEBVIEW

1. **Hiện tượng Cache trên Zalo:**
   - Khi mở link trực tiếp từ khung chat Zalo, Zalo sử dụng trình duyệt nhúng nội bộ (In-App WebView). WebView này có cơ chế lưu đệm các file script rất chặt chẽ để tăng tốc độ tải.
2. **Giải pháp kỹ thuật của hệ thống:**
   - Toàn bộ các file JavaScript lõi (`paca_core.js`, `paca_canvas.js`) đều được gắn mã phiên bản chống cache (ví dụ: `?v=20261003_2125`).
   - Thẻ `<head>` trang khách tích hợp bộ chỉ thị `Cache-Control: no-cache, no-store, must-revalidate` và `Pragma: no-cache`.
   - Hàm khởi tạo `init()` trong `paca_core.js` tự động kiểm tra phiên bản; nếu phiên bản mới hơn bản lưu trong điện thoại, hệ thống sẽ tự động dọn sạch bộ nhớ đệm `localStorage` cũ và tải bản mới nhất từ máy chủ.
3. **Thao tác nhanh trên Zalo nếu muốn ép làm mới tức thì:**
   - Chạm vào biểu tượng **`...` (3 dấu chấm)** ở góc trên bên phải màn hình Zalo.
   - Chọn **"Tải lại" / "Làm mới"** (hoặc đóng tab và bấm lại link).
