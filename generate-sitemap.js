const fs = require('fs');
const path = require('path');
const { XMLBuilder } = require('fast-xml-parser'); // 輕量級 XML 構建器

// --- 設定您的網站基本資訊 ---
const BASE_URL = 'www.ssbuy.tw; // <-- **請修改成您的網站根 URL**
const PAGES_DIR = './'; // <-- 您的網站根目錄，通常是 './' 或 './docs'

// 可以指定哪些檔案或資料夾需要被包含或排除
const INCLUDE_EXTENSIONS = ['.html', '.htm', '.JSON', '.js', '.css']; // 只包含 HTML 檔案
const EXCLUDE_PATHS = ['404.html', 'node_modules', '.git', '.github']; // 排除這些路徑

// ------------------------------

async function generateSitemap() {
    const sitemapEntries = [];

    // 遞迴函數來遍歷目錄並找到所有符合條件的檔案
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            // 檢查是否為排除路徑
            if (EXCLUDE_PATHS.some(exclude => filePath.includes(exclude))) {
                continue;
            }

            if (stats.isDirectory()) {
                walkDir(filePath); // 如果是目錄，繼續遞迴
            } else if (stats.isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                if (INCLUDE_EXTENSIONS.includes(ext)) {
                    // 將檔案路徑轉換為 URL 路徑
                    let urlPath = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
                    if (urlPath === 'index.html') { // 根目錄的 index.html 轉換為 '/'
                        urlPath = '';
                    } else if (urlPath.endsWith('/index.html')) { // 子目錄的 index.html 轉換為該目錄的 URL
                        urlPath = urlPath.replace('/index.html', '');
                    }
                    
                    // 組裝完整的 URL
                    const fullUrl = new URL(urlPath, BASE_URL).href;

                    sitemapEntries.push({
                        loc: fullUrl,
                        lastmod: stats.mtime.toISOString().split('T')[0], // 最後修改日期 (YYYY-MM-DD)
                        changefreq: 'weekly', // 您可以根據更新頻率調整
                        priority: urlPath.includes('games/') ? '0.8' : '0.7', // 遊戲頁面給予較高優先級
                    });
                }
            }
        }
    }

    walkDir(PAGES_DIR); // 從指定根目錄開始遍歷

    // XML 結構
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
        format: true, // 格式化輸出以提高可讀性
        indentBy: "    "
    });
    const sitemapXml = builder.build(xmlData);

    fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
    console.log('sitemap.xml generated successfully!');
}

generateSitemap().catch(console.error);