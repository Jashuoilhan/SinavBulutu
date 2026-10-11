# Proje Notları

Bu dosya yaptığımız her şeyin kaydıdır. Claude her oturumda önce burayı okur, her işten sonra burayı günceller.

## 📍 KALDIĞIMIZ YER (son oturum: 11.10.2026 gece)
Kullanıcı çıktı. Döndüğünde buradan devam edilecek.

**Son yapılan:** Puan hesaplama sayfası (`puan.html`) bitti ve tarayıcıda açıldı. Kullanıcının sayfayı deneyip geri bildirim vermesi bekleniyor.

**Sitenin şu anki durumu** (`C:\Users\pc\Desktop\sinav-sayaci\`):
- ✅ Sayaçlar (`index.html`), Puan Hesapla (`puan.html`), Kaynaklar, Topluluk sayfaları
- ✅ Gizlilik, Hakkımızda, İletişim, Kullanım Koşulları sayfaları. Linkleri her sayfanın altında.
- ✅ Sağ üstte Giriş yap / Hesap aç butonları
- ✅ Supabase bağlı, izinler açık. Test hesabı `ornek_hesap` açıldı, **e-posta onayı henüz yapılmadı.**
- ✅ `ads.txt`, `robots.txt`, `sitemap.xml` hazır, içlerinde ALANADI ve pub-XXXX yer tutucuları var.
- ⏳ Site henüz internette değil, sadece bilgisayarda.

**Döndüğünde sırayla yapılacaklar:**
1. Puan sayfası hakkında kullanıcının görüşünü sor, bozuk bir yer varsa düzelt.
2. Kullanıcının ertelediği topluluk testi: Gmail'deki onay linkine tıklanacak, `ornek_hesap` ile giriş yapılıp mesaj denenecek.
3. AdSense için **içerik yazıları** (10-15 özgün yazı). Bir sonraki büyük iş bu.
4. Kullanıcıdan istendi: ÖSYM 2024 KPSS Önlisans ve Ortaöğretim "sayısal bilgiler" PDF'i (puan hesaplayıcıda bu iki düzeyin güncel verisi eksik).
5. Sonra: alan adı, Netlify'a yükleme, AdSense başvurusu (ayrıntılar aşağıda "Açık İşler 0" maddesinde).

## Kullanıcı Hakkında
- VS Code'u yeni indirdi, hiç deneyimi yok.
- Adım adım, sade Türkçe ile ilerliyoruz.

## Ortam
- İşletim sistemi: Windows 11 Pro
- Editör: VS Code (Claude Code eklentisi ile)
- Ana klasör: `C:\Users\pc`

## Yapılanlar (Kronolojik)

### 2026-10-11
- VS Code kuruldu.
- Bu not dosyası (`PROJE_NOTLARI.md`) oluşturuldu. Bundan sonra her istek ve yapılan iş buraya yazılacak.
- Not dosyası kullanıcının isteğiyle masaüstüne taşındı: `C:\Users\pc\Desktop\PROJE_NOTLARI.md`

#### PROJE: "Sınav Bulutu" sitesi
**İstek:** Reklamla para kazanılacak bir site. İçinde bulut temalı, animasyonlu sınav geri sayım sayacı (TYT, AYT, KPSS Lisans/Önlisans/Ortaöğretim, ALES) olacak, önemli PDF'ler olacak, öğrenciler hesap açıp birbirleriyle konuşabilecek.

**Faz 1 tamamlandı. Sade HTML/CSS/JS, sunucu gerekmiyor.** Klasör: `C:\Users\pc\Desktop\sinav-sayaci\`
- `index.html`: ana sayfa. Sayaç kartları, YKS/KPSS/ALES filtreleri, reklam yer tutucuları var.
- `sinavlar.js`: **sınav tarihleri SADECE burada.** `resmi: false` olanlar sitede "Tahmini" etiketiyle görünür.
- `script.js`: sayaç mantığı. Her saniye güncellenir, sınav geçince "Sınav yapıldı" yazar.
- `style.css`: tüm tasarım (gökyüzü geçişi, kayan bulutlar, güneş, cam efektli kartlar).
- `kaynaklar.html`: resmi linkler (ÖSYM, MEB OGM Materyal) ve PDF listesi. PDF'ler `pdfler/` klasörüne konacak.
- `topluluk.html`: "Yakında" sayfası. Hesap ve sohbet özelliği Faz 2'de yapılacak.

**Tarihler (2026-10-11 itibarıyla):** ÖSYM 2027 takvimini henüz açıklamadı (Kasım 2026'da bekleniyor).
- ALES/3: 29.11.2026 (RESMİ, 2026 takviminden)
- TYT 19.06.2027, AYT/YDT 20.06.2027 (TAHMİNİ)
- KPSS Lisans/Önlisans/Ortaöğretim 2028 olarak girildi (TAHMİNİ). KPSS genelde çift yıllarda yapılıyor, takvim çıkınca kontrol edilecek.

#### Faz 2: Topluluk (veritabanı), KOD HAZIR, KURULUM KULLANICIDA
**İstek:** Kullanıcı sırayı belirledi: 1) veritabanı/topluluk, 2) reklam, 3) PDF'ler. Veritabanının ne olduğunu ve nasıl kullanılacağını öğrenmek istedi, anlatıldı.
- Seçilen servis **Supabase** (ücretsiz). Kontrol paneli supabase.com. Üyeler Authentication > Users, mesajlar Table Editor > mesajlar altında.
- `supabase-kurulum.sql`: tablolar (`profiller`, `mesajlar`), güvenlik kuralları (RLS), canlı sohbet ayarı. Supabase SQL Editor'de BİR KERE çalıştırılacak.
- `supabase-ayar.js`: Project URL ve anon/publishable anahtar buraya girilecek. service_role/secret anahtar ASLA girilmeyecek.
- `topluluk.js`: kayıt (kullanıcı adı + e-posta + şifre), giriş, çıkış, 4 oda (genel/yks/kpss/ales), canlı mesajlaşma, kendi mesajını silme.
- `topluluk.html`: giriş/kayıt formu ve sohbet ekranı. Supabase JS kütüphanesi CDN'den geliyor (sürüm 2.45.4).
- Güvenlik: mesaj sahibini ve kullanıcı adını sunucu dolduruyor (kimse başkası adına yazamaz). Mesajlar textContent ile gösteriliyor (kod enjeksiyonu yok).
- **Kullanıcının yapacakları:** Supabase hesabı + proje (bölge: Frankfurt) aç, SQL'i çalıştır, URL ve anahtarı Claude'a gönder.
- ✅ Supabase projesi açıldı. URL: `https://irykboyrsbjotztypywv.supabase.co`. Publishable anahtar `supabase-ayar.js` dosyasına girildi.
- ✅ `supabase-kurulum.sql` çalıştırıldı, tablolar var (API ile kontrol edildi).
- ⚠️ Tablolara erişim izni yoktu (401, permission denied). Yeni Supabase projeleri otomatik GRANT vermiyor. Bunun için `supabase-izinler.sql` hazırlandı, kullanıcı çalıştıracak.
- E-posta onayı AÇIK (mailer_autoconfirm: false). Kayıt olan kişi e-postasındaki linke tıklamalı.
- Supabase JS sürümü 2.57.4'e yükseltildi (yeni "publishable" anahtar için).
- ✅ `supabase-izinler.sql` çalıştırılmış: 2026-10-11 testinde `mesajlar` ve `profiller` tabloları 200 döndü (izin sorunu çözüldü, tablolar boş).
- **KARAR (2026-10-11):** Şimdilik veritabanı olarak Supabase (PostgreSQL) ile çalışılacak. İleride MSSQL ya da MySQL'e geçilecek. O zamana kadar her şey Supabase üzerinden yapılacak.
- Kullanıcı Supabase menüsünde Project Settings'i bulmakta zorlandı.
- Üst menünün sağ üstüne **Giriş yap** (beyaz çerçeveli) ve **Hesap aç** (turuncu) butonları eklendi. Üç sayfada da var, ikisi de `topluluk.html` sayfasına gidiyor. `?mod=kayit` ile gelindiğinde `topluluk.js` direkt kayıt sekmesini açıyor. Stil `style.css` içinde `.hesap-butonlari` altında.
- ✅ Örnek test hesabı API ile açıldı: kullanıcı adı `ornek_hesap`, e-posta: eski adres (artık kullanılmıyor, hesap silinecek), şifre `Bulut2026!` (sadece test için). `profiller` tablosuna otomatik kayıt düştü, yani tetikleyici çalışıyor. E-posta onayı bekleniyor.
- **E-posta değişikliği (2026-10-11):** Kullanıcı `minetnrvd` adresinin sadece Claude hesabı için olduğunu söyledi. Her yerde `ilhanyurt11@icloud.com` kullanılacak. Yeni test hesabı açıldı: kullanıcı adı `ornek_hesap2`, e-posta `ilhanyurt11+ornek@icloud.com` (iCloud + adresi), şifre eski test hesabıyla aynı. Onay maili iCloud'a gitti. Eski `ornek_hesap` hesabını kullanıcı Supabase panelinden (Authentication > Users) silecek. Supabase giriş e-postasını da kullanıcı kendisi değiştirecek.
- Test aşaması başladı: kullanıcı `topluluk.html` sayfasını açtı. Sırada kayıt (2. adım) var, sonucu bekleniyor. Sonraki seferlerde "Connect" butonunu ya da direkt linki öner.

#### Faz 3: AdSense hazırlığı (başladı, 2026-10-11)
**İstek:** Kullanıcı reklamla para kazanmak ve Google AdSense onayı almak istiyor, "son ayarları yap" dedi. Topluluk testini (e-posta onayı, giriş, mesaj) sonraya bıraktı.
- Yeni sayfalar: `gizlilik.html` (KVKK, çerezler, AdSense, üçüncü taraflar), `hakkimizda.html`, `iletisim.html`, `kullanim-kosullari.html` (topluluk kuralları dahil).
- Tüm sayfaların altına bu 4 sayfanın linkleri eklendi (`.alt-linkler`). Tüm sayfaların `<head>` kısmında AdSense kodu için yer tutucu yorum var.
- Kayıt formuna "Hesap açarak Kullanım Koşulları ve Gizlilik Politikası'nı kabul edersin" notu eklendi.
- `ads.txt`, `robots.txt` ve `sitemap.xml` oluşturuldu. İçlerinde **ALANADI** ve **pub-XXXX** yer tutucuları var, alan adı alınıp AdSense kimliği gelince değiştirilecek.
- `iletisim.html` sayfasındaki `iletisim@ornek.com` yer tutucudur, gerçek adresle değiştirilecek.

#### Puan hesaplama sayfası (2026-10-11)
**İstek:** YKS (TYT, AYT, SAY, EA, SÖZ, DİL) ve KPSS (Lisans, Önlisans, Ortaöğretim) için puan hesaplama. Kullanıcı yıllara göre ve "kesin doğru" olmasını istedi.
- Kullanıcıya açıklandı: kesin puan hesaplanamaz, çünkü ÖSYM puanı o yılki adayların ortalamasına ve standart sapmasına göre hesaplıyor. Sayfa bunu açıkça yazıyor.
- `puan.html` + `puan.js` + `puan-verileri.js` eklendi. **Tüm veriler `puan-verileri.js` içinde**, her yıl oradan güncellenecek. Menüye "Puan Hesapla" linki eklendi (tüm sayfalar).
- **KPSS:** ÖSYM yöntemi kullanılıyor: SP = 50 + 10(net − ort)/ss, ASP ağırlıklı, Puan = 70 + 30[2(ASP−X)−S]/[2(B−X)−S]. B = tam net ASP, S için GY-GK korelasyonu 0.8 varsayıldı. Lisans verileri 2025 (GY 17,430/9,108, GK 14,302/9,257) ve 2024 (GY 16,730/9,098, GK 18,861/10,517). Kaynak: finanskokpit.com ve rehberpanda.com, ikisi de ÖSYM sayısal bilgilerini aktarıyor, değerler birbirini tutuyor. Lisansta P1, P2, P3 hesaplanıyor.
- **KPSS Önlisans:** sadece 2018 verisi bulundu (GY 15,69/8,24, GK 17,11/9,98). **Ortaöğretim için hiç veri bulunamadı**, şimdilik önlisans 2018 verisiyle yaklaşık hesaplanıyor. ÖSYM sitesinden 2024 önlisans ve ortaöğretim sayısal bilgileri bulunup eklenmeli.
- **YKS:** ÖSYM test bazında standart sapma yayınlamadığı için yaygın yaklaşık katsayılar kullanıldı (taban 100; TYT 3.3/3.4; AYT türlerinde TYT 1.32/1.36; SAY Mat 3, Fiz 2.85, Kim 3.07, Biy 3.07; EA Mat 3, Ede 3, Ta1 2.8, Co1 3.33; SÖZ ek olarak Ta2/Co2 2.91, Fel 3, DKAB 3.33; YDT 3). Tam net = 500 olduğu kontrol edildi. ±10 puan sapabilir. OBP = diploma × 5 × 0,12 (yerleşenler 0,06), bu kısım resmi. 150/180 baraj uyarıları var.
- Hesaplar PowerShell ile kontrol edildi (2025: 80 net ≈ 84,9 P3).

#### GitHub bağlantısı (2026-10-11)
- Git kimliği tanıtıldı (global): isim `İlhan`, e-posta `ilhanyurt11@icloud.com`.
- İlk commit yapıldı (`main` dalı). Uzak repo eklendi: `origin` = `https://github.com/ilhan404/s-nav-bulutu.git`. Kullanıcı `main` üzerinde çalışacak.
- Claude'un terminalinden push yapılamadı, GitHub girişi gerekiyor ("Invalid username or token"). Kullanıcı ilk push'u VS Code terminalinden `git push -u origin main` ile yapacak, tarayıcıda GitHub girişi açılacak.
- Commit'ler iCloud adresiyle yeniden yazıldığı için GitHub ile ayrışma (sync hatası) oldu. Kullanıcı `git push --force-with-lease origin main` ile düzeltti. ✅ GitHub ve bilgisayar eşit, tüm commit'ler `İlhan <ilhanyurt11@icloud.com>`. Bundan sonra normal `git push` / Sync kullanılacak. Claude'un ortamı force push yapamıyor, push'u kullanıcı yapıyor.
- **Hesap değişikliği:** GitHub'da commit'ler "Jashuoilhan" adıyla göründü, çünkü iCloud adresi o hesaba kayıtlı. Kullanıcının iki GitHub hesabı var: `Jashuoilhan` (2025, iCloud adresi burada) ve `ilhan404` (2026-10-10). **Karar: ilhan404 artık kullanılmıyor.** Yeni repo: `https://github.com/Jashuoilhan/SinavBulutu.git`. `origin` buraya çevrildi. Commit'ler `İlhan <ilhanyurt11@icloud.com>` adına. ✅ Kullanıcı push etti, GitHub'dan doğrudan kontrol edildi: tüm commit'ler yeni repoda, `main` takip ediliyor.

## Açık İşler / Sıradaki Adımlar
0. **AdSense için kalanlar (sırayla):** a) Sitede özgün yazılar olmalı, en az 10-15 tane (çalışma taktikleri, sınav rehberleri). b) Alan adı alınacak. c) Site ücretsiz bir yere yüklenecek (Netlify/Cloudflare Pages). d) Yer tutucular değiştirilecek (ALANADI, iletişim e-postası). e) Google Search Console'a site ve sitemap eklenecek. f) AdSense başvurusu yapılacak, verilen kod tüm sayfaların `<head>` kısmına, pub kimliği `ads.txt` dosyasına yazılacak. g) AdSense panelinde AB kullanıcıları için Google'ın çerez onay mesajı (Privacy & messaging) açılacak. Not: "Reklam alanı" kutuları ve boş PDF bölümü, başvurudan önce gizlenmeli ya da doldurulmalı. Topluluğa şikâyet ve moderasyon özelliği eklenmesi önerilir (kullanıcı içerikli siteler için AdSense kuralı).
1. **Kasım 2026:** ÖSYM 2027 takvimi açıklanınca `sinavlar.js` güncellenecek.
2. **ŞU AN:** Supabase kurulumu ve izinler tamam. Sırada `topluluk.html` üzerinden gerçek kayıt + e-posta onayı + mesaj gönderme testi var. İleride eklenebilecekler: spam sınırı, moderatör/yönetici, profil fotoğrafı.
3. **Faz 3, Yayına alma ve reklam:** alan adı (.com veya .com.tr) alınacak, ücretsiz hosting (Netlify, Cloudflare Pages ya da GitHub Pages) kullanılacak, Gizlilik Politikası ve Hakkımızda sayfaları eklenecek, sonra Google AdSense başvurusu yapılacak.
4. **İleride veritabanı geçişi:** Supabase'den MSSQL ya da MySQL'e geçilecek (hangisi olacağı henüz belli değil). Geçiş sırasında şunlar da değişecek: Supabase'in hazır üyelik sistemi (Auth), canlı sohbet (Realtime) ve güvenlik kuralları (RLS). Bu yüzden ayrıca bir sunucu (backend) yazmak gerekecek. `topluluk.js` yeniden düzenlenecek.
5. **İçerik:** AdSense'in onaylaması için siteye özgün yazılar eklenmeli (çalışma taktikleri, sınav bilgileri vb.).
7. **Puan hesaplayıcı:** Her yıl ÖSYM sonuçları açıklanınca `puan-verileri.js` güncellenecek (KPSS ortalama/standart sapma). Ortaöğretim ve önlisans için güncel veri eksik.
6. **PDF uyarısı:** başkalarının telifli PDF'leri (yayınevi kitapları vb.) siteye yüklenmeyecek. Yalnızca kendi hazırladıklarımız ve resmi linkler kullanılacak.
