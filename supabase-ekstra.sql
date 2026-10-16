-- =====================================================================
--  SINAV BULUTU — EKSTRALAR: bildirimler + profil fotoğrafı (6. adım)
--  ÖNCE hesap, forum ve duzen dosyaları çalıştırılmış olmalı.
--  Bu dosyanın TAMAMINI kopyala, Supabase > SQL Editor'e yapıştır, Run'a bas.
--  Sadece BİR KERE çalıştırılır.
-- =====================================================================

-- 1) BİLDİRİMLER: konuna cevap gelince, cevabın en iyi seçilince, yazın beğenilince
create table public.bildirimler (
  id bigint generated always as identity primary key,
  alici uuid not null references public.profiller(id) on delete cascade,
  tur text not null check (tur in ('cevap', 'en_iyi', 'begeni')),
  konu_id bigint references public.konular(id) on delete cascade,
  kimden text,
  baslik text,
  okundu boolean not null default false,
  olusturma timestamptz not null default now()
);

create index bildirimler_alici on public.bildirimler (alici, olusturma desc);

alter table public.bildirimler enable row level security;
create policy "kendi bildirimlerini gorur" on public.bildirimler for select to authenticated
  using (alici = auth.uid());
create policy "kendi bildirimini okundu yapar" on public.bildirimler for update to authenticated
  using (alici = auth.uid());
create policy "kendi bildirimini siler" on public.bildirimler for delete to authenticated
  using (alici = auth.uid());
grant select, delete on public.bildirimler to authenticated;
grant update (okundu) on public.bildirimler to authenticated;

-- Cevap yazılınca konu sahibine haber ver (kendi konusuna yazdıysa verme)
create function public.bildir_cevap()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare k record;
begin
  select id, kullanici_id, baslik into k from public.konular where id = new.konu_id;
  if k.kullanici_id <> new.kullanici_id then
    insert into public.bildirimler (alici, tur, konu_id, kimden, baslik)
    values (k.kullanici_id, 'cevap', k.id, new.kullanici_adi, k.baslik);
  end if;
  return null;
end;
$$;
-- Yeni bildirim sayfa yenilenmeden gelsin
alter publication supabase_realtime add table public.bildirimler;

create trigger bildir_cevap after insert on public.cevaplar
  for each row execute function public.bildir_cevap();

-- En iyi cevap seçilince cevabı yazana haber ver
create function public.bildir_en_iyi()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare yazan uuid;
begin
  if new.en_iyi_cevap is not null and new.en_iyi_cevap is distinct from old.en_iyi_cevap then
    select kullanici_id into yazan from public.cevaplar where id = new.en_iyi_cevap;
    if yazan is not null and yazan <> new.kullanici_id then
      insert into public.bildirimler (alici, tur, konu_id, kimden, baslik)
      values (yazan, 'en_iyi', new.id, new.kullanici_adi, new.baslik);
    end if;
  end if;
  return null;
end;
$$;
create trigger bildir_en_iyi after update of en_iyi_cevap on public.konular
  for each row execute function public.bildir_en_iyi();

-- Yazı beğenilince sahibine haber ver
create function public.bildir_begeni()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare yazan uuid; konu bigint; konu_baslik text; begenen text;
begin
  if new.tur = 'konu' then
    select kullanici_id, id, baslik into yazan, konu, konu_baslik from public.konular where id = new.hedef_id;
  else
    select c.kullanici_id, k.id, k.baslik into yazan, konu, konu_baslik
      from public.cevaplar c join public.konular k on k.id = c.konu_id where c.id = new.hedef_id;
  end if;
  if yazan is not null and yazan <> new.kullanici_id then
    select kullanici_adi into begenen from public.profiller where id = new.kullanici_id;
    insert into public.bildirimler (alici, tur, konu_id, kimden, baslik)
    values (yazan, 'begeni', konu, begenen, konu_baslik);
  end if;
  return null;
end;
$$;
create trigger bildir_begeni after insert on public.begeniler
  for each row execute function public.bildir_begeni();

-- 2) PROFİL FOTOĞRAFI
alter table public.profiller add column foto text;  -- fotoğrafın adresi
grant update (foto) on public.profiller to authenticated;

-- Fotoğraflar "avatarlar" klasöründe, herkes görebilir; herkes sadece kendi klasörüne yükler
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatarlar', 'avatarlar', true, 524288, array['image/webp', 'image/jpeg', 'image/png']);

create policy "avatar yukle" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatarlar' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar degistir" on storage.objects for update to authenticated
  using (bucket_id = 'avatarlar' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar sil" on storage.objects for delete to authenticated
  using (bucket_id = 'avatarlar' and (storage.foldername(name))[1] = auth.uid()::text);
