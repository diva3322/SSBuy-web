const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.ssbuy.tw';

console.log('🚀 開始產生 Sitemap...');

const webRootDir = path.join(__dirname, '..'); 
const gamesDataPath = path.join(__dirname, 'data', 'games.json');
const sitemapPath = path.join(webRootDir, 'sitemap.xml');

function createSafeUrlSegment(gameName) {
    if (!gameName) return '';
    // [修改重點] 移除了 .toLowerCase()，保留原始大小寫
    let safeName = gameName.replace(/[\\/?*"<>|]/g, '');
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    return encodeURI(safeName);
}

// ... (檔案其餘部分保持不變) ...
// (為求完整，底下提供完整檔案)

try {
    const allUrls = new Set();

    console.log(`🔍 正在掃描靜態頁面於: ${webRootDir}`);
    const filesInWebRoot = fs.readdirSync(webRootDir);
    filesInWebRoot.forEach(file => {
        if (file.endsWith('.html')) {
            if (file !== 'game-detail.html' && file !== 'gift-codes.html') {
                allUrls.add(`${BASE_URL}/${file}`);
            }
        }
    });
    allUrls.add(`${BASE_URL}/`);

    console.log('📖 正在讀取遊戲資料以產生動態頁面網址...');
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    for (const gameName in gamesData) {
        const safeSegment = createSafeUrlSegment(gameName);
        allUrls.add(`${BASE_URL}/detail_giftcode/dist/gamedetail/${safeSegment}.html`);
        allUrls.add(`${BASE_URL}/detail_giftcode/dist/giftcodes/${safeSegment}.html`);
    }
    
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

    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

    console.log(`✅ Sitemap 成功產生！已儲存至: ${sitemapPath}`);
    console.log(`   共包含 ${urlArray.length} 個網址。`);

} catch (error) {
    console.error('❌ 產生 Sitemap 時發生錯誤:', error);
}