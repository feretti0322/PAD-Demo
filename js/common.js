// ===================================
// 共通処理
// ===================================

// ログインチェック
function checkLogin() {
  if (!sessionStorage.getItem('loggedIn')) {
    window.location.href = '../index.html';
  }
}

// サイドバー共通HTML生成
function renderSidebar(activePage) {
  const pages = [
    { id: 'dashboard', icon: '📊', label: 'ダッシュボード', href: 'dashboard.html' },
    { id: 'customer', icon: '🏢', label: '得意先一覧', href: 'customer.html' },
    { id: 'sales-input', icon: '✏️', label: '売上入力', href: 'sales-input.html' },
    { id: 'sales-list', icon: '📋', label: '売上一覧', href: 'sales-list.html' },
    { id: 'aggregation', icon: '📈', label: 'データ集計', href: 'aggregation.html' },
    { id: 'campaign', icon: '📣', label: 'キャンペーン管理', href: 'campaign.html' },
  ];

  const navItems = pages.map(p => `
    <a href="${p.href}" class="nav-item ${activePage === p.id ? 'active' : ''}">
      <span class="nav-icon">${p.icon}</span>
      ${p.label}
    </a>
  `).join('');

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">💻</div>
        <h2>PAD練習サイト</h2>
        <div class="brand-sub">Power Automate for Desktop</div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">メニュー</div>
        ${navItems}
      </nav>
      <div class="sidebar-footer">
        ログイン中: <strong>${sessionStorage.getItem('userName') || 'user'}</strong>
        <br>
        <a href="index.html" style="color: rgba(255,255,255,0.5); font-size:11px;" onclick="sessionStorage.clear()">ログアウト</a>
      </div>
    </aside>
  `;
}

// 顧客データ（共通）
const CUSTOMERS = [
  { id: 'C001', name: '株式会社山田商事', industry: '製造業', zip: '100-0001', address: '東京都千代田区千代田1-1-1', tel: '03-1234-5678' },
  { id: 'C002', name: '有限会社鈴木工業', industry: '製造業', zip: '530-0001', address: '大阪府大阪市北区梅田2-2-2', tel: '06-2345-6789' },
  { id: 'C003', name: '株式会社田中食品', industry: '飲食業', zip: '460-0001', address: '愛知県名古屋市中区栄3-3-3', tel: '052-3456-7890' },
  { id: 'C004', name: 'ABC商事株式会社', industry: 'サービス業', zip: '810-0001', address: '福岡県福岡市中央区天神4-4-4', tel: '092-4567-8901' },
  { id: 'C005', name: '株式会社佐藤建設', industry: 'その他', zip: '060-0001', address: '北海道札幌市中央区大通西5-5-5', tel: '011-5678-9012' },
  { id: 'C006', name: '東京物産株式会社', industry: '製造業', zip: '108-0075', address: '東京都港区港南6-6-6', tel: '03-6789-0123' },
  { id: 'C007', name: '大阪サービス株式会社', industry: 'サービス業', zip: '541-0041', address: '大阪府大阪市中央区北浜7-7-7', tel: '06-7890-1234' },
  { id: 'C008', name: '名古屋食品株式会社', industry: '飲食業', zip: '450-0002', address: '愛知県名古屋市中村区名駅8-8-8', tel: '052-8901-2345' },
  { id: 'C009', name: '株式会社北海道産業', industry: '製造業', zip: '064-0915', address: '北海道札幌市中央区南15条西9-9-9', tel: '011-9012-3456' },
  { id: 'C010', name: '九州商事株式会社', industry: 'サービス業', zip: '860-0001', address: '熊本県熊本市中央区手取本町10-10-10', tel: '096-0123-4567' },
];

// 売上データ（共通）
const SALES_DATA = [
  { id: 'S001', date: '2025/04/01', customerId: 'C001', customerName: '株式会社山田商事', amount: 850000, note: '定期発注' },
  { id: 'S002', date: '2025/04/02', customerId: 'C002', customerName: '有限会社鈴木工業', amount: 320000, note: '' },
  { id: 'S003', date: '2025/04/03', customerId: 'C003', customerName: '株式会社田中食品', amount: 1200000, note: '特別注文' },
  { id: 'S004', date: '2025/04/04', customerId: 'C004', customerName: 'ABC商事株式会社', amount: 450000, note: '' },
  { id: 'S005', date: '2025/04/05', customerId: 'C005', customerName: '株式会社佐藤建設', amount: 780000, note: '大型案件' },
  { id: 'S006', date: '2025/04/07', customerId: 'C006', customerName: '東京物産株式会社', amount: 230000, note: '' },
  { id: 'S007', date: '2025/04/08', customerId: 'C007', customerName: '大阪サービス株式会社', amount: 560000, note: '定期発注' },
  { id: 'S008', date: '2025/04/09', customerId: 'C008', customerName: '名古屋食品株式会社', amount: 980000, note: '' },
  { id: 'S009', date: '2025/04/10', customerId: 'C009', customerName: '株式会社北海道産業', amount: 410000, note: '' },
  { id: 'S010', date: '2025/04/11', customerId: 'C010', customerName: '九州商事株式会社', amount: 670000, note: '新規取引' },
  { id: 'S011', date: '2025/04/12', customerId: 'C001', customerName: '株式会社山田商事', amount: 1050000, note: '' },
  { id: 'S012', date: '2025/04/14', customerId: 'C002', customerName: '有限会社鈴木工業', amount: 290000, note: '' },
  { id: 'S013', date: '2025/04/15', customerId: 'C003', customerName: '株式会社田中食品', amount: 740000, note: '定期発注' },
  { id: 'S014', date: '2025/04/16', customerId: 'C004', customerName: 'ABC商事株式会社', amount: 520000, note: '' },
  { id: 'S015', date: '2025/04/17', customerId: 'C005', customerName: '株式会社佐藤建設', amount: 1380000, note: '大型案件' },
  { id: 'S016', date: '2025/04/18', customerId: 'C006', customerName: '東京物産株式会社', amount: 350000, note: '' },
  { id: 'S017', date: '2025/04/19', customerId: 'C007', customerName: '大阪サービス株式会社', amount: 620000, note: '' },
  { id: 'S018', date: '2025/04/21', customerId: 'C008', customerName: '名古屋食品株式会社', amount: 840000, note: '定期発注' },
  { id: 'S019', date: '2025/04/22', customerId: 'C009', customerName: '株式会社北海道産業', amount: 470000, note: '' },
  { id: 'S020', date: '2025/04/23', customerId: 'C010', customerName: '九州商事株式会社', amount: 930000, note: '' },
  { id: 'S021', date: '2025/04/24', customerId: 'C001', customerName: '株式会社山田商事', amount: 760000, note: '' },
  { id: 'S022', date: '2025/04/25', customerId: 'C002', customerName: '有限会社鈴木工業', amount: 380000, note: '特別注文' },
  { id: 'S023', date: '2025/04/26', customerId: 'C003', customerName: '株式会社田中食品', amount: 1100000, note: '' },
  { id: 'S024', date: '2025/04/28', customerId: 'C004', customerName: 'ABC商事株式会社', amount: 440000, note: '' },
  { id: 'S025', date: '2025/04/28', customerId: 'C005', customerName: '株式会社佐藤建設', amount: 590000, note: '' },
  { id: 'S026', date: '2025/04/29', customerId: 'C006', customerName: '東京物産株式会社', amount: 270000, note: '定期発注' },
  { id: 'S027', date: '2025/04/29', customerId: 'C007', customerName: '大阪サービス株式会社', amount: 810000, note: '' },
  { id: 'S028', date: '2025/04/30', customerId: 'C008', customerName: '名古屋食品株式会社', amount: 650000, note: '' },
  { id: 'S029', date: '2025/04/30', customerId: 'C009', customerName: '株式会社北海道産業', amount: 490000, note: '新規取引' },
  { id: 'S030', date: '2025/04/30', customerId: 'C010', customerName: '九州商事株式会社', amount: 1200000, note: '大型案件' },
];

// 金額フォーマット
function formatMoney(n) {
  return '¥' + n.toLocaleString('ja-JP');
}

// 日付フォーマット
function formatDate(d) {
  return d;
}
