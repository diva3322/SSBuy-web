import json
import time
from openpyxl import load_workbook
import requests
import os
import re

API_KEY = "AIzaSyAapqNr8NGy0Br0D9K-qOPFXsvzYH9feDY"
SEARCH_ENGINE_ID = "5534bc0e180af4cf5"

def clean_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)

def google_search(query):
    try:
        url = (
            f"https://www.googleapis.com/customsearch/v1"
            f"?key={API_KEY}&cx={SEARCH_ENGINE_ID}&q={query}&gl=tw&hl=zh-TW"
        )
        res = requests.get(url)
        if res.status_code == 200:
            items = res.json().get("items")
            return items[0]["link"] if items else "N"
        else:
            print(f"搜尋錯誤: {query} => {res.status_code}")
            return "N"
    except Exception as e:
        print(f"搜尋失敗: {query} => {e}")
        return "N"

def load_existing_data(json_file="games.json"):
    if os.path.exists(json_file):
        with open(json_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def main():
    wb = load_workbook("games.xlsx")
    ws = wb.active

    games_data = load_existing_data()

    excel_game_names = set()
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0]:
            excel_game_names.add(str(row[0]).strip())

    new_games = excel_game_names - set(games_data.keys())

    print(f"新增遊戲：{new_games}")

    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[0]:
            continue

        game_name = str(row[0]).strip()
        if game_name not in new_games:
            continue

        # 用clean_filename處理圖片名稱
        cleaned_game_name = clean_filename(game_name)
        logo = f"images/{cleaned_game_name}.jpg"

        gift_url = row[2] if row[2] else "N"

        products = []
        for i in range(3, 30, 2):
            pname = row[i]
            price = row[i + 1] if i + 1 < len(row) else None
            if pname and price:
                try:
                    price = int(str(price).strip())
                    products.append({"name": str(pname).strip(), "price": price})
                except:
                    pass

        facebook = google_search(f"{game_name} FB")
        website = google_search(f"{game_name} 官方")
        appstore = google_search(f"{game_name} site:apps.apple.com/tw")
        bahamut = google_search(f"{game_name} 巴哈")

        social = {
            "Facebook": facebook,
            "官方網站": website,
            "禮包碼": gift_url,
            "App Store": appstore,
            "巴哈姆特": bahamut
        }

        games_data[game_name] = {
            "logo": logo,  # 存清理過後的圖片名稱
            "products": products,
            "social": social
        }

        print(f"{game_name} ✅")
        time.sleep(1.2)

    with open("games.json", "w", encoding="utf-8") as f:
        json.dump(games_data, f, indent=2, ensure_ascii=False)

    print("✅ games.json 增量更新完成！")

if __name__ == "__main__":
    main()
