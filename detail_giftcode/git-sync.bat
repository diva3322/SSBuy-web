@echo off
chcp 65001 > nul

rem --- 先將路徑切換到 web 根目錄 ---
pushd "%~dp0..\"

echo.
echo ===================================
echo   正在從 GitHub 同步雲端上的變更...
echo ===================================
echo.
git pull origin main

echo.
echo ===================================
echo   ✅ 同步完成！
echo ===================================
echo.

popd
pause