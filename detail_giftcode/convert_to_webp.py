import os
from PIL import Image

# ================= 設定區 =================
# 您的網站根目錄
WEB_ROOT = r'D:\SSB\web'

# 指定要掃描的資料夾名稱 (相對於 WEB_ROOT)
TARGET_FOLDERS = ['images', 'giftcodesbanner']

# 設定 WebP 品質
QUALITY = 80 
# =========================================

def convert_specific_folders():
    print(f"🚀 開始 WebP 轉檔，目標根目錄: {WEB_ROOT}")
    print(f"📂 鎖定資料夾: {TARGET_FOLDERS}")
    
    count = 0
    saved_space = 0

    for folder_name in TARGET_FOLDERS:
        # 組合完整路徑: D:\SSB\web\images
        current_folder = os.path.join(WEB_ROOT, folder_name)
        
        if not os.path.exists(current_folder):
            print(f"⚠️ 警告: 找不到資料夾 {current_folder}，跳過。")
            continue
            
        print(f"\n🔍 正在掃描: {current_folder} ...")

        # 掃描該資料夾 (包含子資料夾)
        for root, dirs, files in os.walk(current_folder):
            for filename in files:
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    file_path = os.path.join(root, filename)
                    file_name_no_ext = os.path.splitext(filename)[0]
                    webp_path = os.path.join(root, file_name_no_ext + ".webp")

                    # 如果 WebP 已經存在，跳過
                    if os.path.exists(webp_path):
                        continue

                    try:
                        with Image.open(file_path) as img:
                            # 轉成 RGB (避免 PNG 透明圖轉檔報錯)
                            if img.mode in ("RGBA", "LA"):
                                pass 
                            else:
                                img = img.convert("RGB")
                                
                            img.save(webp_path, 'webp', quality=QUALITY)
                            
                            original_size = os.path.getsize(file_path)
                            new_size = os.path.getsize(webp_path)
                            saved_space += (original_size - new_size)
                            
                            print(f"✅ 轉換: {filename} -> .webp")
                            count += 1
                            
                    except Exception as e:
                        print(f"❌ 失敗: {filename} ({e})")

    saved_mb = saved_space / (1024 * 1024)
    print(f"\n🎉 全部完成！共產生 {count} 張 WebP 圖片。")
    print(f"💪 預計可節省流量: {saved_mb:.2f} MB")

if __name__ == "__main__":
    convert_specific_folders()