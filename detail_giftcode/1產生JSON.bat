@echo off
chcp 65001 > nul
echo 正在從 gamedata.xlsx 產生最新的 JSON 檔案...
py convert-excel-to-json.py
echo.
echo 任務完成！
pause