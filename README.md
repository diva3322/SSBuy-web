# SSbuy 手遊代儲網站

這是一個手遊代儲服務的展示型網站，使用者可以瀏覽遊戲、選擇商品、查看儲值教學與聯絡方式。

## 🔧 技術架構

- HTML + CSS + JavaScript
- 不含會員系統與付款功能（純展示用）
- 無框架、無後端，純前端架設

## 📁 網頁結構

- `index.html`：首頁，顯示遊戲卡片（含橫向滑動與手機版無限滑動）
- `game-detail.html`：遊戲詳情頁（含商品選擇、儲值須知）
- `new-games.html`：新上遊戲頁面
- `all-games.html`：所有遊戲 + 搜尋功能
- `event.html`：特惠活動頁面
- `purchase-guide.html`：購買教學
- `contact.html`：聯絡我們
- `terms-of-service.html`：服務條款
- `disclaimer.html`：免責條款
- `account-verification.html`：帳戶認證方式

## 📦 檔案說明

- `style.css`：主樣式表，含 RWD 手機版、桌機版設定
- `script.js`：主要 JS 功能，如遊戲卡片渲染、無限滑動、資料載入等
- `games.json`：遊戲資料來源（logo、商品、描述、連結等）

## 📱 手機版特色

- 自動切換為直向遊戲滑動容器
- 隱藏 sidebar，改用漢堡選單
- 遊戲登入資訊在手機版不顯示
- 商品區塊內有送出結帳按鈕

## ✅ 目前狀態

- ✅ 首頁滑動已完成
- ✅ 手機版無限滑動 OK
- ✅ 商品動態載入 OK
- ✅ 各頁 transition OK

## 📌 未來規劃

- [ ] 加入 SEO 優化標籤
- [ ] 整合第三方付款
- [ ] 使用者留言板/客服表單

---

## 👤 作者資訊

- 作者: 0xJoestar  
- Telegram: [@diva3322](https://t.me/diva3322)