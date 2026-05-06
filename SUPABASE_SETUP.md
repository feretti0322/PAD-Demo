# Supabaseセットアップ手順

このサイトは Supabase を使ってユーザー認証・事例集投稿・進捗バッジを管理しています。
初回利用時に以下の手順でセットアップしてください。

---

## 1. Supabaseプロジェクト作成

1. https://supabase.com にアクセスしてアカウント作成
2. 「New Project」でプロジェクト作成
3. データベースパスワードを設定（**安全な場所に保管**）
4. リージョンは「Northeast Asia (Tokyo)」を選択

## 2. マイグレーション実行

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容を貼り付けて実行
3. 「Database → Tables」を開いて `profiles` / `case_studies` / `case_likes` / `case_comments` / `lesson_progress` の5テーブルが作成され、すべて RLS が有効（鍵アイコン）になっていることを確認

## 3. 環境変数設定

1. Supabaseダッシュボードの「Project Settings → API」を開く
2. 以下の値をコピー：
   - **Project URL**
   - **anon public key**（⚠️ **service_role key は絶対に使わない**）
3. `js/env.example.js` をコピーして `js/env.js` を作成し、コピーした値を貼り付け：

   ```javascript
   window.SUPABASE_CONFIG = {
     url: 'https://xxxxx.supabase.co',
     anonKey: 'eyJhbGc...'
   };
   ```

4. `.gitignore` に `js/env.js` が含まれていることを確認（コミット対象から除外）

## 4. 管理者アカウント作成

1. サイトの `signup.html` から自分のメールでサインアップ
2. Supabaseダッシュボードの「Authentication → Users」を開く
3. 該当ユーザーを選択し、**「Raw app meta data」**（※`Raw user meta data` ではない）に以下を設定：

   ```json
   { "role": "admin" }
   ```

4. **重要**：`user_metadata` ではなく `app_metadata` に書き込むこと。前者はユーザー側から自由に書き換え可能なため、権限判定に使うとセキュリティホールになります
5. 一度ログアウトして再ログインすると、新しい JWT に `app_metadata.role = admin` が反映されます

## 5. メール認証設定（任意）

- 開発中は「Authentication → Settings → Email Auth」で **「Confirm email」をOFF** にすると検証が早い
- 本番運用前に必ずONに戻すこと

## 6. 動作確認

1. ローカルでサイトを開く（`index.html`）
2. 新規ユーザー登録 → ログイン → 事例投稿が動くことを確認
3. 管理者アカウントで `admin.html` にアクセスし、進捗バッジ付与が動くことを確認

---

## セキュリティ完了チェックリスト

実装完了後、以下を1つずつ確認してください。

### データベース
- [ ] 全テーブルでRLSが有効化されている（Supabase Dashboard → Database → Tables で確認）
- [ ] 各テーブルに SELECT/INSERT/UPDATE/DELETE のポリシーが個別に定義されている
- [ ] `auth.uid()` は `(select auth.uid())` でラップされている
- [ ] 管理者判定は `is_admin()` 関数経由で行われている
- [ ] `is_admin()` 関数は `SECURITY DEFINER` で `search_path = ''` が設定されている

### 認証
- [ ] 管理者ロールは `app_metadata.role = 'admin'` で管理されている
- [ ] `user_metadata` で権限判定していない
- [ ] パスワードは8文字以上を要求している
- [ ] サインアップ時に `profiles` テーブルへの自動挿入トリガーが動く

### 環境変数
- [ ] `js/env.js` は `.gitignore` に含まれている
- [ ] `js/env.example.js` がリポジトリに存在する
- [ ] `service_role` キーがフロントエンドコードに含まれていない
- [ ] 公開ページのソースコードを確認し、Anon Key 以外のキーが露出していない

### アクセス制御テスト
- [ ] 未ログインで各ページにアクセス → ログイン画面にリダイレクトされる
- [ ] 一般ユーザーで `admin.html` にアクセス → リダイレクトされる
- [ ] 一般ユーザーAが他人Bの投稿を編集しようとする → 失敗する（RLSが効いている）
- [ ] 一般ユーザーが他人の進捗を閲覧しようとする → 失敗する
- [ ] 管理者は全ユーザーの進捗を閲覧・付与・削除できる

### 監査
- [ ] Supabase Dashboard の Security Advisor で警告ゼロを確認
- [ ] 全テーブルのインデックスが設定されている

---

## よくある落とし穴

1. **`user_metadata` と `app_metadata` の混同** — 権限判定は必ず `app_metadata` で
2. **RLS有効化忘れ** — テーブル追加時は必ず `ENABLE ROW LEVEL SECURITY`
3. **`anon` ロール許可** — ポリシーには必ず `TO authenticated` を指定
4. **`auth.uid()` 直書き** — `(select auth.uid())` でラップしてキャッシュを効かせる
5. **`js/env.js` の漏洩** — `.gitignore` 確認・万一漏洩時は Anon Key をローテーション
6. **service_role キーの誤用** — フロントエンドに絶対書かない（RLSをバイパスする全権鍵）

---

## 参照ドキュメント

- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- RLS Performance Best Practices: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- Auth with JavaScript: https://supabase.com/docs/guides/auth/quickstarts/with-js
