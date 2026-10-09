create table if not exists public.blog_article_likes (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null check (article_slug ~ '^[a-z0-9-]{1,100}$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (article_slug, visitor_id)
);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null check (article_slug ~ '^[a-z0-9-]{1,100}$'),
  visitor_id uuid not null,
  author_name text not null check (char_length(author_name) between 2 and 80),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists blog_comments_publication_idx on public.blog_comments (article_slug, status, created_at desc);
create index if not exists blog_comments_rate_limit_idx on public.blog_comments (visitor_id, created_at desc);
alter table public.blog_article_likes enable row level security;
alter table public.blog_comments enable row level security;
revoke all on table public.blog_article_likes, public.blog_comments from anon, authenticated;
grant all on table public.blog_article_likes, public.blog_comments to service_role;