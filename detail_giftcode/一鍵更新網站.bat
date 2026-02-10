@echo off
rem 設定命令提示字元為 UTF-8 編碼
chcp 65001 > nul

echo.
echo ==========================================================
echo       SSBUY 網站自動化更新腳本 (WebP + CLS 完美版)
echo ==========================================================
echo.

echo --- [步驟 1/6] 正在將 Excel 轉換為 JSON... ---
py convert-excel-to-json.py
echo ✅ JSON 資料準備完成。
echo.

echo --- [步驟 2/6] 正在生成靜態網頁 (HTML)... ---
node create_pages.js
echo ✅ 初始網頁生成完畢。
echo.

echo --- [步驟 3/6] 正在將特定資料夾圖片轉為 WebP... ---
rem 只掃描 images 和 giftcodesbanner 資料夾
py convert_to_webp.py
echo ✅ WebP 轉檔完畢。
echo.

echo --- [步驟 4/6] 正在注入 WebP 路徑並修正圖片尺寸... ---
rem 這步會解決 CLS 問題並替換成 WebP
py fix_image_sizes.py
echo ✅ HTML 優化完畢 (CLS Fixed)！
echo.

echo --- [步驟 5/6] 正在生成 Sitemap... ---
node create-sitemap.js
echo ✅ Sitemap 更新完畢。
echo.

echo --- [步驟 6/6] 正在上傳至 GitHub... ---
pushd "%~dp0..\"
git add .
SET MyDate=%DATE:~0,4%-%DATE:~5,2%-%DATE:~8,2%
SET MyHour=%TIME:~0,2%
SET MyHour=%MyHour: =0%
SET MyMinute=%TIME:~3,2%
SET TIMESTAMP=%MyDate% %MyHour%:%MyMinute%

git commit -m "Auto Update (WebP + CLS Fix) @ %TIMESTAMP%"
git push origin main
popd

echo.
echo ==========================================================
echo   🎉 大功告成！網站已更新為全 WebP 高速版本。
echo   請稍待 GitHub Actions 完成部署。
echo ==========================================================
echo.

echo 請按任意鍵退出程式...
pause >nul
exit