-- =====================================================================
--  SINAV BULUTU — ERİŞİM İZİNLERİ (2. adım)
--  Yeni Supabase projeleri tablolara otomatik izin vermiyor.
--  Bu dosyanın TAMAMINI kopyala, SQL Editor'e yapıştır, Run'a bas.
--  (Kimin neyi yapabileceğini yine güvenlik kuralları (RLS) belirliyor.)
-- =====================================================================

grant usage on schema public to anon, authenticated;

-- Herkes okuyabilir
grant select on public.profiller to anon, authenticated;
grant select on public.mesajlar  to anon, authenticated;

-- Giriş yapmış üyeler mesaj yazıp silebilir
grant insert, delete on public.mesajlar to authenticated;
