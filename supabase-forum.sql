-- =====================================================================
--  SINAV BULUTU — FORUM (4. adım)
--  ÖNCE supabase-hesap.sql çalıştırılmış olmalı.
--  Bu dosyanın TAMAMINI kopyala, Supabase > SQL Editor'e yapıştır, Run'a bas.
--  Sadece BİR KERE çalıştırılır.
-- =====================================================================

-- 1) KATEGORİLER (yenisini eklemek için sadece bu tabloya satır eklemek yeter)
create table public.kategoriler (
  id text primary key check (id ~ '^[a-z0-9_]{2,20}$'),
  ad text not null,
  emoji text not null default '💬',
  aciklama text,
  sira int not null default 0
);

insert into public.kategoriler (id, ad, emoji, aciklama, sira) values
  ('genel',  'Genel',            '🌤️', 'Her şey hakkında sohbet', 1),
  ('yks',    'YKS',              '🎓', 'TYT, AYT, YDT',            2),
  ('kpss',   'KPSS',             '🏛️', 'Lisans, önlisans, ortaöğretim', 3),
  ('ales',   'ALES',             '📚', 'Sayısal, sözel, eşit ağırlık', 4),
  ('lgs',    'LGS',              '🏫', 'Liselere geçiş',           5),
  ('taktik', 'Çalışma taktikleri','🧠', 'Program, motivasyon, kaynak önerisi', 6);

-- 2) KONULAR
create table public.konular (
  id bigint generated always as identity primary key,
  kategori text not null references public.kategoriler(id),
  kullanici_id uuid not null references public.profiller(id) on delete cascade,
  kullanici_adi text not null,
  baslik text not null check (char_length(baslik) between 5 and 120),
  icerik text not null check (char_length(icerik) between 1 and 5000),
  olusturma timestamptz not null default now(),
  duzenleme timestamptz,
  son_hareket timestamptz not null default now(),
  cevap_sayisi int not null default 0,
  begeni_sayisi int not null default 0,
  en_iyi_cevap bigint
);

create index konular_kategori_hareket on public.konular (kategori, son_hareket desc);
create index konular_hareket on public.konular (son_hareket desc);

-- 3) CEVAPLAR
create table public.cevaplar (
  id bigint generated always as identity primary key,
  konu_id bigint not null references public.konular(id) on delete cascade,
  kullanici_id uuid not null references public.profiller(id) on delete cascade,
  kullanici_adi text not null,
  icerik text not null check (char_length(icerik) between 1 and 5000),
  olusturma timestamptz not null default now(),
  duzenleme timestamptz,
  begeni_sayisi int not null default 0
);

create index cevaplar_konu on public.cevaplar (konu_id, olusturma);

-- 4) BEĞENİLER (bir kişi bir şeyi bir kez beğenir)
create table public.begeniler (
  kullanici_id uuid not null default auth.uid() references public.profiller(id) on delete cascade,
  tur text not null check (tur in ('konu', 'cevap')),
  hedef_id bigint not null,
  primary key (kullanici_id, tur, hedef_id)
);

-- 5) YAZAN KİŞİYİ SUNUCU DOLDURSUN (kimse başkası adına yazamasın)
create function public.forum_sahibi()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.kullanici_id := auth.uid();
    new.kullanici_adi := (select kullanici_adi from public.profiller where id = auth.uid());
    new.olusturma := now();
  else
    new.duzenleme := now();
  end if;
  return new;
end;
$$;

create trigger konu_sahibi before insert or update of baslik, icerik on public.konular
  for each row execute function public.forum_sahibi();
create trigger cevap_sahibi before insert or update of icerik on public.cevaplar
  for each row execute function public.forum_sahibi();

-- 6) CEVAP EKLENİNCE / SİLİNİNCE konunun cevap sayısını ve son hareketini güncelle
create function public.cevap_sayaci()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.konular
      set cevap_sayisi = cevap_sayisi + 1, son_hareket = now()
      where id = new.konu_id;
  else
    update public.konular
      set cevap_sayisi = greatest(cevap_sayisi - 1, 0),
          en_iyi_cevap = case when en_iyi_cevap = old.id then null else en_iyi_cevap end
      where id = old.konu_id;
  end if;
  return null;
end;
$$;

create trigger cevap_sayisi_guncelle after insert or delete on public.cevaplar
  for each row execute function public.cevap_sayaci();

