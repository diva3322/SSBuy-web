import os
import sys
from bs4 import BeautifulSoup
from PIL import Image
from urllib.parse import unquote

# ================= 設定區 =================
HTML_FOLDER = './dist/giftcodes' 
IMAGE_ROOT = r'D:\SSB\web'

# 只處理這些路徑開頭的圖片 (網頁路徑)
TARGET_PREFIXES = ('/images/', '/giftcodesbanner/')
# =========================================

def get_real_image_info(base_root, src_path):
    # (這部分的邏輯保持不變，負責找 WebP 或 JPG)
    decoded_path = unquote(src_path)
    clean_path = decoded_path.lstrip('/').lstrip('\\').split('?')[0]
    original_full_path = os.path.normpath(os.path.join(base_root, clean_path))
    
    path_no_ext, ext = os.path.splitext(original_full_path)
    webp_full_path = path_no_ext + ".webp"

    if os.path.exists(webp_full_path):
        return webp_full_path, True
    if os.path.exists(original_full_path):
        return original_full_path, False
    
    # 處理 -bar / -禮包碼 互換邏輯
    if '-bar.' in original_full_path:
        alt = original_full_path.replace('-bar.', '-禮包碼.')
        if os.path.exists(alt): return alt, False
        alt_webp = os.path.splitext(alt)[0] + ".webp"
        if os.path.exists(alt_webp): return alt_webp, True

    if '-禮包碼.' in original_full_path:
        alt = original_full_path.replace('-禮包碼.', '-bar.')
        if os.path.exists(alt): return alt, False
        alt_webp = os.path.splitext(alt)[0] + ".webp"
        if os.path.exists(alt_webp): return alt_webp, True

    return None, False

def update_html_images():
    sys.stdout.reconfigure(encoding='utf-8')
    print(f"📂 正在掃描 HTML 並替換 WebP: {os.path.abspath(HTML_FOLDER)}")
    
    count = 0
    if not os.path.exists(HTML_FOLDER):
        print(f"❌ 找不到 HTML 資料夾: {HTML_FOLDER}")
        return

    for filename in os.listdir(HTML_FOLDER):
        if filename.endswith(".html"):
            filepath = os.path.join(HTML_FOLDER, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            all_imgs = soup.find_all('img')
            modified = False
            
            for img in all_imgs:
                src = img.get('src')
                
                # 🔥 關鍵修改：只處理您指定的兩個資料夾路徑
                if src and src.startswith(TARGET_PREFIXES):
                    
                    real_path, is_webp = get_real_image_info(IMAGE_ROOT, src)
                    
                    if real_path:
                        try:
                            with Image.open(real_path) as image_file:
                                width, height = image_file.size
                            
                            # 1. 寫入寬高
                            img['width'] = width
                            img['height'] = height
                            
                            # 2. 替換成 WebP
                            if is_webp:
                                base, _ = os.path.splitext(src)
                                new_src = base + ".webp"
                                
                                # 反推相對路徑，確保與 src 格式一致
                                rel_path = os.path.relpath(real_path, IMAGE_ROOT)
                                final_src = "/" + rel_path.replace('\\', '/')
                                
                                img['src'] = final_src

                            modified = True
                        except Exception as e:
                            print(f"⚠️ 讀取失敗: {real_path} ({e})")
            
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(str(soup))
                count += 1

    print(f"\n🎉 全部完成！共優化了 {count} 個頁面。")

if __name__ == "__main__":
    update_html_images()