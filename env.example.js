// ============================================================
// Supabase 環境変数テンプレート
// ============================================================
// 使い方：
//   1. このファイルをコピーして「js/env.js」を作成
//   2. Supabase ダッシュボード「Project Settings → API」から値をコピーして貼り付け
//   3. js/env.js は .gitignore に含まれているため Git にはコミットされません
//
// ⚠️ 重要：
//   - 必ず「anon public key」を使うこと
//   - 「service_role key」は絶対にここに書かない（RLSをバイパスする全権鍵）
// ============================================================

window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_KEY_HERE'
};
