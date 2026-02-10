import os
import sys
from bs4 import BeautifulSoup
from PIL import Image
from urllib.parse import unquote

# ================= 設定區 =================
# 1. HTML 檔案產出的資料夾
HTML_FOLDER = './dist/giftcodes' 

# 2. 圖片所在的「根目錄」
# 請確認這就是您存放 images, giftcodesbanner 等資料夾的地方
IMAGE_ROOT = r'D:\SSB\web'
# =========================================

def get_real_image_path(base_root, relative_path):
    """
    聰明的路徑搜尋器：
    1. 先找原始路徑
    2. 找不到？嘗試把 '-bar' 換成 '-禮包碼'
    3. 還是找不到？嘗試把 '-禮包碼' 換成 '-bar'
    """
    # 1. 清理路徑 (解碼 + 統一斜線)
    decoded_path = unquote(relative_path)
    clean_path = decoded_path.lstrip('/').lstrip('\\').split('?')[0]
    full_path = os.path.normpath(os.path.join(base_root, clean_path))

    # 情況 A: 檔案直接存在 (最完美)
    if os.path.exists(full_path):
        return full_path

    # 情況 B: 檔名中有 -bar，嘗試換成 -禮包碼
    if '-bar.' in full_path:
        alt_path = full_path.replace('-bar.', '-禮包碼.')
        if os.path.exists(alt_path):
            print(f"   💡 [聰明修正] HTML寫 -bar 但實際是 -禮包碼")
            return alt_path

    # 情況 C: 檔名中有 -禮包碼，嘗試換成 -bar
    elif '-禮包碼.' in full_path:
        alt_path = full_path.replace('-禮包碼.', '-bar.')
        if os.path.exists(alt_path):
            print(f"   💡 [聰明修正] HTML寫 -禮包碼 但實際是 -bar")
            return alt_path
            
    # 都找不到
    return None

def update_html_images():
    sys.stdout.reconfigure(encoding='utf-8')
    print(f"📂 正在掃描 HTML: {os.path.abspath(HTML_FOLDER)}")
    print(f"📂 圖片根目錄: {IMAGE_ROOT}\n")
    
    count = 0
    missing_files = []

    if not os.path.exists(HTML_FOLDER):
        print(f"❌ 找不到 HTML 資料夾: {HTML_FOLDER}")
        return

    for filename in os.listdir(HTML_FOLDER):
        if filename.endswith(".html"):
            filepath = os.path.join(HTML_FOLDER, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            # 抓取所有 banner 圖片
            img_tag = soup.find('img', class_=lambda x: x and 'giftcodes-banner' in x)
            
            if img_tag and img_tag.get('src'):
                # 呼叫上面的聰明搜尋功能
                real_img_path = get_real_image_path(IMAGE_ROOT, img_tag['src'])
                
                if real_img_path:
                    try:
                        with Image.open(real_img_path) as img:
                            width, height = img.size
                        
                        # 寫入 HTML
                        img_tag['width'] = width
                        img_tag['height'] = height
                        
                        # 如果 HTML 裡的 src 跟實際檔案不一致，是否要順便修正 src？
                        # 建議：順便修正 src，這樣網頁才不會破圖
                        # 我們要把絕對路徑轉回相對路徑
                        if '-bar' in img_tag['src'] and '-禮包碼' in real_img_path:
                             img_tag['src'] = img_tag['src'].replace('-bar', '-禮包碼')
                        elif '-禮包碼' in img_tag['src'] and '-bar' in real_img_path:
                             img_tag['src'] = img_tag['src'].replace('-禮包碼', '-bar')

                        # 移除舊 style (選用)
                        if 'style' in img_tag.attrs:
                            pass 

                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(str(soup))
                        
                        print(f"✅ [OK] {filename} -> {width}x{height}")
                        count += 1
                        
                    except Exception as e:
                        print(f"⚠️ 讀取失敗: {real_img_path} ({e})")
                else:
                    missing_files.append(f"{filename} : {img_tag['src']}")

    print(f"\n" + "="*50)
    print(f"🎉 處理完成！共修正 {count} 個網頁。")
    
    if missing_files:
        print(f"❌ 仍有 {len(missing_files)} 個圖片完全找不到 (既不是 -bar 也不是 -禮包碼):")
        for err in missing_files[:10]:
            print(f"   👉 {err}")
    print("="*50)

if __name__ == "__main__":
    update_html_images()