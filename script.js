// ====== 通用功能 (所有頁面都會執行) ======

// Helper function to update meta tags (包含 Canonical Tag)
function updateMetaTags(title, description, pageName = "") {
    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // --- 新增 Canonical Tag 邏輯 ---
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.hash = ""; // 移除 hash 
    let baseCanonicalUrl = currentUrl.origin + currentUrl.pathname;

    if (pageName === "index") {
        canonicalLink.href = "https://www.ssbuy.tw/"; 
    } else if (pageName === "game-detail") {
        const gameParam = currentUrl.searchParams.get("game");
        canonicalLink.href = gameParam ? `${baseCanonicalUrl}?game=${encodeURIComponent(gameParam)}` : baseCanonicalUrl;
    } else if (pageName === "giftcodes-detail") { // 禮包碼詳情頁
        const gameParam = currentUrl.searchParams.get("game");
        canonicalLink.href = gameParam ? `${baseCanonicalUrl}?game=${encodeURIComponent(gameParam)}` : baseCanonicalUrl;
    } else if (pageName === "giftcodes-list-overview") { // 禮包碼總覽頁
        canonicalLink.href = "https://www.ssbuy.tw/giftcodes-list.html"; // 固定為總覽頁的 URL
    } else { // 其他靜態頁面，清空所有參數
        currentUrl.search = ""; // 確保其他頁面沒有不必要的參數
        canonicalLink.href = currentUrl.toString();
    }
    // --- Canonical Tag 邏輯結束 ---


    // 如果需要，也可以動態更新 open graph 標籤 (用於社群分享)
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
    }
    ogUrl.content = canonicalLink.href; // OG URL 應該與 Canonical URL 一致

    // 預設的 og:image，請替換為您的預設分享圖片 URL
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
    }
    ogImage.content = 'https://www.ssbuy.tw/logobanner.jpg';

    // 設置 keywords (現在對 SEO 影響較小，但可以考慮)
    let keywords = "速速幫你儲, 手遊儲值, 遊戲代儲, 手遊代儲";
    if (pageName === "index") keywords += ", 最新遊戲, 熱門遊戲";
    else if (pageName === "all-games") keywords += ", 所有遊戲, 遊戲列表";
    else if (pageName === "new-games") keywords += ", 新上遊戲, 最新手遊";
    else if (pageName === "game-detail" && title) keywords += `, ${title.replace('代儲值 - 速速幫你儲手遊', '').trim()}, 遊戲儲值, 遊戲充值`;
    else if (pageName === "giftcodes-detail" && title) keywords += `, ${title.replace('最新禮包碼|兌換碼|序號|免費領取 - 速速幫你儲手遊', '').trim()}, 禮包碼, 兌換碼, 序號, 免費領取`;
    else if (pageName === "giftcodes-list-overview") keywords += ", 好康兌換, 禮包碼列表, 免費禮包碼, 遊戲兌換碼總覽"; // 禮包碼總覽頁
    else if (pageName === "articles" && title) keywords += `, ${title.replace(' - SSbuy最安全的手遊代儲', '').trim()}, 遊戲攻略, 遊戲資訊`;
    else if (pageName === "purchase-guide") keywords += ", 購買教學, 儲值教學, 手遊儲值步驟";
    else if (pageName === "contact") keywords += ", 聯絡客服, 客服中心, 聯絡我們";
    else if (pageName === "disclaimer") keywords += ", 免責聲明, 服務風險, 遊戲代儲風險";
    else if (pageName === "terms-of-service") keywords += ", 服務條款, 用戶協議, 代儲服務條款";
    else if (pageName === "account-verification") keywords += ", 帳戶認證, 首次交易驗證, 帳號安全";
    else if (pageName === "google-verify") keywords += ", Google 復原碼, Google 驗證, 帳號復原教學";
    else if (pageName === "fb-verify") keywords += ", FB 安全碼, Facebook 驗證, 臉書雙重驗證";
    else if (pageName === "711pay") keywords += ", 超商代碼繳費, 7-11 繳費, 超商付款教學";

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
}

