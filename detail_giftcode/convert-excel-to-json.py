import pandas as pd
import json
import os
import urllib.parse

# --- 檔案路徑設定 ---
EXCEL_FILE_PATH = os.path.join('data', 'gamedata.xlsx')
GAMES_JSON_PATH = os.path.join('data', 'games.json')
GIFT_CODES_JSON_PATH = os.path.join('data', 'gift-codes-data.json')

# ==============================================================================
# 步驟 1: 定義處理「禮包碼」工作表的函數
# ==============================================================================
def process_gift_codes():
    print("\n--- [階段 1/2] 正在處理禮包碼資料... ---")
    try:
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='gift_codes')
        df = df.fillna('')
        output_data = {}
        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue

            # --- [修改重點] 智慧型 Banner 圖片處理邏輯 ---
            # 1. 優先讀取「橫幅圖片」欄位
            banner_path = str(row.get('橫幅圖片', '')).strip()
            # 2. 如果是空的，才去讀取「橫幅圖片檔名」
            if not banner_path:
                banner_path = str(row.get('橫幅圖片檔名', '')).strip()

            # 3. 判斷最終路徑
            if not banner_path:
                # 如果兩個欄位都為空，則使用預設路徑
                final_banner_path = f"giftcodesbanner/{game_name}.jpg"
            elif banner_path.startswith('giftcodesbanner/'):
                # 如果內容已經是 'giftcodesbanner/...' 開頭，就直接使用
                final_banner_path = banner_path
            else:
                # 如果內容只是檔名，就自動在前面加上 'giftcodesbanner/'
                final_banner_path = f"giftcodesbanner/{banner_path}"
            # --- [修改重點結束] ---            
            
            how_to_methods = [str(row.get(f'兌換方式{i}', '')).strip() for i in range(1, 7) if str(row.get(f'兌換方式{i}', '')).strip()]
            
            codes_list = []
            for i in range(1, 21):
                code = str(row.get(f'禮包碼{i}', '')).strip()
                reward = str(row.get(f'內容物{i}', '')).strip()
                if code:
                    codes_list.append({"code": code, "reward": reward})
            game_obj = {
                "banner": final_banner_path, "description": str(row.get('介紹', '')).strip(),
                "howTo": how_to_methods, "codes": codes_list
            }
            output_data[game_name] = game_obj
        with open(GIFT_CODES_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"✅ gift-codes-data.json 檔案已成功生成！")
    except Exception as e:
        print(f"❌ 處理禮包碼資料時發生錯誤: {e}")

# ==============================================================================
# 步驟 2: 定義處理「遊戲主資料」工作表的函數
# ==============================================================================
def process_games():
    print("\n--- [階段 2/2] 正在處理遊戲主資料... ---")
    try:
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='games')
        df = df.fillna('')
        
        # 讀取現有的 games.json 作為備份
        existing_data = {}
        if os.path.exists(GAMES_JSON_PATH) and os.path.getsize(GAMES_JSON_PATH) > 0:
            try:
                with open(GAMES_JSON_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = {}
        
        output_data = {}

        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue

            # --- [修改重點] 智慧更新社群連結的邏輯 ---
            # 1. 先從舊的 JSON 檔案中取得該遊戲現有的社群連結 (如果有的話)
            existing_socials = existing_data.get(game_name, {}).get('social', {})

            # 2. 定義要處理的社群媒體和對應的 Excel 欄位名稱
            social_map = {
                "Facebook": "Facebook",
                "官方網站": "官方網站",
                "App Store": "App Store",
                "Google Play": "GooglePlay",
                "禮包碼": "禮包碼"
            }
            
            social_links = {}
            for key, excel_col in social_map.items():
                # 從 Excel 讀取新值
                new_value = str(row.get(excel_col, '')).strip()
                # 從舊 JSON 讀取舊值
                old_value = existing_socials.get(key, '')
                # 如果新值不是空的，就用新值；否則，沿用舊值
                social_links[key] = new_value if new_value else old_value

            # 如果禮包碼連結仍然是空的，自動產生一個
            if not social_links.get("禮包碼"):
                social_links["禮包碼"] = f"gift-codes.html?game={urllib.parse.quote(game_name)}"
            # --- [修改重點結束] ---

            logo_path_from_excel = str(row.get('Logo', '')).strip()
            final_logo_path = logo_path_from_excel if logo_path_from_excel else f"images/{game_name}.jpg"

            products_list = []
            for i in range(1, 16):
                p_name = str(row.get(f'商品{i}名稱', '')).strip()
                p_price_raw = row.get(f'商品{i}價格', '') # 直接讀取原始值
                
                # [修改重點] 只要商品名稱存在，就加入列表，不再檢查價格是否為數字
                if p_name:
                    products_list.append({
                        "name": p_name, 
                        "price": str(p_price_raw).strip() # 將價格直接當作字串處理
                    })

            game_obj = {
                "logo": final_logo_path,
                "description": str(row.get('簡介', '')).strip(),
                "products": products_list,
                "social": social_links,
                "canonical_url": str(row.get('canonical_url', '')).strip()
            }
            output_data[game_name] = game_obj

        with open(GAMES_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"✅ games.json 檔案已成功生成！")

    except Exception as e:
        print(f"❌ 處理遊戲主資料時發生錯誤: {e}")

# ==============================================================================
# 步驟 3: 執行上面定義好的兩個函數
# ==============================================================================
if __name__ == "__main__":
    process_gift_codes()
    process_games()
    print("\n🎉 --- 所有 JSON 檔案更新完成！ ---")