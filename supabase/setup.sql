-- ============================================================
-- Flow Budget — Supabase Setup
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → Paste → Run)
-- ============================================================

-- 1. TẠO ENUM
-- ============================================================
create type budget_period as enum ('daily', 'weekly', 'monthly');


-- 2. TẠO BẢNG
-- ============================================================

-- 2a. categories
create table categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  icon       text,
  color      text,
  is_preset  boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table categories is 'Danh mục chi tiêu. Preset categories có user_id = NULL.';

-- 2b. expenses
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  amount       bigint not null check (amount > 0),
  description  text,
  note         text,
  expense_date timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table expenses is 'Bảng chi tiêu chính. Amount lưu bằng VND (integer).';

-- 2c. keyword_mappings
create table keyword_mappings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  keyword     text not null,
  category_id uuid not null references categories(id) on delete cascade,
  created_at  timestamptz not null default now(),

  unique (user_id, keyword)
);

comment on table keyword_mappings is 'Mapping từ khóa → danh mục. Mỗi user có bộ keyword riêng.';

-- 2d. budgets
create table budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  amount      bigint not null check (amount > 0),
  period      budget_period not null default 'monthly',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (user_id, category_id, period)
);

comment on table budgets is 'Ngân sách theo danh mục + chu kỳ. category_id = NULL nghĩa là ngân sách tổng.';


-- 3. INDEXES
-- ============================================================
create index idx_expenses_user_date on expenses (user_id, expense_date desc);
create index idx_expenses_user_category on expenses (user_id, category_id);
create index idx_categories_user on categories (user_id);
create index idx_keyword_mappings_user on keyword_mappings (user_id);
create index idx_budgets_user on budgets (user_id);


-- 4. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_expenses_updated_at
  before update on expenses
  for each row execute function update_updated_at();

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function update_updated_at();

create trigger trg_budgets_updated_at
  before update on budgets
  for each row execute function update_updated_at();


-- 5. ENABLE RLS
-- ============================================================
alter table categories      enable row level security;
alter table expenses        enable row level security;
alter table keyword_mappings enable row level security;
alter table budgets         enable row level security;


-- 6. RLS POLICIES
-- ============================================================

-- ---- categories ----
-- Ai cũng đọc được preset categories (user_id IS NULL)
create policy "Ai cũng đọc preset categories"
  on categories for select
  using (is_preset = true and user_id is null);

-- User đọc categories của mình
create policy "User đọc categories của mình"
  on categories for select
  using (auth.uid() = user_id);

-- User tạo categories cho mình
create policy "User tạo categories"
  on categories for insert
  with check (auth.uid() = user_id and is_preset = false);

-- User sửa categories của mình (không sửa preset)
create policy "User sửa categories của mình"
  on categories for update
  using (auth.uid() = user_id and is_preset = false);

-- User xóa categories của mình (không xóa preset)
create policy "User xóa categories của mình"
  on categories for delete
  using (auth.uid() = user_id and is_preset = false);

-- ---- expenses ----
create policy "User đọc expenses của mình"
  on expenses for select
  using (auth.uid() = user_id);

create policy "User tạo expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "User sửa expenses của mình"
  on expenses for update
  using (auth.uid() = user_id);

create policy "User xóa expenses của mình"
  on expenses for delete
  using (auth.uid() = user_id);

-- ---- keyword_mappings ----
create policy "User đọc keyword_mappings của mình"
  on keyword_mappings for select
  using (auth.uid() = user_id);

create policy "User tạo keyword_mappings"
  on keyword_mappings for insert
  with check (auth.uid() = user_id);

create policy "User sửa keyword_mappings của mình"
  on keyword_mappings for update
  using (auth.uid() = user_id);

create policy "User xóa keyword_mappings của mình"
  on keyword_mappings for delete
  using (auth.uid() = user_id);

-- ---- budgets ----
create policy "User đọc budgets của mình"
  on budgets for select
  using (auth.uid() = user_id);

create policy "User tạo budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "User sửa budgets của mình"
  on budgets for update
  using (auth.uid() = user_id);

create policy "User xóa budgets của mình"
  on budgets for delete
  using (auth.uid() = user_id);


-- 7. SEED PRESET CATEGORIES
-- ============================================================
insert into categories (user_id, name, icon, color, is_preset, sort_order) values
  (null, 'Ăn uống',   '🍜', '#FF6B6B', true, 1),
  (null, 'Đồ uống',   '☕', '#4ECDC4', true, 2),
  (null, 'Di chuyển',  '🚗', '#45B7D1', true, 3),
  (null, 'Mua sắm',   '🛒', '#96CEB4', true, 4),
  (null, 'Nhà cửa',   '🏠', '#FFEAA7', true, 5),
  (null, 'Sức khỏe',  '💊', '#DDA0DD', true, 6),
  (null, 'Giải trí',  '🎮', '#98D8C8', true, 7),
  (null, 'Học tập',   '📚', '#F7DC6F', true, 8),
  (null, 'Hóa đơn',   '💡', '#BB8FCE', true, 9),
  (null, 'Khác',      '📦', '#AEB6BF', true, 10);
