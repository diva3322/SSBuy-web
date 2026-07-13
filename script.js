// ====== 輔助函數 (Helper Functions) ======

function createSafeFileName(gameName) {
    if (!gameName) return '';
    let safeName = gameName.replace(/[\\/?*"<>|]/g, '');
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    return safeName + '.html';
}

function setupSearchFunctionality() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', filterGames);
        const clearBtn = document.getElementById('clearSearchBtn');
        if(clearBtn) {
            searchBox.addEventListener('input', () => {
                clearBtn.style.display = searchBox.value.length > 0 ? 'flex' : 'none';
            });
            clearBtn.addEventListener('click', () => {
                searchBox.value = '';
                clearBtn.style.display = 'none';
                searchBox.dispatchEvent(new Event('input'));
            });
        }
    }
}

// ====== 主要邏輯 (在頁面載入後執行) ======

document.addEventListener("DOMContentLoaded", () => {
    // --- 通用功能 ---
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");
    if (mobileMenuToggle && mobileDropdownMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileDropdownMenu.classList.toggle("open");
        });
    }

    // --- 頁面專屬邏輯 ---
    const bodyClassList = document.body.classList;
    if (bodyClassList.contains("index-page")) { renderIndexGames(); }
    else if (bodyClassList.contains("all-games-page")) { loadAllGames(); }
    else if (bodyClassList.contains("new-games-page")) { loadNewGamesContent(); }
    else if (bodyClassList.contains("giftcodes-list-page")) { loadGiftcodesOverview(); }
    else if (bodyClassList.contains("game-detail")) { setupGameDetailPageInteraction(); }
    else if (bodyClassList.contains("giftcodes-detail-page")) { setupGiftCodeDetailPageInteraction(); }
});


// ====== 函數定義 ======

// 函數：建立單張遊戲卡片 (共用)
function createGameCard(gameName, gameInfo) {
    const fileName = createSafeFileName(gameName);
    const card = document.createElement('a');
    card.className = 'card game-card';
    card.href = `/detail_giftcode/dist/gamedetail/${encodeURIComponent(fileName)}`;
    card.innerHTML = `
        <img src="/${gameInfo.logo}" alt="${gameName}" onerror="this.onerror=null;this.src='/images/default.jpg';">
        <div class="game-title">${gameName}</div>
    `;
    return card;
}


