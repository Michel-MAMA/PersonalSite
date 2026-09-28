create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organisation text,
  audience text not null,
  request_type text not null,
  message text not null,
  attachment_path text,
  attachment_name text,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;
revoke all on table public.contact_requests from anon, authenticated;
grant all on table public.contact_requests to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contact-attachments',
  'contact-attachments',
  false,
  8388608,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
