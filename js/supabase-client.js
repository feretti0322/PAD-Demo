// ============================================================
// Supabase クライアント初期化
// ============================================================
// 前提：HTML側で以下を読み込んでおくこと
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/env.js"></script>
//   <script src="js/supabase-client.js"></script>
// ============================================================

(function () {
  if (!window.SUPABASE_CONFIG) {
    console.error('SUPABASE_CONFIG が読み込まれていません。js/env.js を確認してください。');
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('@supabase/supabase-js が読み込まれていません。CDNスクリプトを確認してください。');
    return;
  }
  const { createClient } = window.supabase;
  window.supabaseClient = createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
