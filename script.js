// ====== 輔助函數 (Helper Functions) ======

// ====== 輔助函數 (Helper Functions) ======
function createSafeFileName(gameName) {
    if (!gameName) return '';
    // [修改重點] 只移除對作業系統不安全的極少數字元
    let safeName = gameName.replace(/[\\/?*"<>|]/g, '');
    if (/^\d/.test(safeName)) {
        safeName = 'game-' + safeName;
    }
    return safeName + '.html';
}


// ====== 主要邏輯 (在頁面載入後執行) ======

document.addEventListener("DOMContentLoaded", () => {
    // --- 通用功能 ---
    // 手機漢堡選單
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");
    if (mobileMenuToggle && mobileDropdownMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileDropdownMenu.classList.toggle("open");
        });
    }

    // --- 頁面專屬邏輯 ---
    const bodyClassList = document.body.classList;

    if (bodyClassList.contains("index-page")) {
        renderIndexGames();
    }
    else if (bodyClassList.contains("all-games-page")) {
        loadAllGames();
    }
    else if (bodyClassList.contains("new-games-page")) {
        loadNewGamesContent();
    }
    else if (bodyClassList.contains("giftcodes-list-page")) {
        loadGiftcodesOverview();
    }
    else if (bodyClassList.contains("game-detail")) {
        setupGameDetailPageInteraction();
    }
    else if (bodyClassList.contains("giftcodes-detail-page")) {
        setupGiftCodeDetailPageInteraction();
    }
});


// ====== 函數定義 ======

// 函數：渲染首頁的輪播遊戲卡片
async function renderIndexGames() {
    const wrapper = document.getElementById('gamesWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = "正在載入遊戲...";

    try {
        // [路徑已修正]
        const response = await fetch("./detail_giftcode/data/games.json");
        if (!response.ok) throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        const gamesData = await response.json();
        wrapper.innerHTML = "";

        const gameEntries = Object.entries(gamesData);
        const shuffledGames = gameEntries.sort(() => 0.5 - Math.random());
        
        while (shuffledGames.length > 0 && shuffledGames.length < 26) {
            shuffledGames.push(...shuffledGames);
        }

        const gameChunks = [
            shuffledGames.slice(0, 13),
            shuffledGames.slice(13, 26)
        ];

        gameChunks.forEach((chunk, i) => {
            const slider = document.createElement('div');
            slider.className = 'game-slider-container';
            const container = document.createElement('div');
            container.className = 'game-slider';
            
            chunk.forEach(([gameName, gameInfo]) => {
                const fileName = createSafeFileName(gameName);
                const card = document.createElement('a');
                card.className = 'card game-card';
                card.href = `detail_giftcode/dist/gamedetail/${fileName}`;
                card.innerHTML = `
                    <img src="${gameInfo.logo}" alt="${gameName}" onerror="this.onerror=null;this.src='images/default.jpg';">
                    <div class="game-title">${gameName}</div>
                `;
                container.appendChild(card);
            });
            slider.appendChild(container);
            wrapper.appendChild(slider);
        });

    } catch (error) {
        console.error("❌ 渲染首頁遊戲失敗:", error);
        wrapper.innerHTML = `<p style="color: red;">無法載入遊戲列表，請檢查路徑是否正確。</p>`;
    }
}

// 函數：載入並顯示所有遊戲 (all-games.html)
async function loadAllGames() {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "正在載入...";

    try {
        // [路徑已修正]
        const response = await fetch("./detail_giftcode/data/games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();
        gamesContainer.innerHTML = "";

        for (const gameName in gamesData) {
            const gameInfo = gamesData[gameName];
            const fileName = createSafeFileName(gameName);
            const gameCard = document.createElement("a");
            gameCard.className = "card game-card";
            gameCard.href = `detail_giftcode/dist/gamedetail/${fileName}`;
            gameCard.innerHTML = `
                <img src="${gameInfo.logo}" alt="${gameName}" onerror="this.onerror=null;this.src='images/default.jpg';">
                <div class="game-title">${gameName}</div>
            `;
            gamesContainer.appendChild(gameCard);
        }
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
        // [路徑已修正]
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
            gameCard.href = `detail_giftcode/dist/gamedetail/${fileName}`;
            gameCard.innerHTML = `
                <div class="card new-game-card">
                    <img src="${info.logo}" alt="${name}" onerror="this.onerror=null;this.src='images/default.jpg';">
                    <div class="game-title">${name}</div>
                </div>
            `;
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

    try {
        // [路徑已修正]
        const response = await fetch("./detail_giftcode/data/gift-codes-data.json");
        if (!response.ok) throw new Error("載入禮包碼資料失敗");
        const allGamesData = await response.json();
        const sortedGamesEntries = Object.entries(allGamesData).reverse();
        giftcodeGameList.innerHTML = '';

        sortedGamesEntries.forEach(([gameName, gameInfo]) => {
            const fileName = createSafeFileName(gameName);
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="detail_giftcode/dist/giftcodes/${fileName}" class="giftcode-item-card">
                    <img src="${gameInfo.banner}" alt="${gameName} Banner" class="game-banner-img" onerror="this.onerror=null;this.src='giftcodesbanner/default.jpg';">
                    <div class="game-info">
                        <div class="game-name-title">${gameName}</div>
                        <div class="giftcode-subtitle">${new Date().getFullYear()}最新兌換碼</div>
                    </div>
                </a>
            `;
            giftcodeGameList.appendChild(listItem);
        });
    } catch (error) {
        console.error("載入禮包碼總覽失敗:", error);
        giftcodeGameList.innerHTML = `<p style="color: red;">載入遊戲列表失敗，請稍後再試。</p>`;
    }
}

// 函數：過濾遊戲 (通用)
function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const cards = document.querySelectorAll(".game-card, .giftcode-item-card");
    cards.forEach(card => {
        const titleElement = card.querySelector(".game-title") || card.querySelector(".game-name-title");
        if (titleElement) {
            const gameName = titleElement.textContent.toLowerCase();
            const elementToShowHide = card.closest('li') || card;
            elementToShowHide.style.display = gameName.includes(searchQuery) ? "" : "none";
        }
    });
}

// 函數：處理遊戲詳情頁的互動
function setupGameDetailPageInteraction() {
    const gameTitleElement = document.getElementById('gameTitle');
    const gameName = gameTitleElement ? gameTitleElement.textContent.replace(' 代儲值', '') : '未知遊戲';
    const gameNameInput = document.getElementById("gameName");
    if (gameNameInput) {
        gameNameInput.value = gameName;
    }
    const productList = document.getElementById('productList');
    const selectedProductsTextarea = document.getElementById('selectedProducts');
    const totalAmountDisplay = document.getElementById('totalAmount');
    if (productList && selectedProductsTextarea && totalAmountDisplay) {
        productList.addEventListener('click', (event) => {
            const productItem = event.target.closest('.product-item');
            if (productItem) {
                const checkbox = productItem.querySelector('.product-checkbox');
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                updateTotal();
            }
        });
        function updateTotal() {
            let total = 0;
            let selectedProducts = [];
            document.querySelectorAll("#productList .product-checkbox:checked").forEach(checkbox => {
                const productItem = checkbox.closest('.product-item');
                const price = parseInt(productItem.dataset.price, 10);
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
}