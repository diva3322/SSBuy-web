@echo off
rem 切換為 UTF-8 編碼以正確顯示中文
chcp 65001 > nul

echo 正在為您產生最新的 Sitemap...
node create-sitemap.js
echo.
echo 任務完成！sitemap.xml 已經儲存到 web 資料夾中。
pause