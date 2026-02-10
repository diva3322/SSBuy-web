@echo off
rem 設定命令提示字元為 UTF-8 編碼，避免中文訊息變成亂碼
chcp 65001 > nul

echo.
echo ==========================================================
echo             SSBUY 網站自動化更新腳本
echo ==========================================================
echo.

echo --- [步驟 1/5] 正在從 gamedata.xlsx 產生最新的 JSON 檔案... ---
py convert-excel-to-json.py
echo ✅ JSON 檔案產生完畢！
echo.

echo --- [步驟 2/5] 正在從 JSON 檔案產生所有靜態網頁... ---
node create_pages.js
echo ✅ 所有網頁產生完畢！
echo.

echo --- [步驟 3/5] 正在自動修正圖片 CLS (寫入寬高)... ---
rem 這裡是新加入的指令
py fix_image_sizes.py
echo ✅ 圖片尺寸修正完畢！
echo.

echo --- [步驟 4/5] 正在產生最新的 Sitemap.xml... ---
node create-sitemap.js
echo ✅ Sitemap 產生完畢！
echo.

echo --- [步驟 5/5] 正在將所有變更上傳到 GitHub... ---

rem --- 將路徑切換到 web 根目錄 ---
pushd "%~dp0..\"

git add .

rem --- 自動產生時間戳記 ---
SET MyDate=%DATE:~0,4%-%DATE:~5,2%-%DATE:~8,2%
SET MyHour=%TIME:~0,2%
SET MyHour=%MyHour: =0%
SET MyMinute=%TIME:~3,2%
SET TIMESTAMP=%MyDate% %MyHour%:%MyMinute%

git commit -m "網站內容自動更新 @ %TIMESTAMP%"
git push origin main

rem --- 將路徑切換回來 ---
popd

echo.
echo ==========================================================
echo   🎉 恭喜！所有檔案已成功推送到 GitHub。
echo   請稍待 1-5 分鐘，GitHub Actions 會自動完成網站部署。
echo ==========================================================
echo.

pause