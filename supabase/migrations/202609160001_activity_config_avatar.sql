alter table public.avatars
  add column if not exists gender text not null default 'boy' check(gender in ('boy','girl')),
  add column if not exists hat_style text not null default 'none' check(hat_style in ('none','cap','lab'));

alter table public.activities
  add column if not exists title text not null default 'ภารกิจการแยกสาร',
  add column if not exists config jsonb not null default '{"mode":"PRESET","levelIds":[1,2,3,4,5,6,7,8],"pointsByLevel":{"1":5,"2":5,"3":5,"4":5,"5":5,"6":5,"7":5,"8":5}}'::jsonb;

alter table public.activities
  add constraint activities_title_length check(char_length(title) between 2 and 60),
  add constraint activities_config_object check(jsonb_typeof(config) = 'object');
