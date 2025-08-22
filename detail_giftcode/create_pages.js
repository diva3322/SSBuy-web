const fs = require('fs');
const path = require('path');

function createSafeFileName(gameName) {
    if (!gameName) return '';
    // [修改重點] 移除了 .toLowerCase()，保留原始大小寫
    let safeName = gameName.replace(/[\\/?*"<>|]/g, '');
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    return safeName + '.html';
}

console.log('🚀 開始智慧生成網頁 (只更新有變動的檔案)...');

// --- 檔案路徑設定 ---
const gamesDataPath = path.join(__dirname, 'data', 'games.json');
const giftCodesDataPath = path.join(__dirname, 'data', 'gift-codes-data.json');
const detailTemplatePath = path.join(__dirname, 'templates', 'gamedetail-template.html');
const giftcodeTemplatePath = path.join(__dirname, 'templates', 'giftcodes-template.html');
const outputDir = path.join(__dirname, 'dist');

try {
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    const giftCodesData = JSON.parse(fs.readFileSync(giftCodesDataPath, 'utf8'));
    const detailTemplate = fs.readFileSync(detailTemplatePath, 'utf8');
    const giftcodeTemplate = fs.readFileSync(giftcodeTemplatePath, 'utf8');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const detailOutputDir = path.join(outputDir, 'gamedetail');
    const giftcodeOutputDir = path.join(outputDir, 'giftcodes');
    if (!fs.existsSync(detailOutputDir)) fs.mkdirSync(detailOutputDir);
    if (!fs.existsSync(giftcodeOutputDir)) fs.mkdirSync(giftcodeOutputDir);

    const allGameNames = Object.keys(gamesData);
    const latest10Games = allGameNames.slice(-10).reverse();

    const newGamesRecommendationHtml = latest10Games.map(recGameName => {
        const recGameInfo = gamesData[recGameName];
        const recFileName = createSafeFileName(recGameName);
        const linkPath = `../gamedetail/${encodeURIComponent(recFileName)}`; 
        const logoPath = `/${recGameInfo.logo}`;
        return `
            <a href="${linkPath}" class="card game-card">
                <img src="${logoPath}" alt="${recGameName}" onerror="this.onerror=null;this.src='/images/default.jpg';">
                <div class="game-title">${recGameName}</div>
            </a>
        `;
    }).join('\n');

    let changesMade = 0;
    let newGames = [];
    let updatedGames = [];

    for (const gameName in gamesData) {
        if (!gamesData.hasOwnProperty(gameName)) continue;
        const gameInfo = gamesData[gameName];
        const giftCodeInfo = giftCodesData[gameName];
        const fileName = createSafeFileName(gameName);

        // --- A. 生成遊戲詳情頁 ---
        let detailPageHtml = detailTemplate;
        detailPageHtml = detailPageHtml.replace(/{{GAME_TITLE}}/g, gameName);
        detailPageHtml = detailPageHtml.replace(/{{GAME_DESCRIPTION}}/g, gameInfo.description || '');
        detailPageHtml = detailPageHtml.replace(/{{GAME_LOGO}}/g, gameInfo.logo || 'images/default.jpg');
        detailPageHtml = detailPageHtml.replace(/{{FILE_NAME}}/g, encodeURIComponent(fileName));
        const socialLinksHtml = Object.entries(gameInfo.social || {}).map(([site, url]) => `<a href="${url}" target="_blank">${site}</a>`).join(' | ');
        detailPageHtml = detailPageHtml.replace('{{SOCIAL_LINKS}}', socialLinksHtml);
        const productsHtml = (gameInfo.products || []).map(p => `
            <div class="product-item" data-price="${p.price}" data-name="${p.name}">
                <input type="checkbox" class="product-checkbox">
                <span class="product-name">${p.name}</span>
                <span class="product-price">${typeof p.price === 'number' ? `NT$${p.price}` : p.price}</span>
            </div>
        `).join('\n');
        detailPageHtml = detailPageHtml.replace('{{PRODUCTS_LIST}}', productsHtml);
        
        const detailOutputPath = path.join(detailOutputDir, fileName);
        // [修改重點] 判斷是新增還是修改
        if (!fs.existsSync(detailOutputPath)) {
            fs.writeFileSync(detailOutputPath, detailPageHtml);
            if (!newGames.includes(gameName)) newGames.push(gameName);
            changesMade++;
        } else if (fs.readFileSync(detailOutputPath, 'utf8') !== detailPageHtml) {
            fs.writeFileSync(detailOutputPath, detailPageHtml);
            if (!updatedGames.includes(gameName)) updatedGames.push(gameName);
            changesMade++;
        }

        // --- B. 生成禮包碼頁 ---
        if (giftCodeInfo) {
            let giftcodePageHtml = giftcodeTemplate;
            giftcodePageHtml = giftcodePageHtml.replace(/{{GAME_TITLE}}/g, gameName);
            giftcodePageHtml = giftcodePageHtml.replace(/{{BANNER_IMG}}/g, giftCodeInfo.banner || 'giftcodesbanner/default.jpg');
            giftcodePageHtml = giftcodePageHtml.replace(/{{GAME_DESCRIPTION}}/g, giftCodeInfo.description || '暫無遊戲介紹。');
            giftcodePageHtml = giftcodePageHtml.replace(/{{FILE_NAME}}/g, encodeURIComponent(fileName));
            giftcodePageHtml = giftcodePageHtml.replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear());
            const howToHtml = (giftCodeInfo.howTo || []).map(step => `<li>${step}</li>`).join('\n');
            giftcodePageHtml = giftcodePageHtml.replace('{{HOW_TO_LIST}}', howToHtml);
            const codesHtml = (giftCodeInfo.codes && giftCodeInfo.codes.length > 0) 
                ? giftCodeInfo.codes.map(c => `<tr><td><button class="copy-button" data-code="${c.code}">${c.code}</button></td><td>${c.reward}</td></tr>`).join('\n')
                : '<tr><td colspan="2">目前沒有可用的禮包碼。</td></tr>';
            giftcodePageHtml = giftcodePageHtml.replace('{{GIFT_CODES_TABLE}}', codesHtml);
            giftcodePageHtml = giftcodePageHtml.replace('{{NEW_GAMES_RECOMMENDATION_HTML}}', newGamesRecommendationHtml);
            
            const giftcodeOutputPath = path.join(giftcodeOutputDir, fileName);
            // [修改重點] 判斷是新增還是修改
            if (!fs.existsSync(giftcodeOutputPath)) {
                fs.writeFileSync(giftcodeOutputPath, giftcodePageHtml);
                if (!newGames.includes(gameName)) newGames.push(gameName);
                changesMade++;
            } else if (fs.readFileSync(giftcodeOutputPath, 'utf8') !== giftcodePageHtml) {
                fs.writeFileSync(giftcodeOutputPath, giftcodePageHtml);
                if (!updatedGames.includes(gameName)) updatedGames.push(gameName);
                changesMade++;
            }
        }
    }

    console.log(`\n🎉 --- 所有頁面檢查完畢！ ---`);
    // [修改重點] 顯示最終的摘要報告
    if (changesMade > 0) {
        if (newGames.length > 0) {
            newGames.forEach(game => console.log(`  ✨ "${game}" 新增遊戲完成`));
        }
        if (updatedGames.length > 0) {
            updatedGames.forEach(game => console.log(`  🔄 "${game}" 內容修改完成`));
        }
    } else {
        console.log('   所有檔案都已是最新版本，無需更新。');
    }

} catch (error) {
    console.error('❌ 發生錯誤！請檢查檔案是否存在或 JSON 格式是否正確。');
    console.error(error);
}