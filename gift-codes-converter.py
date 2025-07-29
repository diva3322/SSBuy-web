import pandas as pd
import json
import re
import os # 導入 os 模組，用於檢查檔案是否存在

def convert_excel_to_json(excel_file_path, json_output_path):
    """
    從 Excel (.xlsx) 檔案讀取遊戲數據，轉換為指定 JSON 結構。
    只有當遊戲是新加入或內容有更新時，才顯示完成訊息。
    """
    output_json_data = {} 
    
    # <--- 新增：載入現有的 JSON 數據以進行比較 ---
    existing_json_data = {}
    if os.path.exists(json_output_path) and os.path.getsize(json_output_path) > 0:
        try:
            with open(json_output_path, 'r', encoding='utf-8') as f:
                existing_json_data = json.load(f)
        except json.JSONDecodeError:
            print(f"警告: 無法解析現有的 JSON 檔案 '{json_output_path}'，將重新寫入。")
            existing_json_data = {} # 解析失敗則視為空
    # --- 結束新增 ---

    try:
        df = pd.read_excel(excel_file_path)

        for index, row in df.iterrows():
            game_name_raw = row.get('遊戲名稱')
            
            if pd.notna(game_name_raw) and str(game_name_raw).strip() != '':
                game_name = str(game_name_raw).strip()

                banner_image = str(row.get('橫幅圖片', '')).strip()
                description = str(row.get('介紹', '')).strip()
                
                how_to_methods = []
                redeem_keys = ['兌換方式1', '兌換方式3', '兌換方式4', '兌換方式5', '兌換方式6']
                for key in redeem_keys:
                    method = row.get(key)
                    if pd.notna(method) and str(method).strip() != '':
                        how_to_methods.append(str(method).strip())

                codes_list = []
                for i in range(1, 21): 
                    gift_code_key = f'禮包碼{i}'
                    content_key = f'內容物{i}'
                    
                    gift_code = row.get(gift_code_key)
                    reward_content = row.get(content_key)
                    
                    if pd.notna(gift_code) and str(gift_code).strip() != '':
                        codes_list.append({
                            "code": str(gift_code).strip(),
                            "reward": str(reward_content).strip() if pd.notna(reward_content) else ""
                        })
                
                canonical_url_raw = row.get('canonical_url')
                if pd.isna(canonical_url_raw) or str(canonical_url_raw).strip() == '':
                    encoded_game_name = re.quote(game_name, safe='')
                    current_canonical_url = f"https://www.ssbuy.tw/gift-codes.html?game={encoded_game_name}"
                    # print(f"警告 (索引: {index}): 遊戲 '{game_name}' 的 canonical_url 為空或無效，已自動生成為: {current_canonical_url}") # 暫時註釋掉此警告，以免干擾主要輸出
                else:
                    current_canonical_url = str(canonical_url_raw).strip()

                game_obj = {
                    "banner": banner_image,
                    "description": description,
                    "howTo": how_to_methods,
                    "codes": codes_list,
                    "canonical_url": current_canonical_url
                }
                
                # <--- 核心修改：比較新舊數據以決定是否顯示更新訊息 ---
                # 獲取現有 JSON 中的該遊戲數據
                existing_game_obj = existing_json_data.get(game_name)

                # 進行數據比較
                # 注意：Python 的 == 運算符會對字典和列表進行深度比較。
                # 但對於列表內字典的順序，如果原始 JSON 和新生成的順序可能不同，則可能會被判定為「不同」。
                # 為了更精確的比較（不考慮 howTo 或 codes 列表內部順序），可能需要更複雜的邏輯，
                # 但對於大多數情況，直接比較是足夠的。
                if existing_game_obj is None:
                    # 遊戲不存在於現有 JSON 中，是新的遊戲
                    output_json_data[game_name] = game_obj
                    print(f"✅\"{game_name}\"禮包碼新增完成") # 新增遊戲的訊息
                elif game_obj != existing_game_obj:
                    # 遊戲存在，但內容不同，表示有更新
                    output_json_data[game_name] = game_obj
                    print(f"✅\"{game_name}\"禮包碼更新完成") # 更新遊戲的訊息
                else:
                    # 遊戲存在且內容相同，不顯示訊息
                    output_json_data[game_name] = game_obj # 即使沒變也加入到 output_json_data
                    # print(f"\"{game_name}\"禮包碼無變動") # 如果想顯示無變動，可以取消註釋此行

            else:
                print(f"警告 (索引: {index}): 發現缺少 '遊戲名稱' 欄位或為空值的行，已跳過: {row.to_dict()}")
        
        # 將最終數據寫入 JSON 檔案
        with open(json_output_path, 'w', encoding='utf-8') as json_file:
            json.dump(output_json_data, json_file, ensure_ascii=False, indent=4)
        
        print(f"\nJSON 檔案 '{json_output_path}' 已成功生成！")

    except FileNotFoundError:
        print(f"錯誤: 找不到 Excel 檔案 '{excel_file_path}'。請確認檔案路徑和名稱是否正確。")
    except KeyError as e:
        print(f"錯誤: Excel 檔案中缺少必要的欄位。請確認存在 '遊戲名稱' 和 'canonical_url' 欄位。缺少欄位: {e}")
    except Exception as e:
        print(f"發生未知錯誤: {e}")

# --- 腳本執行入口 ---
convert_excel_to_json('giftcodes.xlsx', 'gift-codes-data.json')