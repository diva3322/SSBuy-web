@echo off
rem 這行指令會將文字編碼切換為 UTF-8，解決中文亂碼問題
chcp 65001 > nul

echo.
echo =================================
echo   正在為您執行網頁產生腳本...
echo =================================
echo.
node create_pages.js
echo.
echo =================================
echo   任務完成！請查看 "dist" 資料夾。
echo =================================
echo.
pause