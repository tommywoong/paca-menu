# 🍸 HỆ THỐNG GỌI MÓN QR & QUẢN TRỊ QUÁN BAR PACA (ĐÀ LẠT)

Hệ thống được thiết kế theo mô hình **Tiny Cozy Bar**, tối ưu hóa **100% trên điện thoại di động** cho cả khách hàng và thu ngân/chủ quán, **không phụ thuộc vào máy tính bàn**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Khách Quét QR Tự Đặt Món (`index.html`)**:
   - Giao diện phong cách **Retro Vintage Cozy Bar** chuẩn nhận diện thương hiệu PACA (Navy, Đỏ cổ điển, Be kem).
   - Tự động nhận diện số bàn từ mã QR (`?table=B01`, `?table=BAR02`...).
   - Thực đơn đầy đủ bóc tách từ Canva: *Menu of the week*, *Bites & Snacks*, *Cocktails*, *Mocktails*, *Bia & Tepache*, *Wine & Shots*.
   - Cho phép thêm ghi chú cho từng món (*ít đá, ít ngọt, không cay...*).
   - **Chức năng yêu cầu món ngoài menu (Off-menu)**: Khách có thể tự nhập món cocktail yêu thích theo tinh thần *"If you want something off-menu, just ask!"*.
   - Đặt xong hiển thị ngay **Mã VietQR động** đúng số tiền để khách thanh toán chuyển khoản liền tay.

2. **Quản Trị Thu Ngân & Bar Mobile-First (`admin.html`)**:
   - **Đơn Hàng Realtime**: Phát chuông ting-ting rộn rã khi có đơn mới. Đổi trạng thái: *Chờ xử lý ➜ Đang làm ➜ Đã thanh toán*.
   - **In Bill Thu Ngân (Cashier)**: Đầy đủ tên món, đơn giá, tổng tiền và **Mã VietQR tự động** in ngay trên hóa đơn để khách quét.
   - **In Phiếu Bếp / Bar**: Tách phiếu đồ ăn cho Bếp, đồ uống cho Bar, **giấu hoàn toàn giá tiền** để quầy tập trung làm món.
   - **Quản Lý Bàn & QR Studio**:
     - Thêm/sửa/xóa bàn linh hoạt.
     - Tạo mã QR tức thì cho từng bàn.
     - Nút tải ảnh PNG để gửi in bảng mica / decal.
     - Nút in tem QR dán bàn trực tiếp ra máy in nhiệt khổ 80mm!
   - **Tạo & Điều Chỉnh Menu Bằng Tay**:
     - Thêm món mới bằng tay (*Tên món, tên tiếng Việt, giá, phân loại Bar hay Bếp, mô tả song ngữ, thành phần, huy hiệu*).
     - Công tắc bật/tắt **"Còn món / Hết món"** 1 chạm.
     - Xuất/nhập file JSON để sao lưu hoặc thay đổi thực đơn theo mùa.
   - **Thống Kê Doanh Thu**: Doanh thu hôm nay, tuần này, tháng này, top 5 món bán chạy nhất.
   - **Cài Đặt Hệ Thống Trực Quan**: Cấu hình Ngân hàng VietQR, Máy in nhiệt K80/K58, Bot Telegram chỉ trong vài giây.

---

## 🚀 HƯỚNG DẪN ĐƯA LÊN HOSTING MIỄN PHÍ VĨNH VIỄN (0 ĐỒNG)

Hệ thống được thiết kế dạng **Static Jamstack PWA**, bạn có thể đưa lên hosting miễn phí chạy trọn đời với tốc độ cực nhanh:

### Cách tốt nhất: Cloudflare Pages (Miễn phí 100%, Băng thông vô hạn, Tốc độ VN cực nhanh)
1. Đăng ký tài khoản miễn phí tại [cloudflare.com](https://pages.cloudflare.com/).
2. Vào mục **Workers & Pages** ➜ **Create application** ➜ **Pages** ➜ **Upload assets**.
3. Kéo toàn bộ thư mục `D:\paca` thả vào trình duyệt.
4. Bấm **Deploy**. Bạn sẽ nhận ngay một địa chỉ web miễn phí dạng: `https://paca-bar.pages.dev`.
5. Đổi tên miền phụ hoặc gắn tên miền riêng bất kỳ lúc nào hoàn toàn miễn phí.

---

## 🖨️ HƯỚNG DẪN IN BILL TỪ ĐIỆN THOẠI (KHÔNG CẦN MÁY TÍNH)

1. Đảm bảo điện thoại của bạn đang kết nối chung mạng **Wi-Fi** với máy in nhiệt tại quán.
2. Trên trang `admin.html`, khi bấm nút **"🖨️ In Bill Thu Ngân"** hoặc **"🍳 In Bếp"**:
   - **Trên iPhone (iOS):** Trình duyệt Safari sẽ mở hộp thoại AirPrint/In mạng, chọn máy in nhiệt và bấm **In**.
   - **Trên Android:** Chọn máy in nhiệt qua dịch vụ in mặc định hoặc cài app miễn phí **RawBT Print Service** để in 1-chạm cực nhanh.
3. Trong mục **Cài Đặt** trên web, bạn có thể chọn khổ giấy **K80 (80mm)** hoặc **K58 (58mm)** tùy theo máy in đang có.

---

## ✈️ HƯỚNG DẪN CẤU HÌNH BOT TELEGRAM (TRONG 1 PHÚT)

1. Mở Telegram, tìm bot **`@BotFather`** và gửi lệnh `/newbot`.
2. Đặt tên cho bot (ví dụ: `Paca Bar Order Bot`) và username kết thúc bằng `bot` (ví dụ: `PacaBarOrder_bot`).
3. Copy đoạn **HTTP API Token** nhận được (dạng: `789456123:AAH_xxx...`).
4. Để lấy Chat ID của bạn: Tìm bot **`@userinfobot`** và bấm Start, copy dãy số **Id** của bạn (ví dụ: `987654321`).
5. Mở `admin.html` ➜ Vào tab **Cài Đặt** ➜ Dán Token và Chat ID vào ➜ Tích chọn **Bật thông báo** ➜ Bấm nút **"Gửi tin nhắn thử nghiệm"** để kiểm tra!
