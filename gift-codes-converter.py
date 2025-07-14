import pandas as pd
import json
import time
import os # 導入 os 模組用於檢查檔案是否存在

# 載入 Excel
try:
    df = pd.read_excel("giftcodes.xlsx")
except FileNotFoundError:
    print("錯誤: 找不到 giftcodes.xlsx 檔案。請確認檔案是否存在於腳本相同目錄。")
    exit() # 如果找不到檔案就直接退出

start = time.time()
result = {}

# 1. 嘗試載入現有的 gift-codes-data.json
existing_data = {}
json_file_path = "gift-codes-data.json"
if os.path.exists(json_file_path) and os.path.getsize(json_file_path) > 0:
    try:
        with open(json_file_path, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
        print(f"資訊: 成功載入現有 {json_file_path} 檔案。")
    except json.JSONDecodeError:
        print(f"警告: {json_file_path} 檔案損壞或為空，將從頭開始建立。")
        existing_data = {}
else:
    print(f"資訊: {json_file_path} 不存在或為空，將從 Excel 數據建立。")

# 複製現有數據到 result，以便後續更新。
# result 將是最終寫入 JSON 的數據。
result = existing_data.copy()

print("\n--- 處理禮包碼數據中 ---")
for _, row in df.iterrows():
    game_name = str(row["遊戲名稱"]).strip()
    if not game_name or game_name == "nan":
        continue

    is_new_game = game_name not in existing_data # 判斷是否為新遊戲

    # 取得 Excel 中指定的 banner 檔名
    banner_from_excel = str(row.get("橫幅圖片檔名")).strip() if pd.notna(row.get("橫幅圖片檔名")) else ""

    current_game_data = {} # 用於儲存或更新當前遊戲的數據
    
    # 如果是現有遊戲，複製其現有資料以進行比較和更新
    if not is_new_game:
        current_game_data = existing_data[game_name].copy()

    # 決定 banner 路徑的邏輯
    if banner_from_excel:
        banner = banner_from_excel
    elif not is_new_game and "banner" in existing_data[game_name]:
        # 如果 Excel 欄位為空，且是現有遊戲，則沿用 JSON 中的 banner
        banner = existing_data[game_name]["banner"]
    else:
        # 如果 Excel 欄位為空，且是新遊戲，則預設使用 -禮包碼.jpg
        banner = f"giftcodesbanner/{game_name}-禮包碼.jpg" 

    # 更新或設定遊戲的其他屬性
    description = str(row["介紹"]).strip() if pd.notna(row["介紹"]) else ""
    howto = [
        str(row[col]).strip()
        for col in df.columns if col.startswith("兌換方式") and pd.notna(row[col])
    ]
    codes = []
    for i in range(1, 20): # 假設禮包碼最多20組
        code_key = f"禮包碼{i}"
        reward_key = f"內容物{i}"
        if pd.notna(row.get(code_key)) and pd.notna(row.get(reward_key)):
            codes.append({
                "code": str(row[code_key]).strip(),
                "reward": str(row[reward_key]).strip()
            })
    
    # 將所有處理好的數據更新到 current_game_data
    # 在寫入 result 之前，先創建一個新的字典來比較，以判斷是否有變化
    new_processed_data = {
        "banner": banner,
        "description": description,
        "howTo": howto,
        "codes": codes
    }

    if is_new_game:
        result[game_name] = new_processed_data
        print(f"✅ 遊戲 '{game_name}' 禮包碼資料已新增完成。")
    else:
        # 比較新處理的數據和現有數據是否有實質變化
        # 注意: 列表比較需要考慮順序，這裡使用 sorted(json.dumps) 來確保可比較性
        # 或者您可以逐項比較 banner, description, howTo, codes
        
        # 為了更精確且不依賴序列化順序，我們逐項比較
        has_changed = False
        if new_processed_data["banner"] != current_game_data.get("banner"):
            has_changed = True
        if new_processed_data["description"] != current_game_data.get("description"):
            has_changed = True
        
        # 比較 howTo 列表 (需要考慮元素內容和順序)
        if new_processed_data["howTo"] != current_game_data.get("howTo"):
            has_changed = True

        # 比較 codes 列表 (列表內部是字典，需要更複雜的比較，例如排序後比較 JSON 字符串)
        # 為了穩健，將其序列化並排序後比較
        old_codes_str = json.dumps(sorted(current_game_data.get("codes", []), key=lambda x: (x.get('code', ''), x.get('reward', ''))), ensure_ascii=False)
        new_codes_str = json.dumps(sorted(new_processed_data["codes"], key=lambda x: (x.get('code', ''), x.get('reward', ''))), ensure_ascii=False)
        
        if old_codes_str != new_codes_str:
            has_changed = True

        if has_changed:
            result[game_name] = new_processed_data # 更新 result 中的資料
            print(f"🔄 遊戲 '{game_name}' 禮包碼資料已更新完成。") # 使用不同的符號表示更新

# 將最終結果寫入 JSON 檔案
with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

elapsed = round(time.time() - start, 2)
print(f"\n✅ gift-codes-data.json 數據更新完成！耗時 {elapsed} 秒")