// [修改重點] 函數：渲染首頁的輪播遊戲卡片 (恢復左右箭頭功能)
async function renderIndexGames() {
    const wrapper = document.getElementById('gamesWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = "正在載入遊戲...";
    try {
        const response = await fetch("./detail_giftcode/data/games.json");
        if (!response.ok) throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        const gamesData = await response.json();
        wrapper.innerHTML = "";

        const gameEntries = Object.entries(gamesData);
        const shuffledGames = gameEntries.sort(() => 0.5 - Math.random());
        while (shuffledGames.length > 0 && shuffledGames.length < 26) {
            shuffledGames.push(...shuffledGames);
        }
        const gameChunks = [shuffledGames.slice(0, 13), shuffledGames.slice(13, 26)];

        gameChunks.forEach((chunk, i) => {
            const sliderId = `gamesContainer${i}`;
            const slider = document.createElement('div');
            slider.className = 'game-slider-container';
            
            slider.innerHTML = `
                <button class="slider-button left">❮</button>
                <div class="game-slider" id="${sliderId}"></div>
                <button class="slider-button right">❯</button>
            `;
            wrapper.appendChild(slider);

            const container = slider.querySelector(`#${sliderId}`);
            chunk.forEach(([gameName, gameInfo]) => {
                const fileName = createSafeFileName(gameName);
                const card = document.createElement('a');
                card.className = 'card game-card';
                card.href = `detail_giftcode/dist/gamedetail/${encodeURIComponent(fileName)}`;
                card.innerHTML = `
                    <img src="${gameInfo.logo}" alt="${gameName}" onerror="this.onerror=null;this.src='images/default.jpg';">
                    <div class="game-title">${gameName}</div>
                `;
                container.appendChild(card);
            });

            // --- [修改重點] 為按鈕加上點擊事件 (更穩健的寫法) ---
            const leftButton = slider.querySelector('.left');
            const rightButton = slider.querySelector('.right');
            
            if (leftButton && rightButton) {
                leftButton.addEventListener('click', () => {
                    console.log(`點擊了左邊按鈕，控制: #${sliderId}`);
                    moveSlide(-1, sliderId);
                });
                
                rightButton.addEventListener('click', () => {
                    console.log(`點擊了右邊按鈕，控制: #${sliderId}`);
                    moveSlide(1, sliderId);
                });
            } else {
                 console.error(`錯誤：找不到 #${sliderId} 的左右按鈕！`);
            }
        });

    } catch (error) {
        console.error("❌ 渲染首頁遊戲失敗:", error);
        wrapper.innerHTML = `<p style="color: red;">無法載入遊戲列表，請檢查路徑是否正確。</p>`;
    }
}

// [修改重點] 函數：控制卡片左右滑動
function moveSlide(direction, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`moveSlide 錯誤：找不到 ID 為 "${containerId}" 的容器！`);
        return;
    }
    
    // 每次滑動 3 張卡片的寬度 (您可以調整這個數字)
    const cardWidth = 220; // 假設卡片寬度 + 間距
    const scrollAmount = cardWidth * 3 * direction;
    
    console.log(`正在滑動 #${containerId}，距離: ${scrollAmount}px`);
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// 函數：載入並顯示所有遊戲 (all-games.html)
async function loadAllGames() {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "正在載入...";
    try {
        const response = await fetch("./detail_giftcode/data/games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();
        
        let gamesArray = Object.entries(gamesData);
        gamesArray.sort(() => Math.random() - 0.5);

        gamesContainer.innerHTML = "";

        gamesArray.forEach(([gameName, gameInfo]) => {
            gamesContainer.appendChild(createGameCard(gameName, gameInfo));
        });
        
        setupSearchFunctionality();

    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
        gamesContainer.innerHTML = `<p style="color: red;">無法載入所有遊戲列表。</p>`;
    }
}

// 函數：載入新上遊戲 (new-games.html)
async function loadNewGamesContent() {
    const container = document.getElementById("new-games-container");
    if (!container) return;
    container.innerHTML = "正在載入...";
    try {
        const response = await fetch("./detail_giftcode/data/games.json");
        if (!response.ok) throw new Error("無法載入遊戲資料");
        const data = await response.json();
        const gameEntries = Object.entries(data);
        const latestGames = gameEntries.slice(-15).reverse();
        container.innerHTML = "";
        latestGames.forEach(([name, info]) => {
            const fileName = createSafeFileName(name);
            const gameCard = document.createElement("a");
            gameCard.className = "new-game-item";
            gameCard.href = `detail_giftcode/dist/gamedetail/${encodeURIComponent(fileName)}`;
            gameCard.innerHTML = `<div class="card new-game-card"><img src="/${info.logo}" alt="${name}" onerror="this.onerror=null;this.src='/images/default.jpg';"><div class="game-title">${name}</div></div>`;
            container.appendChild(gameCard);
        });
    } catch (error) {
        console.error("載入新遊戲失敗:", error);
        container.innerHTML = `<p style="color: red;">無法載入最新遊戲列表。</p>`;
    }
}

// 函數：載入禮包碼總覽頁 (giftcodes-list.html)
async function loadGiftcodesOverview() {
    const giftcodeGameList = document.getElementById('giftcode-game-list');
    if (!giftcodeGameList) return;
    giftcodeGameList.innerHTML = "正在載入...";

    const randomSubtitles = [
        "豐富虛寶禮包等你領", "最新兌換碼集中", "每日更新禮包碼",
        "限定序號大放送", "馬上兌換拿好禮", "禮包碼攻略大全", "首抽大放送禮包碼",
        "官方認證T0最強兌換碼", "最多禮包碼序號兌換", "新手開局必備禮包碼兌換",
        "首抽T0最強組隊抽卡序號", "免費最強組隊禮包碼"
    ];
    
    function getRandomSubtitle() {
        const randomIndex = Math.floor(Math.random() * randomSubtitles.length);
        return randomSubtitles[randomIndex];
    }

    try {
        const response = await fetch("./detail_giftcode/data/gift-codes-data.json");
        if (!response.ok) throw new Error("載入禮包碼資料失敗");
        const allGamesData = await response.json();
        const sortedGamesEntries = Object.entries(allGamesData).reverse();
        
        giftcodeGameList.innerHTML = '';
        
        sortedGamesEntries.forEach(([gameName, gameInfo]) => {
            const fileName = createSafeFileName(gameName);
            const listItem = document.createElement('li');
            listItem.className = "game-card-li"; 
            listItem.innerHTML = `
                <a href="/detail_giftcode/dist/giftcodes/${encodeURIComponent(fileName)}" class="giftcode-item-card">
                    <img src="/${gameInfo.banner}" alt="${gameName} Banner" class="game-banner-img" onerror="this.onerror=null;this.src='/giftcodesbanner/default.jpg';">
                    <div class="game-info">
                        <div class="game-name-title">${gameName}</div>
                        <div class="giftcode-subtitle">${new Date().getFullYear()} ${getRandomSubtitle()}</div>
                    </div>
                </a>
            `;
            giftcodeGameList.appendChild(listItem);
        });
        
        setupSearchFunctionality();

    } catch (error) {
        console.error("載入禮包碼總覽失敗:", error);
        giftcodeGameList.innerHTML = `<p style="color: red;">載入遊戲列表失敗，請稍後再試。</p>`;
    }
}

// 函數：過濾遊戲 (通用)
function filterGames() {
    const searchBox = document.getElementById("searchBox");
    if (!searchBox) return;
    const searchQuery = searchBox.value.toLowerCase();
    
    const items = document.querySelectorAll(".game-card, .game-card-li");
    
    items.forEach(item => {
        const titleElement = item.querySelector(".game-title") || item.querySelector(".game-name-title");
        if (titleElement) {
            const gameName = titleElement.textContent.toLowerCase();
            item.style.display = gameName.includes(searchQuery) ? "" : "none";
        }
    });
}

// 函數：在禮包碼詳情頁載入推薦遊戲
async function loadRecommendations() {
    const container = document.getElementById("new-games-container");
    if (!container) return; 

    try {
        const response = await fetch("/detail_giftcode/data/games.json");
        if (!response.ok) throw new Error("無法載入遊戲資料");
        const data = await response.json();
        const gameEntries = Object.entries(data);
        const latest10Games = gameEntries.slice(-10).reverse();
        
        container.innerHTML = "";

        latest10Games.forEach(([name, info]) => {
            container.appendChild(createGameCard(name, info));
        });
    } catch (error) {
        console.error("載入推薦遊戲失敗:", error);
        container.innerHTML = `<p style="font-size: 14px; color: #888;">無法載入推薦遊戲列表。</p>`;
    }
}

// 函數：處理遊戲詳情頁的互動
function setupGameDetailPageInteraction() {
    const gameTitleElement = document.getElementById('gameTitle');
    const gameName = gameTitleElement ? gameTitleElement.textContent.replace(' 代儲值', '') : '未知遊戲';
    const gameNameInput = document.getElementById("gameName");
    if (gameNameInput) { gameNameInput.value = gameName; }
    const productList = document.getElementById('productList');
    const selectedProductsTextarea = document.getElementById('selectedProducts');
    const totalAmountDisplay = document.getElementById('totalAmount');
    if (productList && selectedProductsTextarea && totalAmountDisplay) {
        productList.addEventListener('click', (event) => {
            const productItem = event.target.closest('.product-item');
            if (productItem) {
                const checkbox = productItem.querySelector('.product-checkbox');
                if (event.target !== checkbox) { checkbox.checked = !checkbox.checked; }
                updateTotal();
            }
        });
        function updateTotal() {
            let total = 0;
            let selectedProducts = [];
            document.querySelectorAll("#productList .product-checkbox:checked").forEach(checkbox => {
                const productItem = checkbox.closest('.product-item');
                const priceString = productItem.dataset.price;
                const price = isNaN(parseInt(priceString, 10)) ? 0 : parseInt(priceString, 10);
                const name = productItem.dataset.name;
                total += price;
                selectedProducts.push(name);
            });
            selectedProductsTextarea.value = selectedProducts.length > 0 ? selectedProducts.join(" + ") : "購買商品";
            totalAmountDisplay.innerHTML = `<strong>結帳總金額: NT$${total}</strong>`;
        }
    }
}

// 函數：處理禮包碼詳情頁的互動
function setupGiftCodeDetailPageInteraction() {
    // 執行複製禮包碼按鈕的功能
    document.querySelectorAll('.copy-button').forEach(button => {
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

    // 執行載入推薦遊戲的函數
    loadRecommendations();
}

// 全局購買彈幕功能 - 外部 JSON 連動 + 全功能可點擊跳轉版
document.addEventListener("DOMContentLoaded", function() {
    // 1. 自動注入 CSS 樣式
    const style = document.createElement('style');
    style.innerHTML = `
        #purchase-danmaku-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none; /* 容器穿透，不影響網頁其他地方點擊 */
            z-index: 99999;
            overflow: hidden;
        }
        .danmaku-notification {
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 10px 22px;
            border-radius: 30px;
            font-size: 0.95rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            border-left: 4px solid #ffb703;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Kanit', sans-serif, "Microsoft JhengHei";
            text-decoration: none; /* 移除超連結底線 */
            
            /* 允許點擊 */
            pointer-events: auto; 
            cursor: pointer;
            
            /* 預設在螢幕右側外面 */
            left: 100%; 
            will-change: left;
            /* 12秒橫穿螢幕 */
            animation: danmakuMove 12s linear forwards;
        }
        
        /* 貼心優化：滑鼠移上去時暫停移動，並加上微發光效果 */
        .danmaku-notification:hover {
            animation-play-state: paused;
            box-shadow: 0 4px 20px rgba(255, 183, 3, 0.4);
            background: rgba(15, 15, 15, 0.95);
        }
        
        .danmaku-notification .highlight-name { color: #ffb703; font-weight: bold; }
        .danmaku-notification .highlight-ip { color: #bbb; font-size: 0.8rem; }
        .danmaku-notification .highlight-pack { color: #00f0ff; font-weight: bold; }

        @keyframes danmakuMove {
            0% { left: 100%; }
            100% { left: -750px; }
        }
    `;
    document.head.appendChild(style);

    // 2. 自動在 body 建立彈幕容器
    const container = document.createElement('div');
    container.id = 'purchase-danmaku-container';
    document.body.appendChild(container);

    // 3. 基礎資料池
    const lastNames = ["王", "陳", "張", "劉", "李", "吳", "黃", "蔡", "楊", "許", "鄭", "謝", "洪", "蘇", "林", "郭", "馬", "曾", "周", "賴", "高", "羅", "何", "蕭", "詹", "沈", "彭", "胡", "徐", "朱"];
    const firstNames = ["阿明", "小豪", "君", "翔", "宇", "婷", "涵", "傑", "銘", "安", "凱", "琪", "威", "軒", "萱", "霖", "蓉", "哲", "妤", "冠", "晨", "昕", "瑞", "茜", "倫", "雅", "晴", "毅", "茹", "涵", "皓", "婷", "晉", "宏", "琪"];
    
    const cityIps = [
        "114.39.*.* (高雄)", "218.164.*.* (台南)", "125.228.*.* (台北)", "42.77.*.* (中華電信)", 
        "223.139.*.* (遠傳電信)", "111.255.*.* (台南)", "36.236.*.* (嘉義)", "118.171.*.* (屏東)", 
        "61.227.*.* (高雄)", "1.173.*.* (台南)", "114.45.*.* (新北)", "220.136.*.* (台北)", 
        "114.46.*.* (台中)", "125.230.*.* (台中)", "36.234.*.* (彰化)", "111.242.*.* (嘉義)",
        "49.216.*.* (台灣大哥大)", "101.12.*.* (台灣大哥大)", "27.52.*.* (遠傳電信)", "39.9.*.* (遠傳電信)"
    ];
    
    const timeRanges = ["剛剛", "1分鐘前", "2分鐘前", "3分鐘前", "5秒鐘前", "30秒前", "15秒前", "45秒前"];
    const pricePool = [150, 300, 330, 490, 990, 1490, 1690, 2990, 3290];

    // 4. 非同步讀取 games.json
    let gameList = ["熱門手遊"];

    fetch('/detail_giftcode/data/games.json')
        .then(response => {
            if (!response.ok) throw new Error('無法讀取 games.json');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                gameList = data;
            } else if (typeof data === 'object' && data !== null) {
                gameList = Object.keys(data);
            }
            startDanmakuLoop();
        })
        .catch(err => {
            console.warn("彈幕系統路徑偵測失敗，改用內建預設遊戲名:", err);
            const h1Text = document.querySelector('h1')?.innerText;
            if (h1Text && !h1Text.includes("{{")) {
                gameList = [h1Text.split(" ")[0]];
            } else {
                gameList = ["熱門精選手遊", "最新熱門手遊", "暢銷榜手遊"];
            }
            startDanmakuLoop();
        });

    function generateProductText() {
        const p1 = pricePool[Math.floor(Math.random() * pricePool.length)];
        const p2 = pricePool[Math.floor(Math.random() * pricePool.length)];
        if (Math.random() > 0.5) {
            return `${p1}元禮包`;
        } else {
            return `${p1}元禮包 + ${p2}元禮包`;
        }
    }

    // 5. 建立可點擊的彈幕 A 標籤
    function createDanmaku() {
        const randLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randIp = cityIps[Math.floor(Math.random() * cityIps.length)];
        const randTime = timeRanges[Math.floor(Math.random() * timeRanges.length)];
        const randGame = gameList[Math.floor(Math.random() * gameList.length)];
        const randProduct = generateProductText();
        const maskedName = randLastName + "X" + randFirstName.substring(randFirstName.length - 1);

        // 將 div 改為 <a> 標籤，並加入指定連結與另開新分頁屬性
        const danmaku = document.createElement("a");
        danmaku.className = "danmaku-notification";
        danmaku.href = "https://ssbuy.link/CziRP";
        danmaku.target = "_blank";
        danmaku.rel = "noopener noreferrer";
        
        danmaku.innerHTML = `
            ⚡ <span class="highlight-name">${maskedName}</span> 
            <span class="highlight-ip">(${randIp})</span> 
            <span>${randTime}完成消費</span> 
            <span class="highlight-pack">「${randGame} · ${randProduct}」</span>
        `;

        const randomTop = Math.floor(Math.random() * 70) + 15;
        danmaku.style.top = randomTop + "%";

        container.appendChild(danmaku);

        // 動畫結束自動銷毀
        danmaku.addEventListener('animationend', function() {
            danmaku.remove();
        });
    }

    // 6. 隨機時間循環啟動器
    function startDanmakuLoop() {
        setTimeout(createDanmaku, 3000);

        function loop() {
            // 在 5 秒到 80 秒之間隨機亂跳
            const randomDelay = Math.floor(Math.random() * 75000) + 5000; 
            setTimeout(() => {
                createDanmaku();
                loop(); 
            }, randomDelay);
        }
        setTimeout(loop, 3000);
    }
});