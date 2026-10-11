-- =====================================================================
--  SINAV BULUTU — VERİTABANI KURULUMU
--  Bu dosyanın TAMAMINI kopyala, Supabase > SQL Editor'e yapıştır, Run'a bas.
--  Sadece BİR KERE çalıştırılır.
-- =====================================================================

-- 1) PROFİLLER TABLOSU: her üyenin kullanıcı adı
create table public.profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique not null
    check (char_length(kullanici_adi) between 3 and 20),
  olusturma timestamptz not null default now()
);

-- 2) MESAJLAR TABLOSU: sohbet odalarındaki mesajlar
create table public.mesajlar (
  id bigint generated always as identity primary key,
  oda text not null check (oda in ('genel', 'yks', 'kpss', 'ales')),
  kullanici_id uuid not null references public.profiller(id) on delete cascade,
  kullanici_adi text not null,
  icerik text not null check (char_length(icerik) between 1 and 1000),
  olusturma timestamptz not null default now()
);

create index mesajlar_oda_tarih on public.mesajlar (oda, olusturma desc);

-- 3) Yeni üye kayıt olunca otomatik profil oluştur
create function public.yeni_kullanici()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiller (id, kullanici_adi)
  values (new.id, new.raw_user_meta_data ->> 'kullanici_adi');
  return new;
end;
$$;

create trigger kayit_olunca_profil
  after insert on auth.users
  for each row execute function public.yeni_kullanici();

-- 4) Mesaj yazılınca yazan kişiyi ve adını sunucu doldursun
--    (böylece kimse başkasının adıyla mesaj yazamaz)
create function public.mesaj_sahibi()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.kullanici_id := auth.uid();
  new.kullanici_adi := (select kullanici_adi from public.profiller where id = auth.uid());
  new.olusturma := now();
  return new;
end;
$$;

create trigger mesaj_yazilinca
  before insert on public.mesajlar
  for each row execute function public.mesaj_sahibi();

-- 5) GÜVENLİK KURALLARI (Row Level Security)
alter table public.profiller enable row level security;
alter table public.mesajlar  enable row level security;

-- Kullanıcı adlarını herkes görebilir
create policy "profiller herkese acik"
  on public.profiller for select using (true);

-- Mesajları herkes okuyabilir
create policy "mesajlar herkese acik"
  on public.mesajlar for select using (true);

-- Sadece giriş yapmış üyeler, kendi adına mesaj yazabilir
create policy "uyeler mesaj yazar"
  on public.mesajlar for insert to authenticated
  with check (kullanici_id = auth.uid());

-- Herkes sadece kendi mesajını silebilir
create policy "kendi mesajini siler"
  on public.mesajlar for delete to authenticated
  using (kullanici_id = auth.uid());

-- 6) Canlı sohbet: yeni mesajlar sayfa yenilenmeden gelsin
alter publication supabase_realtime add table public.mesajlar;
