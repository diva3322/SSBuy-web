import pandas as pd
import json
import time
import os # 導入 os 模組用於檢查檔案是否存在

# 載入 Excel
df = pd.read_excel("giftcodes.xlsx")

start = time.time()
result = {}

# 1. 嘗試載入現有的 gift-codes-data.json
existing_data = {}
json_file_path = "gift-codes-data.json"
if os.path.exists(json_file_path) and os.path.getsize(json_file_path) > 0:
    try:
        with open(json_file_path, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    except json.JSONDecodeError:
        print(f"警告: {json_file_path} 檔案損壞或為空，將從頭開始建立。")
        existing_data = {}
else:
    print(f"資訊: {json_file_path} 不存在或為空，將從 Excel 數據建立。")

# 複製現有數據到 result，以便後續更新
# 這樣可以保留 Excel 中沒有的遊戲資料 (如果有的話，但你的邏輯似乎是 Excel 為主)
result = existing_data.copy()

for _, row in df.iterrows():
    game_name = str(row["遊戲名稱"]).strip()
    if not game_name or game_name == "nan":
        continue

    # 取得 Excel 中指定的 banner 檔名
    banner_from_excel = str(row.get("橫幅圖片檔名")).strip() if pd.notna(row.get("橫幅圖片檔名")) else ""

    current_game_data = {} # 用於儲存或更新當前遊戲的數據

    # 檢查現有 JSON 中是否有該遊戲的資料
    if game_name in existing_data:
        current_game_data = existing_data[game_name].copy() # 複製現有資料，以便更新
    
    # 決定 banner 路徑的邏輯
    if banner_from_excel:
        # 如果 Excel 欄位有值，就使用 Excel 的值 (無論新舊遊戲，都優先使用 Excel 指定的)
        banner = banner_from_excel
    elif game_name in existing_data and "banner" in existing_data[game_name]:
        # 如果 Excel 欄位為空，但現有 JSON 中有該遊戲且有 banner，則沿用 JSON 中的 banner
        banner = existing_data[game_name]["banner"]
    else:
        # 如果 Excel 欄位為空，且是新遊戲 (不在現有 JSON 中)，則預設使用 -禮包碼.jpg
        # 或者你也可以預設使用 -bar.jpg
        banner = f"giftcodesbanner/{game_name}-禮包碼.jpg" # 或者 f"giftcodesbanner/{game_name}-bar.jpg"

    # 更新或設定遊戲的其他屬性
    description = str(row["介紹"]).strip() if pd.notna(row["介紹"]) else ""
    howto = [
        str(row[col]).strip()
        for col in df.columns if col.startswith("兌換方式") and pd.notna(row[col])
    ]
    codes = []
    for i in range(1, 20):
        code_key = f"禮包碼{i}"
        reward_key = f"內容物{i}"
        if pd.notna(row.get(code_key)) and pd.notna(row.get(reward_key)):
            codes.append({
                "code": str(row[code_key]).strip(),
                "reward": str(row[reward_key]).strip()
            })
    
    # 將所有處理好的數據更新到 current_game_data (而不是直接覆蓋)
    current_game_data["banner"] = banner
    current_game_data["description"] = description
    current_game_data["howTo"] = howto
    current_game_data["codes"] = codes
    
    result[game_name] = current_game_data # 將處理好的當前遊戲數據存入最終結果

# 將最終結果寫入 JSON 檔案
with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

elapsed = round(time.time() - start, 2)
print(f"所有遊戲更新完成 耗時 {elapsed} 秒")