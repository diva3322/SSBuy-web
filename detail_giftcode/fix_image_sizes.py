import os
from bs4 import BeautifulSoup
from PIL import Image

# ================= 設定區 =================
# 1. 您的 HTML 檔案產出的資料夾 (請確認這路徑是對的)
HTML_FOLDER = 'D:\SSB\web\detail_giftcode\dist\giftcodes' 

# 2. 您的圖片所在的「根目錄」
# 因為 HTML 裡的 src 是寫 "/giftcodesbanner/xxx.jpg"
# 腳本需要知道去哪裡找這些圖。通常是網頁的根目錄。
IMAGE_ROOT = r'D:\SSB\web'
# =========================================

def update_html_images():
    print(f"📂 正在掃描資料夾: {HTML_FOLDER}")
    count = 0
    
    # 遍歷資料夾內所有檔案
    for filename in os.listdir(HTML_FOLDER):
        if filename.endswith(".html"):
            filepath = os.path.join(HTML_FOLDER, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            # 尋找 Banner 圖片
            # 這裡會抓取 class 包含 'giftcodes-banner' 的所有圖片
            # 這樣無論您是用 fixed-ratio 還是 responsive 都能抓到
            img_tag = soup.find('img', class_=lambda x: x and 'giftcodes-banner' in x)
            
            if img_tag and img_tag.get('src'):
                src = img_tag['src'] # 例如: /giftcodesbanner/123.jpg
                
                # 處理路徑：移除開頭的 /，轉換成電腦看得懂的本地路徑
                # 例如: /giftcodesbanner/123.jpg -> ./giftcodesbanner/123.jpg
                clean_src = src.lstrip('/').lstrip('\\').split('?')[0]
                local_img_path = os.path.join(IMAGE_ROOT, clean_src)
                
                # 檢查圖片是否存在並讀取尺寸
                if os.path.exists(local_img_path):
                    try:
                        with Image.open(local_img_path) as img:
                            width, height = img.size
                        
                        # 直接將 width 和 height 寫入 HTML 標籤
                        img_tag['width'] = width
                        img_tag['height'] = height
                        
                        # 移除舊的 style 寬高限制 (如果有)，確保 CSS 能接手
                        # 但保留我們需要的 responsive class
                        if 'style' in img_tag.attrs:
                            # 選擇性：您可以決定要不要保留 style，通常建議移除寫死的 style
                            # del img_tag['style'] 
                            pass 

                        # 存檔
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(str(soup))
                        
                        print(f"✅ [修正成功] {filename}: {width}x{height}")
                        count += 1
                        
                    except Exception as e:
                        print(f"⚠️ 圖片讀取錯誤 {filename}: {e}")
                else:
                    print(f"❌ 找不到圖片: {local_img_path} (在檔案 {filename})")
            
    print(f"\n🎉 處理完成！共修正了 {count} 個網頁的圖片尺寸。")

if __name__ == "__main__":
    update_html_images()