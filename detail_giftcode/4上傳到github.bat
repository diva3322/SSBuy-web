@echo off
rem 設定命令提示字元為 UTF-8 編碼，避免中文訊息變成亂碼
chcp 65001 > nul

rem --- [重要修正] ---
rem 在執行任何 Git 指令前，先將當前路徑切換到上一層的 web 根目錄
pushd "%~dp0..\"

echo.
echo ================================
echo   當前工作目錄已切換至：
cd
echo ================================
echo.

echo [步驟 1/3] 正在加入所有變更...
git add .
echo ✅ 完成！
echo.

rem --- 自動產生時間戳記 ---
SET MyDate=%DATE:~0,4%-%DATE:~5,2%-%DATE:~8,2%
SET MyHour=%TIME:~0,2%
SET MyHour=%MyHour: =0%
SET MyMinute=%TIME:~3,2%
SET TIMESTAMP=%MyDate% %MyHour%:%MyMinute%
rem --- 時間戳記產生完畢 ---

echo [步驟 2/3] 正在提交變更 (Commit Message: "自動更新 @ %TIMESTAMP%")...
git commit -m "自動更新 @ %TIMESTAMP%"
echo ✅ 完成！
echo.

echo [步驟 3/3] 正在推送到 GitHub...
git push origin main
echo.
echo.
echo ================================
echo   🎉 全部流程執行完畢！
echo ================================
echo.

rem 將路徑切換回來 (雖然不是絕對必要，但是個好習慣)
popd

rem 讓視窗暫停，方便您查看執行結果
pause