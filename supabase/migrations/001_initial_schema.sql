create extension if not exists "pgcrypto";

create table if not exists public.terms (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  summary text not null,
  content text not null,
  examples jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  content text not null,
  takeaways jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  type text not null check (type in ('preflop', 'concept', 'exploit')),
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  prompt text not null,
  options jsonb not null,
  answer text not null,
  explanation text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.terms enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;

create policy "Terms are readable by everyone"
  on public.terms for select
  using (true);

create policy "Lessons are readable by everyone"
  on public.lessons for select
  using (true);

create policy "Questions are readable by everyone"
  on public.questions for select
  using (true);

create policy "Users can read own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create index if not exists attempts_user_created_idx on public.attempts (user_id, created_at desc);
create index if not exists questions_category_idx on public.questions (category);
