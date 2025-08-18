const fs = require('fs');
const path = require('path');

// --- 請在這裡設定您的網站主網域 ---
const BASE_URL = 'https://www.ssbuy.tw';

console.log('🚀 開始產生 Sitemap...');

// --- 路徑設定 ---
// 腳本在 detail_giftcode 中，所以 '..' 會指向上層的 'web' 資料夾
const webRootDir = path.join(__dirname, '..'); 
const gamesDataPath = path.join(__dirname, 'data', 'games.json');
const sitemapPath = path.join(webRootDir, 'sitemap.xml'); // 將 sitemap.xml 直接產生在 web 根目錄

// 輔助函數：產生安全的 URL 路徑片段 (與 create_pages.js 保持一致)
function createSafeUrlSegment(gameName) {
    if (!gameName) return '';
    let safeName = gameName
        .replace(/[:：]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[\\?*:"<>|/]/g, '')
        .toLowerCase();
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    // 使用 URL 編碼處理中文等特殊字元，確保網址有效
    return encodeURI(safeName); 
}

try {
    const allUrls = new Set(); // 使用 Set 來避免重複的 URL

    // 1. 自動掃描 web 根目錄下的所有靜態 HTML 檔案
    console.log(`🔍 正在掃描靜態頁面於: ${webRootDir}`);
    const filesInWebRoot = fs.readdirSync(webRootDir);
    filesInWebRoot.forEach(file => {
        if (file.endsWith('.html')) {
            // 排除不再使用的舊樣板檔案
            if (file !== 'game-detail.html' && file !== 'gift-codes.html') {
                allUrls.add(`${BASE_URL}/${file}`);
            }
        }
    });
    // 強制加上首頁的根路徑
    allUrls.add(`${BASE_URL}/`);


    // 2. 根據 games.json 動態產生所有遊戲頁面的 URL
    console.log('📖 正在讀取遊戲資料以產生動態頁面網址...');
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    for (const gameName in gamesData) {
        const safeSegment = createSafeUrlSegment(gameName);
        // 產生的 URL 結構必須與您網站上線後的結構完全一致
        allUrls.add(`${BASE_URL}/detail_giftcode/dist/gamedetail/${safeSegment}.html`);
        allUrls.add(`${BASE_URL}/detail_giftcode/dist/giftcodes/${safeSegment}.html`);
    }
    
    // 3. 產生 XML 格式的 Sitemap 內容
    const urlArray = Array.from(allUrls);
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlArray.map(url => `
        <url>
            <loc>${url}</loc>
        </url>
    `).join('')}
</urlset>
    `.trim();

    // 4. 將 Sitemap 內容寫入到 web 根目錄
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

    console.log(`✅ Sitemap 成功產生！已儲存至: ${sitemapPath}`);
    console.log(`   共包含 ${urlArray.length} 個網址。`);

} catch (error) {
    console.error('❌ 產生 Sitemap 時發生錯誤:', error);
}