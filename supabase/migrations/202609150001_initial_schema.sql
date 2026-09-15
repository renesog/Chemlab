create extension if not exists pgcrypto;
create type public.classroom_status as enum ('DRAFT','OPEN','RUNNING','PAUSED','ENDED');
create type public.session_status as enum ('ONLINE','OFFLINE','LEFT','REMOVED');
create type public.layout_type as enum ('ROWS','U_SHAPE','GROUPS','CUSTOM');

create table public.teacher_profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null check(char_length(display_name) between 2 and 80),created_at timestamptz not null default now());
create table public.classrooms(id uuid primary key default gen_random_uuid(),teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,name text not null check(char_length(name) between 2 and 60),subject text not null check(char_length(subject)<=80),room_code_lookup text not null unique,room_code_hash text not null,status public.classroom_status not null default 'DRAFT',expires_at timestamptz not null default(now()+interval '8 hours'),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),ended_at timestamptz);
create index classrooms_teacher_idx on public.classrooms(teacher_id,created_at desc);
create index classrooms_active_code_idx on public.classrooms(room_code_lookup) where status in ('OPEN','RUNNING','PAUSED');
create table public.classroom_layouts(id uuid primary key default gen_random_uuid(),classroom_id uuid not null unique references public.classrooms(id) on delete cascade,layout_type public.layout_type not null,canvas_width int not null default 1000 check(canvas_width between 320 and 3000),canvas_height int not null default 700 check(canvas_height between 320 and 3000),version int not null default 1);
create table public.student_sessions(id uuid primary key default gen_random_uuid(),classroom_id uuid not null references public.classrooms(id) on delete cascade,nickname text not null check(char_length(nickname) between 2 and 24),session_token_hash text not null unique,status public.session_status not null default 'ONLINE',is_hand_raised boolean not null default false,current_level int not null default 1 check(current_level between 1 and 8),total_score int not null default 0 check(total_score between 0 and 40),joined_at timestamptz not null default now(),last_seen_at timestamptz not null default now());
create index student_sessions_classroom_idx on public.student_sessions(classroom_id,status);
create table public.avatars(student_session_id uuid primary key references public.student_sessions(id) on delete cascade,skin_tone text not null check(skin_tone in ('light','medium','deep')),face text not null check(face in ('smile','calm','bright')),hair_style text not null check(hair_style in ('short','wave','spike')),hair_color text not null check(hair_color in ('black','brown','blue')),shirt_style text not null default 'lab',shirt_color text not null check(shirt_color in ('cyan','navy','yellow','coral')));
create table public.desks(id uuid primary key default gen_random_uuid(),classroom_id uuid not null references public.classrooms(id) on delete cascade,label text not null,position_x numeric not null,position_y numeric not null,is_locked boolean not null default false,occupant_session_id uuid unique references public.student_sessions(id) on delete set null,version int not null default 0,unique(classroom_id,label));
create index desks_classroom_idx on public.desks(classroom_id);
create table public.activities(id uuid primary key default gen_random_uuid(),classroom_id uuid not null references public.classrooms(id) on delete cascade,activity_type text not null default 'SEPARATION_LAB',status text not null default 'WAITING' check(status in ('WAITING','RUNNING','PAUSED','ENDED')),started_at timestamptz,ended_at timestamptz);
create table public.game_levels(id int primary key check(id between 1 and 8),slug text not null unique,title_th text not null,mixture_th text not null,objective_th text not null,difficulty int not null check(difficulty between 1 and 5),is_active boolean not null default true);
create table public.game_attempts(id uuid primary key default gen_random_uuid(),activity_id uuid not null references public.activities(id) on delete cascade,student_session_id uuid not null references public.student_sessions(id) on delete cascade,level_id int not null references public.game_levels(id),idempotency_key uuid not null unique,submitted_steps jsonb not null,is_correct boolean not null,deduction int not null check(deduction in (0,1)),created_at timestamptz not null default now());
create table public.level_progress(student_session_id uuid not null references public.student_sessions(id) on delete cascade,activity_id uuid not null references public.activities(id) on delete cascade,level_id int not null references public.game_levels(id),attempt_count int not null default 0 check(attempt_count>=0),score int not null default 5 check(score between 1 and 5),elapsed_seconds int not null default 0 check(elapsed_seconds>=0),completed_at timestamptz,primary key(student_session_id,activity_id,level_id));
create table public.hand_raise_events(id uuid primary key default gen_random_uuid(),classroom_id uuid not null references public.classrooms(id) on delete cascade,student_session_id uuid not null references public.student_sessions(id) on delete cascade,raised boolean not null,created_at timestamptz not null default now());
create index attempts_student_idx on public.game_attempts(student_session_id,level_id,created_at);
create index progress_activity_idx on public.level_progress(activity_id,student_session_id);

alter table public.teacher_profiles enable row level security;alter table public.classrooms enable row level security;alter table public.classroom_layouts enable row level security;alter table public.desks enable row level security;alter table public.student_sessions enable row level security;alter table public.avatars enable row level security;alter table public.activities enable row level security;alter table public.game_levels enable row level security;alter table public.game_attempts enable row level security;alter table public.level_progress enable row level security;alter table public.hand_raise_events enable row level security;
create policy teacher_own_profile on public.teacher_profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy teacher_own_rooms on public.classrooms for all using(teacher_id=auth.uid()) with check(teacher_id=auth.uid());
create policy teacher_own_layouts on public.classroom_layouts for all using(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid())) with check(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy teacher_own_desks on public.desks for all using(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid())) with check(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy teacher_read_students on public.student_sessions for select using(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy teacher_own_activities on public.activities for all using(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid())) with check(exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy public_active_levels on public.game_levels for select using(is_active);
create policy teacher_read_attempts on public.game_attempts for select using(exists(select 1 from public.student_sessions s join public.classrooms c on c.id=s.classroom_id where s.id=student_session_id and c.teacher_id=auth.uid()));
create policy teacher_read_progress on public.level_progress for select using(exists(select 1 from public.student_sessions s join public.classrooms c on c.id=s.classroom_id where s.id=student_session_id and c.teacher_id=auth.uid()));

create or replace function public.select_own_desk(p_session_id uuid,p_token_hash text,p_desk_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare target public.desks; current_desk public.desks;
begin
  if not exists(select 1 from student_sessions where id=p_session_id and session_token_hash=p_token_hash and status in('ONLINE','OFFLINE')) then raise exception 'unauthorized'; end if;
  select * into current_desk from desks where occupant_session_id=p_session_id for update;
  if current_desk.id is not null and current_desk.is_locked then raise exception 'current_desk_locked'; end if;
  select * into target from desks where id=p_desk_id for update;
  if target.id is null or target.classroom_id<>(select classroom_id from student_sessions where id=p_session_id) then raise exception 'invalid_desk'; end if;
  if target.is_locked or target.occupant_session_id is not null then raise exception 'desk_unavailable'; end if;
  update desks set occupant_session_id=null,version=version+1 where occupant_session_id=p_session_id;
  update desks set occupant_session_id=p_session_id,version=version+1 where id=p_desk_id and occupant_session_id is null and not is_locked;
  if not found then raise exception 'desk_race_lost'; end if;
end$$;
revoke all on function public.select_own_desk(uuid,text,uuid) from public,anon,authenticated;
