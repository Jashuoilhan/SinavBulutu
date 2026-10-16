-- =====================================================================
--  SINAV BULUTU — HESAP ÖZELLİKLERİ (3. adım)
--  Profil, kullanıcı adı değiştirme ve hesap silme için.
--  Bu dosyanın TAMAMINI kopyala, Supabase > SQL Editor'e yapıştır, Run'a bas.
--  Sadece BİR KERE çalıştırılır.
-- =====================================================================

-- 1) PROFİLE YENİ ALANLAR: avatar (emoji), hedef sınav, hakkında yazısı
alter table public.profiller
  add column avatar text not null default '🙂'
    check (char_length(avatar) between 1 and 8),
  add column hedef_sinav text
    check (hedef_sinav in ('yks', 'kpss', 'ales', 'lgs', 'dgs', 'yds', 'diger')),
  add column hakkinda text
    check (char_length(hakkinda) <= 300);

-- 2) KULLANICI ADI KURALLARI
--    Sadece harf, rakam ve _ ; büyük/küçük harf farkı aynı ad sayılır (Ali = ali)
alter table public.profiller
  add constraint kullanici_adi_bicim
    check (kullanici_adi ~ '^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]{3,20}$');

create unique index profiller_ad_kucuk_harf
  on public.profiller (lower(kullanici_adi));

-- 3) HERKES SADECE KENDİ PROFİLİNİ DÜZENLER (sadece bu 4 alanı)
grant update (kullanici_adi, avatar, hedef_sinav, hakkinda)
  on public.profiller to authenticated;

create policy "kendi profilini duzenler"
  on public.profiller for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 4) KULLANICI ADI DEĞİŞİNCE ESKİ MESAJLARDAKİ AD DA DEĞİŞSİN
create function public.ad_degisince()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.mesajlar
    set kullanici_adi = new.kullanici_adi
    where kullanici_id = new.id;
  return new;
end;
$$;

create trigger profil_ad_degisince
  after update of kullanici_adi on public.profiller
  for each row
  when (old.kullanici_adi is distinct from new.kullanici_adi)
  execute function public.ad_degisince();

-- 5) HESABIMI SİL: üye kendi hesabını ve tüm mesajlarını siler
--    (profil ve mesajlar, hesaba bağlı olduğu için otomatik silinir)
create function public.hesabimi_sil()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Giriş yapılmamış';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.hesabimi_sil() from public, anon;
grant execute on function public.hesabimi_sil() to authenticated;
