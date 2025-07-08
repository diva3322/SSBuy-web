const fs = require('fs');
const path = require('path');
const { XMLBuilder } = require('fast-xml-parser'); //

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
    'games.json', // 排除原始遊戲數據檔案
    'gift-codes-data.json', // 排除原始禮包碼數據檔案
    'sitemap.xml' // 排除生成的 Sitemap 檔案本身，避免無限循環或錯誤
];

// --- 數據檔案路徑設定 ---
const GAMES_DATA_PATH = path.join(__dirname, 'games.json');
const GIFT_CODES_DATA_PATH = path.join(__dirname, 'gift-codes-data.json'); //

// ------------------------------

async function generateSitemap() {
    const sitemapEntries = [];

    // --- 1. 添加靜態檔案 ---
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (EXCLUDE_PATHS.some(exclude => filePath.includes(exclude))) {
                continue;
            }

            if (stats.isDirectory()) {
                walkDir(filePath);
            } else if (stats.isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                if (INCLUDE_EXTENSIONS.includes(ext)) {
                    let urlPath = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
                    if (urlPath === 'index.html') {
                        urlPath = '';
                    } else if (urlPath.endsWith('/index.html')) {
                        urlPath = urlPath.replace('/index.html', '');
                    }
                    
                    const fullUrl = new URL(urlPath, BASE_URL).href;

                    sitemapEntries.push({
                        loc: fullUrl,
                        lastmod: stats.mtime.toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: urlPath.includes('games/') ? '0.8' : '0.7',
                    });
                }
            }
        }
    }

    walkDir(PAGES_DIR);

    // --- 2. 從 games.json 添加遊戲詳情頁面 ---
    let gamesData = {};
    try {
        const gamesJson = fs.readFileSync(GAMES_DATA_PATH, 'utf8');
        gamesData = JSON.parse(gamesJson);
        
        //console.log('Parsed games.json data:', gamesData); 
        //console.log('Is gamesData an Array?', Array.isArray(gamesData)); 

    } catch (error) {
        console.error('Error reading or parsing games.json for sitemap generation:', error);
    }

    if (typeof gamesData === 'object' && gamesData !== null) {
        for (const gameName in gamesData) {
            if (Object.hasOwnProperty.call(gamesData, gameName)) {
                const gameDetails = gamesData[gameName];

                const gameNameEncoded = encodeURIComponent(gameName); 
                
                const lastmod = gameDetails.last_updated 
                                ? new Date(gameDetails.last_updated).toISOString().split('T')[0] 
                                : new Date().toISOString().split('T')[0]; 

                // 為遊戲詳情頁添加 Sitemap 條目
                const gameDetailLoc = `${BASE_URL}game-detail.html?game=${gameNameEncoded}`;
                sitemapEntries.push({
                    loc: gameDetailLoc,
                    lastmod: lastmod,
                    changefreq: 'daily',
                    priority: '0.9',
                });
            }
        }
    } else {
        console.warn('Games data (from games.json) is not a valid object, skipping game detail page generation.');
    }

    // --- 3. 從 gift-codes-data.json 添加禮包碼頁面 ---
    let giftCodesData = {};
    try {
        const giftCodesJson = fs.readFileSync(GIFT_CODES_DATA_PATH, 'utf8');
        giftCodesData = JSON.parse(giftCodesJson); //

        //console.log('Parsed gift-codes-data.json data:', giftCodesData);
        //console.log('Is giftCodesData an Array?', Array.isArray(giftCodesData));

    } catch (error) {
        console.error('Error reading or parsing gift-codes-data.json for sitemap generation:', error);
    }

    // 禮包碼數據也是一個物件，鍵是遊戲名稱，值是該遊戲的禮包碼詳細資訊
    if (typeof giftCodesData === 'object' && giftCodesData !== null) {
        for (const gameName in giftCodesData) { // 遍歷 gift-codes-data.json 中的每個遊戲名稱
            if (Object.hasOwnProperty.call(giftCodesData, gameName)) {
                const gameDetails = giftCodesData[gameName]; // 獲取遊戲的禮包碼詳細資訊物件

                // 在 gift-codes-data.json 中沒有明確的 last_updated 字段在每個遊戲的頂層。
                // 因此，我們將使用當前日期作為其 lastmod。
                // 如果您在 gift-codes-data.json 中添加了 'last_updated' 字段，請像 games.json 一樣取用它。
                const lastmod = new Date().toISOString().split('T')[0]; 

                const gameNameEncoded = encodeURIComponent(gameName); 
                const giftCodesLoc = `${BASE_URL}gift-codes.html?game=${gameNameEncoded}`;
                
                sitemapEntries.push({
                    loc: giftCodesLoc,
                    lastmod: lastmod, 
                    changefreq: 'daily', 
                    priority: '0.8', 
                });
            }
        }
    } else {
        console.warn('Gift codes data (from gift-codes-data.json) is not a valid object, skipping gift code page generation.');
    }
    
    // --- 4. XML 構建與寫入 (保持不變) ---
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
    console.log('sitemap.xml 製作成功!');
    console.log('記得把sitemap.xml弄到GitHub!');
}

generateSitemap().catch(console.error);