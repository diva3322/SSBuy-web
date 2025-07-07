const fs = require('fs');
const path = require('path');
const { XMLBuilder } = require('fast-xml-parser');

// --- 設定您的網站基本資訊 ---
const BASE_URL = 'https://www.ssbuy.tw/';
const PAGES_DIR = './'; // 您的網站根目錄

// 可以指定哪些檔案或資料夾需要被包含或排除
const INCLUDE_EXTENSIONS = ['.html'];
const EXCLUDE_PATHS = [
    '404.html',
    'node_modules',
    '.git',
    '.github',
    'generate-sitemap.js', // 排除腳本本身
    'package.json',
    'package-lock.json',
    'games.json', // 排除原始 JSON 數據檔案
    'sitemap.xml' // 排除生成的 Sitemap 檔案本身，避免無限循環或錯誤
];

// --- 遊戲資料相關設定 ---
const GAMES_DATA_PATH = path.join(__dirname, 'games.json');

// ------------------------------

async function generateSitemap() {
    // *** 確保 sitemapEntries 在函數開頭聲明 ***
    const sitemapEntries = [];

    // --- 1. 添加靜態檔案 (您原有的邏輯，但需確保它正確位於 generateSitemap 內部) ---
    // 這個函數必須在 generateSitemap 內部定義，才能訪問 sitemapEntries
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (EXCLUDE_PATHS.some(exclude => filePath.includes(exclude))) {
                continue;
            }

            if (stats.isDirectory()) {
                walkDir(filePath); // 如果是目錄，繼續遞迴
            } else if (stats.isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                if (INCLUDE_EXTENSIONS.includes(ext)) {
                    let urlPath = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
                    if (urlPath === 'index.html') {
                        urlPath = ''; // 根目錄的 index.html 轉換為 '/'
                    } else if (urlPath.endsWith('/index.html')) {
                        urlPath = urlPath.replace('/index.html', ''); // 子目錄的 index.html 轉換為該目錄的 URL
                    }
                    
                    const fullUrl = new URL(urlPath, BASE_URL).href;

                    sitemapEntries.push({ // <-- 這裡會用到 sitemapEntries
                        loc: fullUrl,
                        lastmod: stats.mtime.toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: urlPath.includes('games/') ? '0.8' : '0.7',
                    });
                }
            }
        }
    }

    walkDir(PAGES_DIR); // <-- 呼叫遍歷靜態檔案的函數

    // --- 2. 添加遊戲動態頁面 ---
    let gamesData = {};
    try {
        const gamesJson = fs.readFileSync(GAMES_DATA_PATH, 'utf8');
        gamesData = JSON.parse(gamesJson);
        
        console.log('Parsed games data:', gamesData); 
        console.log('Is gamesData an Array?', Array.isArray(gamesData)); // 這將輸出 false，是正常的

    } catch (error) {
        console.error('Error reading or parsing games.json for sitemap generation:', error);
        // 如果讀取失敗，則不包含遊戲頁面，但繼續生成靜態頁面的 Sitemap
        // 不 return，因為我們希望即使沒有遊戲數據也能生成靜態頁面的 Sitemap
    }

    // 遍歷 gamesData 物件的每個鍵值對
    if (typeof gamesData === 'object' && gamesData !== null) {
        for (const gameName in gamesData) {
            if (Object.hasOwnProperty.call(gamesData, gameName)) {
                const gameDetails = gamesData[gameName]; // 獲取遊戲詳細資訊物件

                const gameIdEncoded = encodeURIComponent(gameName); // 使用遊戲名稱作為 ID，並進行 URL 編碼

                const loc = `${BASE_URL}game-detail.html?game=${gameIdEncoded}`; 
                
                // 設定 lastmod。如果遊戲資料本身沒有明確的更新日期，可以設定為當前日期。
                // 檢查是否有更新日期，假設您的 JSON 裡遊戲詳情中可能會有 'last_updated'
                const lastmod = gameDetails.last_updated ? new Date(gameDetails.last_updated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

                sitemapEntries.push({ // <-- 這裡會用到 sitemapEntries
                    loc: loc,
                    lastmod: lastmod,
                    changefreq: 'daily',
                    priority: '0.9',
                });
            }
        }
    } else {
        console.warn('Games data is not a valid object, skipping game page generation.');
    }
    
    // --- 3. XML 構建與寫入 (與您現有程式碼相同) ---
    const xmlData = {
        urlset: {
            '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
            url: sitemapEntries.map(entry => ({
                loc: entry.loc,
                lastmod: entry.lastmod,
                changefreq: entry.changefreq,
                priority: entry.priority,
            })),
        },
    };

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: "    "
    });
    const sitemapXml = builder.build(xmlData);

    fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
    console.log('sitemap.xml generated successfully!');
    console.log('Remember to commit and push sitemap.xml to GitHub!');
}

generateSitemap().catch(console.error);