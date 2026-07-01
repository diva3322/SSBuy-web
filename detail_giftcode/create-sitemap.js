const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.ssbuy.tw';

console.log('🚀 開始產生 Sitemap...');

const webRootDir = path.join(__dirname, '..'); 
const gamesDataPath = path.join(__dirname, 'data', 'games.json');
const sitemapPath = path.join(webRootDir, 'sitemap.xml');

// [新增重點 1] 加入將特殊字元轉換為 XML 安全格式的函數
function escapeXml(unsafeStr) {
    if (!unsafeStr) return '';
    return unsafeStr.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function createSafeUrlSegment(gameName) {
    if (!gameName) return '';
    // [修改重點] 移除了 .toLowerCase()，保留原始大小寫
    let safeName = gameName.replace(/[\\/?*"<>|]/g, '');
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    return encodeURI(safeName);
}

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
    
    // [新增重點 2] 在寫入 <loc> 標籤時，套用 escapeXml 函數對網址進行「消毒」
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlArray.map(url => `
        <url>
            <loc>${escapeXml(url)}</loc>
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