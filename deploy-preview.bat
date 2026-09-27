@echo off
chcp 65001 >nul
echo ========================================================
echo   PACA MENU - TRIỂN KHAI BẢN XEM THỬ (PREVIEW / STAGING)
echo ========================================================
echo.
echo [1/2] Đang kiểm tra trạng thái Git...
git status -s
echo.
echo [2/2] Chọn phương thức tải lên Preview:
echo   1. Deploy nhanh trực tiếp qua Cloudflare Pages (Khuyên dùng)
echo   2. Deploy nhanh qua Vercel
echo   3. Đẩy nhánh 'preview' lên GitHub
echo   0. Thoát
echo.
set /p opt="Nhập lựa chọn của bạn (1/2/3/0): "

if "%opt%"=="1" (
    echo.
    echo [*] Đang tải lên Cloudflare Pages (nhánh preview)...
    npx wrangler pages deploy . --project-name=paca-menu --branch=preview
    echo.
    echo [OK] Hoàn tất! Vui lòng copy đường link Preview ở trên và gửi duyệt.
    pause
    exit /b
)

if "%opt%"=="2" (
    echo.
    echo [*] Đang tải lên Vercel Preview...
    npx vercel
    echo.
    echo [OK] Hoàn tất! Vui lòng copy đường link Preview ở trên và gửi duyệt.
    pause
    exit /b
)

if "%opt%"=="3" (
    echo.
    echo [*] Đang đẩy code lên GitHub (nhánh preview)...
    git push origin preview
    echo.
    echo [OK] Đã đẩy lên GitHub! Hệ thống CI/CD sẽ tự động cập nhật link Preview trong 30s.
    pause
    exit /b
)

echo Đã hủy thao tác.
pause