document.addEventListener("DOMContentLoaded", () => {
    // 手機版 body class 判斷
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        document.body.classList.add("mobile-vertical");
    }

    // ★ 修正漢堡選單邏輯：確保它在任何頁面都可執行且不被跳過
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");
    if (mobileMenuToggle && mobileDropdownMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileDropdownMenu.classList.toggle("open"); // 使用 toggle，更簡潔
            // 讓手機選單的開合也影響 body 的 overflow，避免滾動
            document.body.classList.toggle("no-scroll"); 
        });
    }

    // 圖片放大燈箱效果 (zoomable class)
    document.querySelectorAll(".zoomable").forEach(img => {
        img.addEventListener("click", () => {
            const fullSrc = img.dataset.src || img.src;

            const overlay = document.createElement("div");
            overlay.className = "image-lightbox-overlay";

            const fullImage = document.createElement("img");
            fullImage.src = fullSrc;

            overlay.appendChild(fullImage);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", () => {
                overlay.classList.add("fade-out");
                setTimeout(() => overlay.remove(), 300);
            });
        });
    });

    // 錨點連結平滑滾動
    // 修正：只對「純錨點」連結執行平滑滾動，避免干擾完整 URL 的連結
    document.querySelectorAll("a[href]").forEach(anchor => { // 選擇所有有 href 屬性的 a 標籤
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) { // 確保是純錨點連結 (e.g. #section1, 而非 # 或 #game)
            anchor.addEventListener("click", function (e) {
                e.preventDefault(); // 阻止預設跳轉行為
                const target = document.querySelector(href);
                target?.scrollIntoView({ behavior: "smooth" });
            });
        }
    });

    // ===== 頁面專屬邏輯 (只在特定頁面執行) ======

    // 首頁 (index.html) 邏輯
    if (document.body.classList.contains("index-page")) {
		updateMetaTags("速速幫你儲手遊 - 專業遊戲代儲平台", "速速幫你儲手遊，提供最安全、快速、優惠的遊戲代儲服務，支援多款熱門手遊，立即體驗！", "index");
		renderGames(); // 渲染首頁遊戲卡片

        // 監聽窗口大小調整，重新渲染遊戲卡片
        window.addEventListener("resize", () => {
            const isNowMobile = window.innerWidth <= 1024;
            const wrapper = document.getElementById("gamesWrapper");
            if (wrapper) {
                // 檢查是否需要重新渲染
                const currentIsMobileVertical = document.body.classList.contains("mobile-vertical");
                if ((isNowMobile && !currentIsMobileVertical) || (!isNowMobile && currentIsMobileVertical)) {
                    wrapper.innerHTML = "";
                    if (isNowMobile) {
                        document.body.classList.add("mobile-vertical");
                    } else {
                        document.body.classList.remove("mobile-vertical");
                    }
                    renderGames();
                }
            }
        });
    }

    // 所有遊戲頁面 (all-games.html) 邏輯
    if (document.body.classList.contains("all-games-page")) {
		updateMetaTags("所有遊戲 - 速速幫你儲手遊", "探索速速幫你儲手遊平台所有支援的熱門手遊列表，輕鬆找到您想儲值的遊戲。", "all-games");
		loadAllGames(); // 載入並顯示所有遊戲
        // filterGames() 函數會由 input 的 oninput 事件觸發，不需要在這裡 DOMContentLoaded 額外綁定
    }

    // 新上遊戲頁面 (new-games.html) 邏輯
    if (document.body.classList.contains("new-games-page")) {
		updateMetaTags("新上遊戲 - 速速幫你儲手遊", "瀏覽速速幫你儲手遊最新上架的遊戲，不錯過任何熱門手遊儲值優惠！", "new-games");
		loadNewGamesContent(); // 專門為 new-games.html 載入最新遊戲
    }

    // 遊戲詳情頁 (game-detail.html) 邏輯
    if (document.body.classList.contains("game-detail")) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameName = urlParams.get("game") ? decodeURIComponent(urlParams.get("game")) : "未知遊戲";

        if (gameName) {
            updateMetaTags(`${gameName} 代儲值 - 速速幫你儲手遊`, `速速幫你儲為您提供${gameName}最安全、快速的代儲值服務，獨享優惠價格，立即體驗！`, "game-detail");

            fetch("games.json")
                .then(response => {
                    if (!response.ok) throw new Error("載入 games.json 失敗: " + response.statusText);
                    return response.json();
                })
                .then(data => {
                    const game = data[gameName];
                    if (game) {
                        loadGameDetails(gameName, game);
                    } else {
                        updateMetaTags("遊戲不存在 - 速速幫你儲手遊", "抱歉，您請求的遊戲不存在或已下架。", "game-detail");
                        console.error("找不到遊戲:", gameName);
                        document.getElementById("gameTitle").textContent = "找不到遊戲";
                        document.getElementById("gameLogo").src = "images/default.jpg";
                        document.getElementById("productList").innerHTML = "<p>目前沒有可購買的商品</p>";
                    }
                })
                .catch(error => {
                    console.error("載入遊戲詳情失敗:", error);
                    document.getElementById("gameTitle").textContent = "載入失敗";
                    document.getElementById("gameLogo").src = "images/default.jpg";
                    document.getElementById("productList").innerHTML = "<p>載入商品失敗</p>";
                    updateMetaTags("載入失敗 - 速速幫你儲手遊", "抱歉，載入遊戲資料失敗，請稍後再試。", "game-detail");
                });
        } else {
            updateMetaTags("未提供遊戲名稱 - 速速幫你儲手遊", "請透過遊戲列表選擇您想要儲值的遊戲。", "game-detail");
            console.error("未提供遊戲名稱");
            document.getElementById("gameTitle").textContent = "未提供遊戲名稱";
            document.getElementById("gameLogo").src = "images/default.jpg";
            document.getElementById("productList").innerHTML = "<p>請選擇一個遊戲</p>";
        }
    }

    // 禮包碼總覽頁面 (giftcodes-list.html) 邏輯
