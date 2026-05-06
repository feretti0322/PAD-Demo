-- ============================================================
-- PAD研修サイト Supabaseスキーマ（初回マイグレーション）
-- ============================================================
-- 実行手順：
--   Supabaseダッシュボード → SQL Editor → このファイル全体を貼り付けて実行
-- ============================================================

-- ============================================================
-- 1. profiles テーブル：ユーザープロフィール
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. is_admin() 関数：管理者判定（SECURITY DEFINER）
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- 3. case_studies テーブル：事例投稿
-- ============================================================
CREATE TABLE public.case_studies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  category TEXT NOT NULL CHECK (category IN ('スタッフ管理', '求人媒体運用', '売上集計', 'Excel自動化', 'メール処理', 'その他')),
  level TEXT NOT NULL CHECK (level IN ('初級', '中級', '上級')),
  saved_hours INTEGER NOT NULL CHECK (saved_hours >= 0 AND saved_hours <= 1000),
  summary TEXT NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 2000),
  actions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_studies_user_id ON public.case_studies(user_id);
CREATE INDEX idx_case_studies_category ON public.case_studies(category);
CREATE INDEX idx_case_studies_created_at ON public.case_studies(created_at DESC);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case studies are viewable by authenticated users"
  ON public.case_studies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own case studies"
  ON public.case_studies FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own case studies, admins can update any"
  ON public.case_studies FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()))
  WITH CHECK ((select auth.uid()) = user_id OR (select public.is_admin()));

CREATE POLICY "Users can delete their own case studies, admins can delete any"
  ON public.case_studies FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

-- ============================================================
-- 4. case_likes テーブル：いいね
-- ============================================================
CREATE TABLE public.case_likes (
  id BIGSERIAL PRIMARY KEY,
  case_study_id BIGINT NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_study_id, user_id)
);

CREATE INDEX idx_case_likes_case_study_id ON public.case_likes(case_study_id);
CREATE INDEX idx_case_likes_user_id ON public.case_likes(user_id);

ALTER TABLE public.case_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by authenticated users"
  ON public.case_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.case_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.case_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. case_comments テーブル：コメント
-- ============================================================
CREATE TABLE public.case_comments (
  id BIGSERIAL PRIMARY KEY,
  case_study_id BIGINT NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_comments_case_study_id ON public.case_comments(case_study_id);

ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by authenticated users"
  ON public.case_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own comments"
  ON public.case_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments, admins can delete any"
  ON public.case_comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

-- ============================================================
-- 6. lesson_progress テーブル：受講進捗
-- ============================================================
CREATE TABLE public.lesson_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL CHECK (lesson_number BETWEEN 0 AND 7),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, lesson_number)
);

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress, admins can view all"
  ON public.lesson_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

CREATE POLICY "Users can insert their own progress, admins can insert for anyone"
  ON public.lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id OR (select public.is_admin()));

CREATE POLICY "Users can delete their own progress, admins can delete any"
  ON public.lesson_progress FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

-- ============================================================
-- 7. プロフィール自動作成トリガー（ユーザー登録時）
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
