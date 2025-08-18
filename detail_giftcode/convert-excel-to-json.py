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
    """
    讀取 Excel 中的 'gift_codes' 工作表，
    並將其內容轉換成 'gift-codes-data.json' 檔案。
    """
    print("\n--- [階段 1/2] 正在處理禮包碼資料... ---")
    try:
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='gift_codes')
        df = df.fillna('')
        output_data = {}
        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue
            banner_url = str(row.get('橫幅圖片', '')).strip()
            if banner_url:
                final_banner_path = banner_url
            else:
                banner_filename = str(row.get('橫幅圖片檔名', '')).strip()
                final_banner_path = f"giftcodesbanner/{banner_filename}" if banner_filename else f"giftcodesbanner/{game_name}.jpg"
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
    """
    讀取 Excel 中的 'games' 工作表，
    並將其內容轉換成 'games.json' 檔案。
    """
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

        for index, row in df.iterrows():
            game_name = str(row.get('遊戲名稱', '')).strip()
            if not game_name: continue
            
            # --- [修改重點] 智慧更新社群連結的邏輯 ---
            # 1. 先從舊的 JSON 檔案中取得該遊戲現有的社群連結 (如果有的話)
            existing_socials = existing_data.get(game_name, {}).get('social', {})

            # 2. 逐一讀取 Excel 中的社群連結欄位
            #    如果 Excel 該欄位有內容，就使用 Excel 的新內容
            #    如果 Excel 該欄位是空的，就沿用舊 JSON 中的內容
            social_links = {
                "Facebook": str(row.get('Facebook', '')).strip() or existing_socials.get('Facebook', ''),
                "官方網站": str(row.get('官方網站', '')).strip() or existing_socials.get('官方網站', ''),
                "App Store": str(row.get('AppStore', '')).strip() or existing_socials.get('App Store', ''),
                "Google Play": str(row.get('GooglePlay', '')).strip() or existing_socials.get('Google Play', ''),
            }
            # --- [修改重點結束] ---

            # 處理禮包碼連結
            gift_code_url_from_excel = str(row.get('禮包碼', '')).strip()
            social_links["禮包碼"] = gift_code_url_from_excel if gift_code_url_from_excel else f"gift-codes.html?game={urllib.parse.quote(game_name)}"

            # 處理 Logo
            logo_path_from_excel = str(row.get('Logo', '')).strip()
            final_logo_path = logo_path_from_excel if logo_path_from_excel else f"images/{game_name}.jpg"

            # 處理商品
            products_list = []
            for i in range(1, 16):
                p_name = str(row.get(f'商品{i}名稱', '')).strip()
                p_price_raw = row.get(f'商品{i}價格', '')
                if p_name and p_price_raw != '':
                    try:
                        products_list.append({"name": p_name, "price": int(p_price_raw)})
                    except (ValueError, TypeError):
                        print(f"  ⚠️  警告：遊戲 \"{game_name}\" 的商品 \"{p_name}\" 價格 \"{p_price_raw}\" 不是有效數字，已跳過。")

            # 組合最終遊戲物件
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