if (document.body.classList.contains("giftcodes-list-page")) {
    console.log("偵測到 giftcodes-list-page 頁面。");
    async function loadGiftcodesOverviewForListPage() {
        updateMetaTags("好康兌換 - SSBUY", "SSBUY提供多款熱門手遊的最新禮包碼兌換資訊，輕鬆查找、立即領取豐厚獎勵！", "giftcodes-list-overview");

        const mainContentArea = document.querySelector('.main-content');
        if (!mainContentArea) {
            console.error("無法找到 .main-content 元素來渲染禮包碼總覽頁面。");
            return;
        }

        const gameSearchInput = document.getElementById('game-search-input');
        const searchButton = document.getElementById('search-button');
        const giftcodeGameList = document.getElementById('giftcode-game-list'); 

        // --- 新增：定義隨機副標題陣列 ---
        const randomSubtitles = [
            "豐富虛寶等你領",
            "最新兌換碼集中",
            "每日更新禮包碼",
            "限定序號大放送",
            "馬上兌換拿好禮",
            "禮包碼攻略大全"
        ];

        // --- 新增：隨機選擇副標題的函數 ---
        function getRandomSubtitle() {
            const randomIndex = Math.floor(Math.random() * randomSubtitles.length);
            return randomSubtitles[randomIndex];
        }
        // --- 新增結束 ---

        let allGamesData = {};
        try {
            const response = await fetch("gift-codes-data.json");
            if (!response.ok) throw new Error("載入 gift-codes-data.json 失敗: " + response.statusText);
            allGamesData = await response.json();
        } catch (error) {
            console.error("載入禮包碼數據失敗:", error);
            if (giftcodeGameList) {
                giftcodeGameList.innerHTML = `<p style="color: red;">載入遊戲列表失敗，請稍後再試。</p>`;
            }
            return;
        }

        const gamesArray = Object.keys(allGamesData).map(gameName => ({
            name: gameName,
            banner: allGamesData[gameName].banner, // 總覽頁面依然使用 banner
            id: encodeURIComponent(gameName)
        }));

        function populateGiftcodeGameList(gamesToDisplay) {
            if (!giftcodeGameList) return; 
            giftcodeGameList.innerHTML = '';
            if (gamesToDisplay.length === 0) {
                giftcodeGameList.innerHTML = '<p>沒有找到符合條件的遊戲。</p>';
                return;
            }
            gamesToDisplay.forEach(game => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="gift-codes.html?game=${game.id}" class="giftcode-item-card">
                        <img src="${game.banner}" alt="${game.name} Banner" class="game-banner-img" onerror="this.src='giftcodesbanner/default.jpg'; this.onerror=null;">
                        <div class="game-info">
                            <div class="game-name-title">${game.name}</div>
                            <div class="giftcode-subtitle">${new Date().getFullYear()}${getRandomSubtitle()}</div> </div>
                    </a>
                `;
                giftcodeGameList.appendChild(listItem);
            });
        }

        populateGiftcodeGameList(gamesArray.sort((a, b) => a.name.localeCompare(b.name)));

        searchButton.addEventListener('click', () => {
            const searchTerm = gameSearchInput.value.toLowerCase();
            const filteredGames = gamesArray.filter(game =>
                game.name.toLowerCase().includes(searchTerm)
            );
            populateGiftcodeGameList(filteredGames.sort((a, b) => a.name.localeCompare(b.name)));
        });

        gameSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            } else {
                const searchTerm = gameSearchInput.value.toLowerCase();
                const filteredGames = gamesArray.filter(game =>
                    game.name.toLowerCase().includes(searchTerm)
                );
                populateGiftcodeGameList(filteredGames.sort((a, b) => a.name.localeCompare(b.name)));
            }
        });
    }
    loadGiftcodesOverviewForListPage(); // 初始載入總覽頁面
}

    // 禮包碼詳情頁面 (gift-codes.html) 邏輯
    if (document.body.classList.contains("giftcodes-detail-page")) {
        const mainGiftcodesContainer = document.getElementById("giftcodes-main-container");
        const urlParams = new URLSearchParams(window.location.search);
        const gameNameParam = urlParams.get("game");

        // 確保有 game 參數才渲染詳情
        if (!gameNameParam) {
            // 如果沒有 game 參數，表示是直接訪問了 gift-codes.html 且沒有帶參數，應該導向總覽頁
            window.location.replace("giftcodes-list.html");
            return; // 阻止後續代碼執行
        }

        async function renderGameGiftcodeDetailPage() { // 不再需要參數，從 gameNameParam 獲取
            const gameName = decodeURIComponent(gameNameParam); // 在這裡解碼 gameNameParam

            updateMetaTags(`${gameName} 最新禮包碼|兌換碼|序號|免費領取 - 速速幫你儲手遊`, `獲取${gameName}最新的禮包碼、兌換碼、序號，免費領取豐厚遊戲獎勵，立即提升戰力！`, "giftcodes-detail");

            let gameDataRaw = {};
			let allGamesLogos = {}; // 從 games.json 來的數據 (用於推薦遊戲小圖)
            
			try {
                // 使用 Promise.all 同時發送兩個 fetch 請求
                const [giftCodesResponse, gamesJsonResp] = await Promise.all([
                    fetch("gift-codes-data.json"),
                    fetch("games.json") // <--- 這裡確保載入了 games.json
                ]);

                if (!giftCodesResponse.ok) throw new Error("載入 gift-codes-data.json 失敗: " + giftCodesResponse.statusText);
                if (!gamesJsonResp.ok) throw new Error("載入 games.json 失敗: " + gamesJsonResp.statusText);
                
                gameDataRaw = await giftCodesResponse.json();
                allGamesLogos = await gamesJsonResp.json(); // 解析 games.json 數據
            } catch (error) {
                console.error("載入數據失敗:", error);
                mainGiftcodesContainer.innerHTML = `<p style="color: red;">載入遊戲資料失敗，請稍後再試。</p><p><a href="giftcodes-list.html" id="back-to-overview">返回好康兌換總覽</a></p>`;
                return;
            }

            const game = gameDataRaw[gameName];

            if (!game) {
                mainGiftcodesContainer.innerHTML = `<p>❌ 找不到 ${gameName} 的禮包碼資料。</p><p><a href="giftcodes-list.html" id="back-to-overview">返回好康兌換總覽</a></p>`;
                document.getElementById('back-to-overview').addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.replace("giftcodes-list.html");
                });
                return;
            }

            const currentYear = new Date().getFullYear();
            const pageTitle = `${gameName} 最新 禮包碼/兌換碼/序號/免費領取`;
            
            let codesHtml = '';
            if (game.codes && game.codes.length > 0) {
                codesHtml = game.codes.map(item => `
                    <tr>
                        <td><button class="copy-button" data-code="${item.code}">${item.code}</button></td>
                        <td>${item.reward}</td>
                    </tr>
                `).join('');
            } else {
                codesHtml = `<tr><td colspan="2">目前沒有公開的禮包碼。</td></tr>`;
            }

            let howToHtml = '';
            if (game.howTo && game.howTo.length > 0) {
                howToHtml = game.howTo.map(step => `<li>${step}</li>`).join('');
            } else {
                howToHtml = `<li>無特別說明，請參考遊戲內指引。</li>`;
            }

            mainGiftcodesContainer.innerHTML = `
                <a href="https://lihi.cc/OjPRl" target="_blank"> 
                    <img id="giftBanner" class="banner-image" src="${game.banner || 'giftcodesbanner/default.jpg'}" alt="${gameName}禮包碼橫幅圖">
                </a>

                <h1 id="giftTitle">${pageTitle}</h1>

                <h2>目錄</h2>
                <ol>
                    <li><a href="#section1">最新禮包碼分享</a></li>
                    <li><a href="#section2">禮包兌換碼</a></li>
                    <li><a href="#section3">要怎麼兌換禮包碼？</a></li>
                    <li><a href="#section4">遊戲內容是什麼？</a></li>
                    <li><a href="#section5">注意事項</a></li>
                    <li><a href="#section6">延伸閱讀</a></li>
                    <li><a href="#section7">新遊戲推薦</a></li>
                </ol>

                <h2 id="section1">1. 最新禮包碼分享</h2>
                <p>小編今天來分享<strong id="gameName1" class="normal">${gameName}</strong>在${currentYear}年最新的禮包碼囉！千萬別錯過，蒐集遊戲內官方資訊、玩家分享的<strong id="gameName2" class="normal">${gameName}</strong>各式禮包碼、序號、兌換碼，內含兌換教學以及儲值優惠！趕緊來看看吧～</p>

                <h2 id="section2">2. 禮包碼如下(點擊禮包碼複製)</h2>
                <table class="gift-table">
                    <thead>
                        <tr><th>禮包碼</th><th>內容物</th></tr>
                    </thead>
                    <tbody>
                        ${codesHtml}
                    </tbody>
                </table>

                <h2 id="section3">3. 兌換方式</h2>
                <ol>${howToHtml}</ol>

                <h2 id="section4">4. 遊戲介紹</h2>
                <p class="normal">${game.description || '無遊戲簡介。'}</p>

                <h2 id="section5">5. 注意事項</h2>
                <p class="normal">禮包碼多數有時間或數量限制，建議看到馬上使用避免失效。</p>

                <h2 id="section6">6. 延伸閱讀</h2>
                <ul>
                    <li><a href="account-verification.html">首次交易驗證</a></li>
                    <li><a href="google-verify.html">Google 復原碼教學</a></li>
                    <li><a href="fb-verify.html">FB 安全碼教學</a></li>
                    <li><a href="711pay.html">超商代碼繳費教學</a></li>
                    <li><a href="contact.html">聯絡客服</a></li>
                    <li><a id="backToGameDetailBtn" href="game-detail.html?game=${encodeURIComponent(gameName)}">🌟馬上回去儲值🌟</a></li>
                </ul>

                <h2 id="section7">7. 新遊戲推薦</h2>
                <div id="new-games-container" class="new-games-container-scroll">
                    </div>
                <p><a href="giftcodes-list.html" id="back-to-overview">⬅️返回好康兌換總覽</a></p>
            `;

            mainGiftcodesContainer.querySelectorAll('.copy-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const codeToCopy = e.target.dataset.code;
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        alert('禮包碼「' + codeToCopy + '」已複製！');
                    }).catch(err => {
                        console.error('複製失敗: ', err);
                        alert('複製失敗，請手動複製。');
                    });
                });
            });

            document.getElementById('back-to-overview').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.replace("giftcodes-list.html"); // 返回總覽頁面
            });

                // 調用最新遊戲渲染，明確指定 limit = 10
			const newGamesRecommendationContainer = document.getElementById('new-games-container');
			await loadLatestGamesInGiftcodesPage(newGamesRecommendationContainer, 10);
        }
        renderGameGiftcodeDetailPage(); // 初始載入詳情頁面
    }


});


// ====== 函數定義 (所有頁面可能調用，或只在特定頁面調用) ======

async function renderGames() {
    const wrapper = document.getElementById('gamesWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = "";

    let gameData = [];
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("無法載入 games.json: " + response.statusText);
        gameData = await response.json();

        // 檢查 games.json 是物件的情況，轉換為陣列
        if (!Array.isArray(gameData)) {
             gameData = Object.entries(gameData).map(([name, info]) => ({
                name,
                logo: info.logo,
                // 如果需要，也可以將其他 info 屬性帶過來
            }));
        }
    } catch (error) {
        console.error("❌ 無法載入 games.json (renderGames):", error);
        wrapper.innerHTML = `<p style="color: red;">載入遊戲列表失敗，請稍後再試。</p>`;
        return;
    }

    // 確保遊戲總數至少 26 個（兩排，每排 13 個），若不夠則重複填充
    while (gameData.length < 26) {
        gameData = gameData.concat(gameData);
    }
    gameData = gameData.sort(() => Math.random() - 0.5);
    let gameChunks = [
        gameData.slice(0, 13),
        gameData.slice(13, 26)
    ];

    const isMobileVertical = window.innerWidth <= 1024;
    if (isMobileVertical) {
        renderVerticalLoopSlider(wrapper, gameChunks);
        return;
    }

    for (let i = 0; i < 2; i++) {
        const slider = document.createElement('div');
        slider.classList.add('game-slider-container');

        slider.innerHTML = `
            <button class="slider-button left" onclick="moveSlide(-1, 'gamesContainer${i}')">❮</button>
            <div class="game-slider" id="gamesContainer${i}"></div>
            <button class="slider-button right" onclick="moveSlide(1, 'gamesContainer${i}')">❯</button>
        `;
        wrapper.appendChild(slider);

        const container = slider.querySelector('.game-slider');
        const initialMultiplier = 3;
        let extendedGames = [];
        for (let j = 0; j < initialMultiplier; j++) {
            extendedGames = extendedGames.concat(gameChunks[i]);
        }

        extendedGames.forEach((game) => {
            const card = document.createElement('a'); // 將 card 直接設為 a 標籤
            card.classList.add('card', 'game-card');
            card.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

            const img = document.createElement('img');
            img.src = game.logo;
            img.alt = game.name;
            img.onerror = () => {
                img.src = "images/default.jpg";
                img.onerror = null;
            };

            const text = document.createElement('div');
            text.classList.add('game-title');
            text.textContent = game.name;

            card.appendChild(img);
            card.appendChild(text);
            container.appendChild(card);
        });

        const visibleCards = 5;
        const initialIndex = Math.floor((gameChunks[i].length - visibleCards) / 2);
        const cardWidth = 220;

        let initialOffset = initialIndex * cardWidth;
        container.style.transform = `translateX(-${initialOffset}px)`;
        container.setAttribute('data-index', initialIndex);
        container.setAttribute('data-offset', initialOffset);
        container.setAttribute('data-original-length', gameChunks[i].length);
    }
}

// 滑動功能（實現真正的無限滑動）
function moveSlide(direction, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const originalLength = parseInt(container.getAttribute('data-original-length'));
    const cardWidth = 220;
    const visibleCards = 5;
    let currentIndex = parseInt(container.getAttribute('data-index')) || 0;
    let currentOffset = parseFloat(container.getAttribute('data-offset')) || 0;

    const moveDistance = direction * cardWidth;
    currentOffset += moveDistance;
    currentIndex += direction;

    let totalCards = container.querySelectorAll('.game-card').length;

    if (direction > 0) { // Moving right
        if (currentIndex >= totalCards - visibleCards - 1) {
            const cards = container.querySelectorAll('.game-card');
            const cardsToAppend = Array.from(cards).slice(0, originalLength);
            cardsToAppend.forEach(card => {
                const clonedCard = card.cloneNode(true);
                // 重新綁定事件，因為 cloneNode(true) 不會複製事件監聽器
                // 確保 cloneNode 的點擊事件也是正確的 href
                const gameNameElement = clonedCard.querySelector('.game-title');
                if (gameNameElement) {
                    const gameName = gameNameElement.textContent;
                    clonedCard.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
                } else {
                    clonedCard.href = `game-detail.html`; // fallback
                }
                container.appendChild(clonedCard);
            });
        }
    } else { // Moving left
        if (currentIndex < 1) {
            const cards = container.querySelectorAll('.game-card');
            const cardsToPrepend = Array.from(cards).slice(-originalLength);
            cardsToPrepend.reverse().forEach(card => {
                const clonedCard = card.cloneNode(true);
                // 重新綁定事件
                const gameNameElement = clonedCard.querySelector('.game-title');
                if (gameNameElement) {
                    const gameName = gameNameElement.textContent;
                    clonedCard.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
                } else {
                    clonedCard.href = `game-detail.html`; // fallback
                }
                container.insertBefore(clonedCard, container.firstChild);
            });
            currentIndex += originalLength;
            currentOffset += originalLength * cardWidth;
        }
    }

    totalCards = container.querySelectorAll('.game-card').length; // Update totalCards after appending/prepending

    const maxCards = originalLength * 5;
    if (totalCards > maxCards) {
        if (direction > 0) {
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                if (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            currentIndex -= cardsToRemove;
            currentOffset -= cardsToRemove * cardWidth;
        } else {
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                if (container.lastChild) {
                    container.removeChild(container.lastChild);
                }
            }
        }
    }

    container.style.transform = `translateX(-${currentOffset}px)`;
    container.setAttribute('data-index', currentIndex);
    container.setAttribute('data-offset', currentOffset);
}

function renderVerticalLoopSlider(wrapper, gameChunks) {
    for (let i = 0; i < 2; i++) {
        const slider = document.createElement("div");
        slider.classList.add("game-slider-container");

        const sliderInner = document.createElement("div");
        sliderInner.classList.add("game-slider");

        slider.appendChild(sliderInner);
        wrapper.appendChild(slider);

        let extended = [];
        for (let j = 0; j < 10; j++) {
            extended = extended.concat(gameChunks[i]);
        }

        function createCard(game) {
            const card = document.createElement("a"); // 這裡也改為 a 標籤
            card.classList.add("card", "game-card");
            card.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

            const img = document.createElement("img");
            img.src = game.logo;
            img.alt = game.name;
            img.onerror = () => {
                img.src = "images/default.jpg";
                img.onerror = null;
            };

            const text = document.createElement("div");
            text.classList.add("game-title");
            text.textContent = game.name;

            card.appendChild(img);
            card.appendChild(text);
            return card;
        }

        extended.forEach(game => {
            sliderInner.appendChild(createCard(game));
        });

        slider.addEventListener("scroll", () => {
            if (slider.scrollTop + slider.clientHeight >= slider.scrollHeight - 10) {
                extended.forEach(game => {
                    sliderInner.appendChild(createCard(game));
                });
            }

            if (slider.scrollTop <= 10) {
                const cardsToAdd = extended.slice().reverse();
                cardsToAdd.forEach(game => {
                    const card = createCard(game);
                    sliderInner.insertBefore(card, sliderInner.firstChild);
                    slider.scrollTop += card.offsetHeight;
                });
            }
        });
    }
}


function loadGameDetails(gameName, game) {
    const gameLogo = document.getElementById("gameLogo");
    if (gameLogo) { // null check
        gameLogo.src = game.logo;
        gameLogo.alt = gameName;
        gameLogo.onerror = () => {
            gameLogo.src = "images/default.jpg";
            gameLogo.onerror = null;
        };
    }
    
    const gameTitleElement = document.getElementById("gameTitle");
    if (gameTitleElement) { // null check
        gameTitleElement.textContent = `${gameName} 代儲值`;
    }

    const gameNameInput = document.getElementById("gameName");
    if (gameNameInput) { // null check
        gameNameInput.value = gameName;
    }

    const gameDescriptionElement = document.getElementById("gameDescription");
    if (gameDescriptionElement) { // null check
        gameDescriptionElement.innerHTML = `
            請確認好帳戶資料和所購買商品無誤再結帳，感謝您的支持。<br>
            一切問題歡迎私訊官方@客服。<br>
            歡迎加入 LINE@ 生活圈 ID：@ssbuy (@也要輸入)。<br>
            我們將不定時舉辦抽優惠券與點卡活動哦!
        `;
    }
	
	    // ====== 新增這一段程式碼：載入遊戲簡介 ======
    const gameIntroActualDescriptionElement = document.getElementById("gameIntroActualDescription");
    if (gameIntroActualDescriptionElement && game.description) {
        gameIntroActualDescriptionElement.textContent = game.description;
    } else if (gameIntroActualDescriptionElement) {
        // 如果 JSON 中沒有簡介，可以設定為空或預設文字
        gameIntroActualDescriptionElement.textContent = ""; 
        // 也可以隱藏這個元素，如果不想顯示空白行
        // gameIntroActualDescriptionElement.style.display = "none";
    }
    // ===========================================
	
	    // 新增：設定攻略與禮包碼連結
    const gameArticleLink = document.getElementById("gameArticleLink");
    if (gameArticleLink) {
        gameArticleLink.href = `articles.html?game=${encodeURIComponent(gameName)}`;
    }
    const gameGiftCodeLink = document.getElementById("gameGiftCodeLink");
    if (gameGiftCodeLink) {
        gameGiftCodeLink.href = `gift-codes.html?game=${encodeURIComponent(gameName)}`;
    }

    const socialContainer = document.querySelector(".social-media p");
    if (socialContainer) {
        const socialLinks = Object.entries(game.social).map(([name, url]) => {
            const link = url && url !== "N" ? url : "#";
            return `<a href="${link}" target="_blank">${name}</a>`;
        });

        const line1 = socialLinks.slice(0, 3).join(" | ");
        const line2 = socialLinks.slice(3).join(" | ");

        socialContainer.innerHTML = `
            <div class="social-line line1">${line1}</div>
            <div class="social-line line2">${line2}</div>
        `;
    }

    if (game && game.products) {
        loadProducts(game.products);
    } else {
        const productContainer = document.getElementById("productList");
        if (productContainer) {
            productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
        }
    }
}

function loadProducts(products) {
    const productContainer = document.getElementById("productList");
    if (!productContainer) return;

    productContainer.innerHTML = "";

    if (!products || products.length === 0) {
        productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
        return;
    }

    products.forEach(product => {
        const row = document.createElement("div");
        row.classList.add("product-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = product.price;
        checkbox.dataset.name = product.name;
        checkbox.addEventListener("change", updateTotal);

        const name = document.createElement("span");
        name.textContent = product.name;
        name.classList.add("product-name");

        const priceContainer = document.createElement("div");
        priceContainer.classList.add("price-container");
		priceContainer.innerHTML = `<span class="price-value">NT$${product.price}</span>`;


        row.appendChild(checkbox);
        row.appendChild(name);
        row.appendChild(priceContainer);
        productContainer.appendChild(row);
    });
}

function updateTotal() {
    let total = 0;
    let selectedProducts = [];

    document.querySelectorAll("#productList input[type='checkbox']:checked").forEach(checkbox => {
        total += parseInt(checkbox.value);
        selectedProducts.push(checkbox.dataset.name);
    });

    const selectedProductsField = document.getElementById("selectedProducts");
    if (selectedProductsField) {
        selectedProductsField.value = selectedProducts.length > 0 ? selectedProducts.join(" + ") : "購買商品";
        selectedProductsField.style.height = "auto";
        selectedProductsField.style.height = Math.min(selectedProductsField.scrollHeight, 120) + "px";
    }

    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
        totalAmountElement.innerHTML = `<strong>結帳總金額: NT$${total}</strong>`;
    }
}

function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {
        const gameName = card.querySelector(".game-title").textContent.toLowerCase();
        card.style.display = gameName.includes(searchQuery) ? "block" : "none";
    });
}


async function loadAllGames() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();

        let games = Object.keys(gamesData).map(gameName => ({
            name: gameName,
            logo: gamesData[gameName].logo
        }));

        games = games.sort(() => Math.random() - 0.5);

        displayGames(games);
    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
        const gamesContainer = document.getElementById("gamesContainer");
        if(gamesContainer) {
            gamesContainer.innerHTML = `<p style="color: red;">無法載入所有遊戲列表。</p>`;
        }
    }
}

function displayGames(games) {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;

    gamesContainer.innerHTML = "";

    games.forEach(game => {
        const gameCard = document.createElement("a"); // 改為 <a> 標籤
        gameCard.classList.add("card", "game-card");
        gameCard.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = game.name;
        img.onerror = () => {
            img.src = "images/default.jpg";
            img.onerror = null;
        };

        const gameName = document.createElement("div");
        gameName.classList.add("game-title");
        gameName.textContent = game.name;

        gameCard.appendChild(img);
        gameCard.appendChild(gameName);
        gamesContainer.appendChild(gameCard);

        // 移除 click event listener，因為 <a> 標籤的 href 會自動處理導航
        // gameCard.addEventListener("click", () => {
        //     window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        // });
    });
}

// Function to load latest games specifically for new-games.html
async function loadNewGamesContent() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("無法載入遊戲資料");
        const data = await response.json();

        const gameEntries = Object.entries(data);
        const latestGames = gameEntries.slice(-15).reverse();

        const container = document.getElementById("new-games-container");
        if (container) {
            container.innerHTML = "";

            latestGames.forEach(([name, info]) => {
                const gameCard = document.createElement("a"); // 改為 <a> 標籤
                gameCard.classList.add("new-game-item");
                gameCard.href = `game-detail.html?game=${encodeURIComponent(name)}`; // 設定 href

                gameCard.innerHTML = `
                    <div class="card new-game-card">
                        <img src="${info.logo}" alt="${name}" onerror="this.src='images/default.jpg'; this.onerror=null;">
                        <div class="game-title">${name}</div>
                    </div>
                `;
                container.appendChild(gameCard);
            });
        }
    } catch (error) {
        console.error("Error loading new games content:", error);
        const container = document.getElementById("new-games-container");
        if(container) {
            container.innerHTML = `<p style="color: red;">無法載入最新遊戲列表。</p>`;
        }
    }
}

// Function to load latest games specifically for giftcodes.html
async function loadLatestGamesInGiftcodesPage(container, limit = 10) {
    console.log(`loadLatestGamesInGiftcodesPage 調用，限制數量: ${limit}`); // 調試用
    if (!container) {
        console.error("找不到 new-games-container");
        return;
    }

    // 清空容器，防止重複添加
    container.innerHTML = "";
    container.className = "fixed-card-grid";

    try {
        const res = await fetch("games.json");
        if (!res.ok) throw new Error("載入 games.json 失敗: " + res.statusText);
        const data = await res.json();

        // 確保只取最後 limit 個遊戲，並反轉順序
        const gameNames = Object.keys(data).slice(-limit).reverse();
        console.log(`實際載入遊戲數: ${gameNames.length}`); // 調試用

        const isMobile = window.innerWidth <= 1024;

        // 清空並重新渲染遊戲卡片
        gameNames.forEach((name) => {
            const game = data[name];
            const card = document.createElement("a");
            card.className = "card game-card";
            card.href = `game-detail.html?game=${encodeURIComponent(name)}`;

            const img = document.createElement("img");
            img.src = game.logo;
            img.alt = name;
            img.onerror = () => {
                img.src = "images/default.jpg";
                img.onerror = null;
            };

            const title = document.createElement("div");
            title.className = "game-title";
            title.textContent = name;

            card.appendChild(img);
            card.appendChild(title);
            container.appendChild(card);
        });

        container.classList.add(isMobile ? "gift-mobile-grid" : "gift-desktop-grid");
    } catch (error) {
        console.error("載入最新遊戲失敗:", error);
        container.innerHTML = `<p style="color: red;">無法載入最新遊戲列表。</p>`;
    }
}