-- 7) BEĞENİ EKLENİNCE / SİLİNİNCE sayacı güncelle
create function public.begeni_sayaci()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  fark int := case when tg_op = 'INSERT' then 1 else -1 end;
  satir public.begeniler := case when tg_op = 'INSERT' then new else old end;
begin
  if satir.tur = 'konu' then
    update public.konular set begeni_sayisi = greatest(begeni_sayisi + fark, 0) where id = satir.hedef_id;
  else
    update public.cevaplar set begeni_sayisi = greatest(begeni_sayisi + fark, 0) where id = satir.hedef_id;
  end if;
  return null;
end;
$$;

create trigger begeni_sayisi_guncelle after insert or delete on public.begeniler
  for each row execute function public.begeni_sayaci();

-- 8) EN İYİ CEVAP: sadece konuyu açan kişi seçer (aynı cevaba tekrar basınca kaldırılır)
create function public.en_iyi_cevap_sec(konu bigint, cevap bigint)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.konular where id = konu and kullanici_id = auth.uid()) then
    raise exception 'Sadece konuyu açan kişi en iyi cevabı seçebilir';
  end if;
  if not exists (select 1 from public.cevaplar where id = cevap and konu_id = konu) then
    raise exception 'Cevap bu konuya ait değil';
  end if;
  update public.konular
    set en_iyi_cevap = case when en_iyi_cevap = cevap then null else cevap end
    where id = konu;
end;
$$;

-- 9) KULLANICI ADI DEĞİŞİNCE forumdaki eski yazılarda da değişsin
--    (supabase-hesap.sql'deki fonksiyonun genişletilmiş hali)
create or replace function public.ad_degisince()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.mesajlar set kullanici_adi = new.kullanici_adi where kullanici_id = new.id;
  update public.konular  set kullanici_adi = new.kullanici_adi where kullanici_id = new.id;
  update public.cevaplar set kullanici_adi = new.kullanici_adi where kullanici_id = new.id;
  return new;
end;
$$;

-- 10) GÜVENLİK KURALLARI
alter table public.kategoriler enable row level security;
alter table public.konular     enable row level security;
alter table public.cevaplar    enable row level security;
alter table public.begeniler   enable row level security;

create policy "kategoriler herkese acik" on public.kategoriler for select using (true);
create policy "konular herkese acik"     on public.konular     for select using (true);
create policy "cevaplar herkese acik"    on public.cevaplar    for select using (true);
create policy "begeniler herkese acik"   on public.begeniler   for select using (true);

create policy "uyeler konu acar" on public.konular for insert to authenticated
  with check (kullanici_id = auth.uid());
create policy "kendi konusunu duzenler" on public.konular for update to authenticated
  using (kullanici_id = auth.uid()) with check (kullanici_id = auth.uid());
create policy "kendi konusunu siler" on public.konular for delete to authenticated
  using (kullanici_id = auth.uid());

create policy "uyeler cevap yazar" on public.cevaplar for insert to authenticated
  with check (kullanici_id = auth.uid());
create policy "kendi cevabini duzenler" on public.cevaplar for update to authenticated
  using (kullanici_id = auth.uid()) with check (kullanici_id = auth.uid());
create policy "kendi cevabini siler" on public.cevaplar for delete to authenticated
  using (kullanici_id = auth.uid());

create policy "uyeler begenir" on public.begeniler for insert to authenticated
  with check (kullanici_id = auth.uid());
create policy "begenisini geri alir" on public.begeniler for delete to authenticated
  using (kullanici_id = auth.uid());

-- 11) ERİŞİM İZİNLERİ (sayaçlar gibi alanlara üyeler elle dokunamaz)
grant select on public.kategoriler, public.konular, public.cevaplar, public.begeniler to anon, authenticated;
grant insert (kategori, baslik, icerik) on public.konular to authenticated;
grant update (baslik, icerik) on public.konular to authenticated;
grant delete on public.konular to authenticated;
grant insert (konu_id, icerik) on public.cevaplar to authenticated;
grant update (icerik) on public.cevaplar to authenticated;
grant delete on public.cevaplar to authenticated;
grant insert (tur, hedef_id), delete on public.begeniler to authenticated;
revoke execute on function public.en_iyi_cevap_sec(bigint, bigint) from public, anon;
grant execute on function public.en_iyi_cevap_sec(bigint, bigint) to authenticated;
