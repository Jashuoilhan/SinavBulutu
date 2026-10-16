-- =====================================================================
--  SINAV BULUTU — DÜZEN: moderatör, şikâyet, engelleme, spam sınırı (5. adım)
--  ÖNCE supabase-hesap.sql ve supabase-forum.sql çalıştırılmış olmalı.
--  Bu dosyanın TAMAMINI kopyala, Supabase > SQL Editor'e yapıştır, Run'a bas.
--  Sadece BİR KERE çalıştırılır.
--
--  KENDİNİ YÖNETİCİ YAPMAK İÇİN (bu dosyadan sonra, ayrı olarak çalıştır):
--    update public.profiller set rol = 'yonetici' where kullanici_adi = 'SENIN_ADIN';
-- =====================================================================

-- 1) ROLLER VE ENGEL (üyeler bu alanları kendisi değiştiremez: izin verilmedi)
alter table public.profiller
  add column rol text not null default 'uye' check (rol in ('uye', 'moderator', 'yonetici')),
  add column engel_bitis timestamptz;

create function public.yetkili()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (select 1 from public.profiller
                 where id = auth.uid() and rol in ('moderator', 'yonetici'));
$$;

-- 2) KONU SABİTLEME VE KİLİTLEME
alter table public.konular
  add column sabit boolean not null default false,
  add column kilitli boolean not null default false;

create index konular_sabit on public.konular (sabit desc, son_hareket desc);

-- 3) YAZMADAN ÖNCE KONTROL: engelli mi, çok hızlı mı yazıyor, konu kilitli mi
--    Trigger'a verilen sayı: 1 dakikada en fazla kaç yazı
create function public.yazma_kontrol()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  bitis timestamptz;
  adet int;
begin
  select engel_bitis into bitis from public.profiller where id = auth.uid();
  if bitis is not null and bitis > now() then
    raise exception 'ENGELLI:%', to_char(bitis at time zone 'Europe/Istanbul', 'DD.MM.YYYY HH24:MI');
  end if;

  execute format(
    'select count(*) from public.%I where kullanici_id = $1 and olusturma > now() - interval ''1 minute''',
    tg_table_name) into adet using auth.uid();
  if adet >= tg_argv[0]::int then
    raise exception 'COK_HIZLI';
  end if;

  if tg_table_name = 'cevaplar'
     and exists (select 1 from public.konular where id = new.konu_id and kilitli) then
    raise exception 'KONU_KILITLI';
  end if;
  return new;
end;
$$;

create trigger yazma_kontrol before insert on public.konular
  for each row execute function public.yazma_kontrol('2');
create trigger yazma_kontrol before insert on public.cevaplar
  for each row execute function public.yazma_kontrol('5');
create trigger yazma_kontrol before insert on public.mesajlar
  for each row execute function public.yazma_kontrol('10');

-- 4) MODERATÖRLER HER YAZIYI SİLEBİLİR
create policy "yetkili konu siler"  on public.konular  for delete to authenticated using (public.yetkili());
create policy "yetkili cevap siler" on public.cevaplar for delete to authenticated using (public.yetkili());
create policy "yetkili mesaj siler" on public.mesajlar for delete to authenticated using (public.yetkili());

-- 5) ŞİKÂYETLER
create table public.sikayetler (
  id bigint generated always as identity primary key,
  sikayet_eden uuid not null default auth.uid() references public.profiller(id) on delete cascade,
  tur text not null check (tur in ('konu', 'cevap', 'mesaj', 'profil')),
  hedef_id text not null,
  baglanti text,                       -- moderatörün tıklayıp gideceği sayfa
  ozet text check (char_length(ozet) <= 300),
  sebep text not null check (sebep in ('hakaret', 'spam', 'reklam', 'uygunsuz', 'kopya', 'diger')),
  aciklama text check (char_length(aciklama) <= 500),
  durum text not null default 'acik' check (durum in ('acik', 'kapandi')),
  olusturma timestamptz not null default now(),
  unique (sikayet_eden, tur, hedef_id)  -- aynı şeyi bir kez şikâyet edebilir
);

alter table public.sikayetler enable row level security;

create policy "uyeler sikayet eder" on public.sikayetler for insert to authenticated
  with check (sikayet_eden = auth.uid());
create policy "yetkili sikayetleri gorur" on public.sikayetler for select to authenticated
  using (public.yetkili());
create policy "yetkili sikayet kapatir" on public.sikayetler for update to authenticated
  using (public.yetkili());

grant insert (tur, hedef_id, baglanti, ozet, sebep, aciklama) on public.sikayetler to authenticated;
grant select on public.sikayetler to authenticated;
grant update (durum) on public.sikayetler to authenticated;

-- 6) MODERATÖR İŞLEMLERİ
-- Üyeyi engelle: gun = 0 → engeli kaldır, gun = 36500 → kalıcı
create function public.uye_engelle(hedef uuid, gun int)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.yetkili() then raise exception 'YETKI_YOK'; end if;
  if exists (select 1 from public.profiller where id = hedef and rol in ('moderator', 'yonetici')) then
    raise exception 'Yetkililer engellenemez';
  end if;
  update public.profiller
    set engel_bitis = case when gun > 0 then now() + make_interval(days => gun) end
    where id = hedef;
end;
$$;

-- Konuyu sabitle / kilitle (aynı çağrı tekrar yapılınca geri alır)
create function public.konu_ayarla(konu bigint, alan text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.yetkili() then raise exception 'YETKI_YOK'; end if;
  if alan = 'sabit' then
    update public.konular set sabit = not sabit where id = konu;
  elsif alan = 'kilitli' then
    update public.konular set kilitli = not kilitli where id = konu;
  end if;
end;
$$;

-- Engelli üyeleri listele (sadece yetkililer)
create function public.engelli_uyeler()
returns table (id uuid, kullanici_adi text, engel_bitis timestamptz)
language plpgsql stable
security definer set search_path = ''
as $$
begin
  if not public.yetkili() then raise exception 'YETKI_YOK'; end if;
  return query
    select p.id, p.kullanici_adi, p.engel_bitis from public.profiller p
    where p.engel_bitis > now() order by p.engel_bitis;
end;
$$;

revoke execute on function public.uye_engelle(uuid, int), public.konu_ayarla(bigint, text),
  public.engelli_uyeler() from public, anon;
grant execute on function public.uye_engelle(uuid, int), public.konu_ayarla(bigint, text),
  public.engelli_uyeler(), public.yetkili() to authenticated;
