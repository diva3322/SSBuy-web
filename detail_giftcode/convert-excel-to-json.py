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
        
        # 讀取舊資料用於比較
        existing_data = {}
        if os.path.exists(GIFT_CODES_JSON_PATH) and os.path.getsize(GIFT_CODES_JSON_PATH) > 0:
            try:
                with open(GIFT_CODES_JSON_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = {}

        output_data = {}
        newly_added = []
        updated = []

        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue

            # --- [再次修改重點] 更嚴謹的 Banner 圖片處理邏輯 ---
            banner_url = str(row.get('橫幅圖片', '')).strip()
            banner_filename = str(row.get('橫幅圖片檔名', '')).strip()

            if banner_url:
                final_banner_path = banner_url
            elif banner_filename:
                final_banner_path = f"giftcodesbanner/{banner_filename}"
            else:
                final_banner_path = f"giftcodesbanner/{game_name}-禮包碼.jpg"

            # 確保路徑只會有一個 'giftcodesbanner/'
            if final_banner_path.startswith('giftcodesbanner/giftcodesbanner/'):
                final_banner_path = final_banner_path.replace('giftcodesbanner/giftcodesbanner/', 'giftcodesbanner/')
            elif not final_banner_path.startswith('giftcodesbanner/'):
                final_banner_path = f"giftcodesbanner/{final_banner_path}"
            # --- [再次修改重點結束] ---

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
            output_data.setdefault(game_name, {}).update(game_obj)

            if game_name not in existing_data:
                newly_added.append(game_name)
            elif game_obj != existing_data.get(game_name):
                updated.append(game_name)
        
        with open(GIFT_CODES_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        if newly_added:
            print(f"  🆕 新增禮包碼遊戲: {', '.join(newly_added)}")
        if updated:
            print(f"  🔄 更新禮包碼遊戲: {', '.join(updated)}")
        
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
        
        existing_data = {}
        if os.path.exists(GAMES_JSON_PATH) and os.path.getsize(GAMES_JSON_PATH) > 0:
            try:
                with open(GAMES_JSON_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = {}
        
        output_data = {}
        # [修改重點] 建立列表來追蹤變動
        newly_added = []
        updated = []

        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue
            
            logo_path_from_excel = str(row.get('Logo', '')).strip()
            final_logo_path = logo_path_from_excel if logo_path_from_excel else f"images/{game_name}.jpg"
            
            products_list = []
            for i in range(1, 16):
                p_name = str(row.get(f'商品{i}名稱', '')).strip()
                p_price_raw = row.get(f'商品{i}價格', '')
                
                if p_name and p_price_raw != '':
                    # --- [修改重點] 智慧判斷價格格式 ---
                    try:
                        price_float = float(p_price_raw)
                        # 檢查浮點數是否為整數 (例如 28.0)
                        if price_float.is_integer():
                            final_price = int(price_float) # 轉換為整數 (28)
                        else:
                            final_price = price_float # 保留小數 (例如 28.5)
                    except (ValueError, TypeError):
                        # 如果無法轉換為數字，則保留原始文字
                        final_price = str(p_price_raw).strip()
                    # --- [修改重點結束] ---
                    
                    products_list.append({"name": p_name, "price": final_price})
                    
            gift_code_url_from_excel = str(row.get('禮包碼', '')).strip()
            final_gift_code_url = gift_code_url_from_excel if gift_code_url_from_excel else f"gift-codes.html?game={urllib.parse.quote(game_name)}"
            
            existing_socials = existing_data.get(game_name, {}).get('social', {})
            social_links = {
                "Facebook": str(row.get('Facebook', '')).strip() or existing_socials.get('Facebook', ''),
                "官方網站": str(row.get('官方網站', '')).strip() or existing_socials.get('官方網站', ''),
                "App Store": str(row.get('App Store', '')).strip() or existing_socials.get('App Store', ''),
                "Google Play": str(row.get('GooglePlay', '')).strip() or existing_socials.get('Google Play', ''),
                "禮包碼": final_gift_code_url
            }

            game_obj = {
                "logo": final_logo_path,
                "description": str(row.get('簡介', '')).strip(),
                "products": products_list,
                "social": social_links,
                "canonical_url": str(row.get('canonical_url', '')).strip()
            }
            output_data[game_name] = game_obj

            # 比較新舊數據並記錄
            if game_name not in existing_data:
                newly_added.append(game_name)
            elif game_obj != existing_data.get(game_name):
                updated.append(game_name)

        with open(GAMES_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        # [修改重點] 顯示摘要
        if newly_added:
            print(f"  🆕 新增主資料遊戲: {', '.join(newly_added)}")
        if updated:
            print(f"  🔄 更新主資料遊戲: {', '.join(updated)}")

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