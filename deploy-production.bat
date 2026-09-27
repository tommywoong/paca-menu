@echo off
chcp 65001 >nul
echo ========================================================
echo   PACA MENU - TRIỂN KHAI BẢN CHÍNH THỨC (PRODUCTION LIVE)
echo ========================================================
echo.
echo [CẢNH BÁO] Thao tác này sẽ cập nhật trực tiếp Menu đang chạy
echo            cho khách quét mã QR tại các bàn ở quán PACA!
echo.
set /p confirm="Bạn có chắc chắn muốn phát hành chính thức? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Đã hủy thao tác.
    pause
    exit /b
)

echo.
echo [1/2] Đang cập nhật trạng thái git...
git add .
git commit -m "Production release: %date% %time%" 2>nul
echo.
echo [2/2] Chọn phương thức phát hành Production:
echo   1. Deploy nhanh trực tiếp qua Cloudflare Pages (Production)
echo   2. Deploy nhanh qua Vercel (Production)
echo   3. Đẩy nhánh 'main' lên GitHub
echo   0. Thoát
echo.
set /p opt="Nhập lựa chọn của bạn (1/2/3/0): "

if "%opt%"=="1" (
    echo.
    echo [*] Đang tải lên Cloudflare Pages (Production)...
    npx wrangler pages deploy . --project-name=paca-menu --branch=main
    echo.
    echo [THÀNH CÔNG] Menu khách hàng trực tuyến đã cập nhật bản mới nhất!
    pause
    exit /b
)

if "%opt%"=="2" (
    echo.
    echo [*] Đang tải lên Vercel Production...
    npx vercel --prod
    echo.
    echo [THÀNH CÔNG] Menu khách hàng trực tuyến đã cập nhật bản mới nhất!
    pause
    exit /b
)

if "%opt%"=="3" (
    echo.
    echo [*] Đang đẩy code lên GitHub (nhánh main)...
    git push origin main
    echo.
    echo [THÀNH CÔNG] Đã đẩy lên GitHub! Hệ thống CI/CD sẽ tự động cập nhật bản Live sau 30s.
    pause
    exit /b
)

echo Đã hủy thao tác.
pause
