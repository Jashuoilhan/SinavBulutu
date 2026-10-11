# Proje Notları

Bu dosya yaptığımız her şeyin kaydıdır. Claude her oturumda önce burayı okur, her işten sonra burayı günceller.

## 📍 KALDIĞIMIZ YER (son oturum: 11.10.2026 akşam, arayüz/animasyon + mobil oturumu)
Kullanıcı "bitiriyoruz" dedi. Döndüğünde buradan devam edilecek.

**Bu oturumda yapılan (özet, ayrıntılar aşağıda "Arayüz oturumu" başlığında):**
- "Kalkış panosu" yeniden tasarımı denendi → kullanıcı beğenmedi → **geri alındı**. Kullanıcı eski gökyüzü/bulut havasını seviyor; tasarım önerirken bunu koru.
- Sonra kullanıcının getirdiği Uiverse/CodePen bileşenleri tek tek siteye uyarlandı: sayaç kartı hover efekti, harf harf parlayan başlıklar, ikonlu menü butonları, puan kartları (YKS + KPSS), bilgi/uyarı kutucukları, açılır seçim menüsü, ortak yükleme animasyonu, sol üstte "+" açılır menü (hamburger ikonlu), koyu tema anahtarı, 3B bulut arka planı, Telma yazı tipi, giriş/kayıt kartı, Number Flow sayaçları ve sayı girişleri.
- Arka plan şu an **3B bulutlar** (`bulut3d.js`). Önceki **deniz sahnesi** yedekte (`yedekler/`), kullanıcı "beğenmezsem buna döneriz" dedi.
- Oturumun sonunda: telefon düzeni (üst kısım 2 satır, sayfa butonları 2x2, oda/filtre butonları tek satır), telefonda test (aynı Wi-Fi, `http://192.168.8.124:8000`), otomatik doldurma rengi düzeltmesi, giriş yapınca sağ üstte "Çıkış yap", sohbetteki çıkış butonu kaldırıldı + hoş geldin ortalandı, menü açıkken arka plan bulanıklaşıyor, ana sayfada son satırdaki kartlar ortalanıyor. Sürüm etiketi şu an `?v=34`.
- ✅ Bu oturumun değişiklikleri kullanıcı tarafından commit edilip GitHub'a gönderildi (commit `912e510`, 2026-10-11). Push'u her zaman kullanıcı yapar.

**Sitenin şu anki durumu** (`C:\Users\minet\OneDrive\Masaüstü\SinavBulutu\`; eski yol `C:\Users\pc\Desktop\sinav-sayaci\` artık geçersiz):
- ✅ Sayaçlar, Puan Hesapla, Kaynaklar, Topluluk + Gizlilik, Hakkımızda, İletişim, Kullanım Koşulları sayfaları.
- ✅ Supabase bağlı. Test hesabı `ornek_hesap2` (iCloud), e-posta onayı ve mesaj testi hâlâ yapılmadı.
- ✅ `ads.txt`, `robots.txt`, `sitemap.xml` hazır, ALANADI ve pub-XXXX yer tutucuları var.
- ⏳ Site henüz internette değil. Yerelde `start.bat` veya `python -m http.server 8000` → http://localhost:8000

**Döndüğünde sırayla yapılacaklar:**
1. `git status` ile kontrol et; son durumda her şey GitHub'daydı.
2. Kullanıcının bekleyen kararları: 3B bulutlar mı deniz sahnesi mi? Beyaz yazılara koyu gölge eklensin mi (bulutun üstünde okunmuyor, telefonda daha belirgin)? Açık temada parlayan başlıklar soluk. (Koyu temadaki filtre butonları düzeltildi.)
   Doğrulanmayanlar (kullanıcı denemeli): sağ üst "Çıkış yap" gerçek hesapla; otomatik doldurmada kullanıcı adı alanına e-posta dolmaması; sayı girişlerinin gerçek tarayıcıdaki akıcılığı; 3B bulutların açılış efekti ve telefondaki performansı.
3. Topluluk testi: e-posta onayı, giriş, mesaj gönderme (yeni giriş kartıyla birlikte denenmeli).
4. AdSense için **içerik yazıları** (10-15 özgün yazı). Bir sonraki büyük iş bu.
5. ÖSYM 2024 KPSS Önlisans ve Ortaöğretim "sayısal bilgiler" verisi (puan hesaplayıcıda eksik).
6. Sonra: alan adı, Netlify'a yükleme, AdSense başvurusu ("Açık İşler 0" maddesi).
7. Performans uyarısı: arka plan animasyonları (3B bulut / deniz) eski telefonlarda ağır olabilir, yayından önce mobilde kontrol et.

## Kullanıcı Hakkında
- VS Code'u yeni indirdi, hiç deneyimi yok.
- Adım adım, sade Türkçe ile ilerliyoruz.

## Ortam
- İşletim sistemi: Windows 11 Pro
- Editör: VS Code (Claude Code eklentisi ile)
- Proje klasörü (güncel): `C:\Users\minet\OneDrive\Masaüstü\SinavBulutu` (eskiden `C:\Users\pc\...`)

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

#### Arayüz oturumu (2026-10-11) — dosya haritası
Ortak dosyalar (hepsi tüm sayfaların `<head>`'inde, `?v=34` sürüm etiketiyle; **CSS/JS değişince numarayı tüm sayfalarda artır**):
- `tema.js`: açık/koyu tema anahtarı (`.ui-switch`), `localStorage` "tema".
- `yukleme.js`: ortak yükleme animasyonu (kayan yazı, varsayılan "Never Gonna Give You Up"), `Yukleme.goster/gizle/kutuIcin`.
- `secim.js`: tüm `<select>`'leri animasyonlu menüye çevirir.
- `baslik.js`: `.giris h1` başlıklarında harf harf parlama.
- `menu.js`: sol üstteki açılır menünün aç/kapa durumu (`.acilir-menu`, açıkken `body.menu-acik` → arka plan bulanık) + sağ üst Giriş/Çıkış butonu (`HesapDurumu.ayarla`).
- `bulut3d.js`: arka plan 3B bulutlar (şu an aktif). `okyanus.js`: deniz sahnesi (bağlı değil, yedekte de var).
- `sayi-girdi.js`: puan.html'deki sayı alanları → Number Flow'lu `− [rakam] +`.
- Dış kaynaklar: Google Fonts (Nunito), Fontshare (Telma, logo), esm.sh `number-flow@0.6.2` (index + puan).
- Tüm stiller tek dosyada: `style.css` (bölüm başlıklarıyla).
- Test notu: headless Edge'de sürekli animasyon yüzünden CSS geçişleri takılı görünür; ekran görüntüsünde geçişleri kapat, yükleme ekranını gizle, `.gok3d` transform'unu sıfırla. Dar pencerede (min ~500px) ölçüm yanıltıcı, 390px için iframe kullan.

#### Tasarım denemesi, GERİ ALINDI (2026-10-11)
- Kullanıcı "daha modern, kompakt, AI yapımı görünmesin" istedi. "Kalkış panosu" tasarımı (IBM Plex, koyu tablo, emojisiz) ve ardından canlı gökyüzü efektleri (`gok.js`: saate göre renk, uçak, yıldız) denendi.
- **Kullanıcı beğenmedi, tüm UI değişiklikleri geri alındı.** Site eski gökyüzü/bulut tasarımında (Nunito, cam kartlar, emojiler). Bir daha tasarım değişikliği önerirken bunu hatırla: kullanıcı eski gökyüzü görünümünü seviyor.
- Sayaç kartlarına kullanıcının getirdiği Uiverse hover efekti eklendi: kart içi `.kart-ic` hover'da %98'e küçülüyor, arkadaki yeşil-mor gradyan (`.kart::before`, #00ff75 → #3700ff) kenardan görünüyor, etrafında yeşil parıltı. Cam görünüm korundu.
- Ana sayfa başlığı "Sınavına kaç gün kaldı?" kullanıcının getirdiği Uiverse loader efektiyle (dexter-st) yapıldı: harfler sırayla parlıyor. (Arkadaki renkli ışık katmanı kullanıcı istemediği için kaldırıldı.) Okunabilirlik için harfler tamamen sönmüyor (opaklık 0.5'te bekliyor, orijinalde 0). Sonradan tüm sayfaların başlıklarına (`.giris h1`) uygulandı: ortak dosya `baslik.js` (her sayfanın head'inde), emojiler tek parça kalır. Stil `.isikli-baslik` / `.harf`.
- Koyu tema eklendi (anahtar sonradan Uiverse "ui-switch" ile değiştirildi: turuncu güneşli daire ↔ lacivert aylı daire, `.ui-switch`): Uiverse güneş/ay anahtarı (önce sol üstteydi, kullanıcı isteğiyle sağ üste "Giriş yap" butonunun soluna taşındı, `.hesap-butonlari` içinde). `tema.js` (her sayfanın `<head>`'inde) anahtarı header'a ekliyor, seçimi `localStorage` "tema" anahtarında saklıyor, `<html data-tema="koyu">` yapıyor. Koyu temada gece gökyüzü, güneş → ay, soluk bulutlar, koyu cam kartlar. Stiller `style.css` sonunda `html[data-tema="koyu"]` altında.
- Üst menüdeki 4 link Uiverse ikonlu buton stiline çevrildi (tüm sayfalar): mavi hap buton, beyaz daire içinde emoji (⏳ Sayaçlar, 🧮 Puan Hesapla, 📚 Kaynaklar, 💬 Topluluk), hover'da turuncuya döner ve emoji çapraz kayarak yenisiyle değişir. Aktif sayfa turuncu. Header boşlukları sığması için daraltıldı (padding 3%).
- Puan Hesapla (YKS) bölümüne 4 kart eklendi: TYT, AYT, YDT, Diploma (Uiverse "hover me" kartından uyarlandı, sitenin mavisi; kartlar 170×76px; üzerinde sadece kısa ad TYT/AYT/YDT/OBP yazar, hover'da daireler büyüyüp tam adı çıkar: "Temel Yeterlilik Testi" vb.). Karta tıklayınca o bölümün paneli (`.puan-panel`, `hidden`) açılır, diğerleri kapanır; açık kart turuncu. Kod `puan.js` sonunda. Gizli paneldeki değerler hesaba girmeye devam eder. KPSS tarafına dokunulmadı. Tarih-1/2 ve Coğrafya-1/2 ayrı kaldı (puan türlerine farklı katsayıyla girdikleri için; kullanıcı "olduğu gibi kalsın" dedi).
- KPSS'e de aynı kartlar eklendi: Lisans / Önlisans / Ortaöğretim (hover'da "KPSS Lisans (P1, P2, P3)" vb.). Karta tıklayınca gizli `#kpss-duzey` seçimi değişir ve ortak `#panel-kpss` (yıl seçimi + D/Y) açılır. Kart grupları birbirinden bağımsız (`.puan-kartlari` içinde). `[hidden]` için genel `display:none !important` kuralı eklendi.
- **Ortak yükleme animasyonu** (`yukleme.js`, tüm sayfaların `<head>`'inde): Uiverse kayan yazı (harfler sağdan sola kayar, kenarlarda solar). Değiştirmek için sadece `yukleme.js` → `animasyonHtml()` ve `style.css` → "Ortak yükleme animasyonu" bölümü. Kullanım: `Yukleme.goster("mesaj")`, `Yukleme.gizle()`, `Yukleme.kutuIcin("mesaj")`. Kullanıldığı yerler: sayfa açılışı (sayfa hazır olunca kapanır, en geç 4 sn), topluluk mesajları yüklenirken, giriş yap / hesap aç sırasında. YKS/KPSS kartları flex ile ortalandı.
- **Ortak açılır seçim kutusu** (`secim.js`, tüm sayfalarda): sitedeki tüm `<select>`'ler otomatik olarak Uiverse menü görünümüne çevrilir (üzerine gelinmeyen seçenekler bulanıklaşıp küçülür, seçili olanın solunda turuncu çizgi). Asıl `<select>` gizli kalır, değer ve `change` olayı ona aktarılır; seçenekler değişince menü kendini yeniler. Hariç tutmak için `<select data-yerli>`. Şu an görünür tek select: KPSS yıl seçimi. Yükleme ekranındaki varsayılan yazı kullanıcının isteğiyle "Never Gonna Give You Up".
- **Açılır menü (güncel):** dairesel menü kaldırıldı, yerine Uiverse "+" menüsü geldi (`.acilir-menu`, tüm sayfalarda statik HTML). Buton ikonu Uiverse animasyonlu hamburger (`.hamburger-ikon`, stroke-dasharray ile çizgiler kıvrılıp ✕ olur, `.acilir-menu.acik` ile tetiklenir). Açık/kapalı durumu `menu.js` yönetir (`.acilir-menu.acik`): fareyle üzerine gelince açılır, butona tıklayınca açılır/kapanır (açıkken tıklayınca kapanır), dokunmatikte dokununca, dışarı tıklayınca/Esc ile kapanır. Açılınca 4 beyaz daire (SVG ikon: bilgi, zarf, kilit, belge) aşağıya dikey yaylanarak açılır, adları sağında. Aşağıdaki eski dairesel menü notu artık geçersiz. Menü açıkken `body.menu-acik` olur ve sayfanın geri kalanı `blur(3px) brightness(0.92)` ile bulanıklaşır.
- ~~Dairesel menü~~ (sol üstte sıra: menü butonu → "Sınav Bulutu ☁️"; baloncuklar sağ-aşağı açılır; tüm sayfalarda statik HTML, `.logo-alani` > `.menu`): Uiverse hamburger butonu; açılınca 4 renkli daire aşağıya yay şeklinde açılır: ℹ️ Hakkımızda, ✉️ İletişim, 🔒 Gizlilik, 📜 Kullanım Koşulları; üzerine gelince sayfa adı. Sonradan "baloncuk" görünümü verildi: yarı saydam cam, parlak yansıma, renk tonu `--ton` değişkeninde, açıkken hafifçe süzülür. Alt bilgideki linkler de duruyor (AdSense için faydalı). Sağ üst: tema anahtarı + Giriş yap + Hesap aç.
- **Arka plan = canlı deniz sahnesi** (`okyanus.js`, tüm sayfalarda; kullanıcının getirdiği "Tides" canvas animasyonundan): gökyüzü, güneş/ay, bulut, kuş, dalgalar, güneşin denizdeki parıltısı. Saat İstanbul saatinden alınır: 05:00 şafak → 23:00 gece (23-05 arası gece), dakikada bir güncellenir. Koyu tema açıkken her zaman gece sahnesi (gece yarısı; zaten geceyse o saat). Renkler 24 saatlik kesintisiz döngü (gece 23→04, 05 şafak). Tema değişince sahne hedefe atlamaz: saat ~3,5 sn'de hep İLERİ sarılarak aradaki gökyüzü renklerinden geçer (gündüz→gece: gün batımı; gece→gündüz: şafak, sabah, öğle…). Kodu `okyanus.js` → `hedefeGec`, `gecisiIlerlet`. Kaydırma çubuğu ve "TIDES" yazıları kullanılmadı. Eski `.gokyuzu` (güneş + kayan bulutlar) CSS ile gizlendi, HTML'de duruyor. Koyu deniz üstünde okunsun diye `footer` ve `.not` cam zemine alındı. Not: headless Edge'de sürekli canvas animasyonu yüzünden CSS geçişleri takılı görünüyor, test ederken geçişleri kapat.
- **YEDEK (2026-10-11):** Kullanıcı başka bir arka plan animasyonu denemek istedi, "beğenmezsem buna geri döneriz" dedi. Deniz sahnesi yedeklendi: `yedekler/okyanus-deniz-v1.js` ve `yedekler/okyanus-deniz-v1.css` (style.css'teki ilgili bölüm). Geri dönmek için: js'i `okyanus.js` olarak geri kopyala, css bölümünü style.css sonuna ekle, tüm sayfalarda `okyanus.js` bağlantısı olsun.
- **DENEME (2026-10-11): 3B hareketli bulutlar** (`bulut3d.js`, sayfalarda `okyanus.js` yerine bağlı). Kullanıcının getirdiği "Moving Clouds / CloudGenerator" kodundan: perspektifli 3B bulut katmanları soldan sağa süzülür, açılışta ~5 sn bulutların içinden geçme (zoom) efekti. Dış siteden (clicktorelease.com, http) bulut resmi ÇEKİLMİYOR, doku canvas ile üretiliyor; jQuery kaldırıldı. Sabit gündüz gökyüzü (#548cb3→#8dc8e7), koyu temada gece gradyanı + soluk bulutlar. Saate göre değişim YOK (deniz sahnesindeki gibi). Kullanıcı beğenmezse deniz sahnesine dönülecek (yedek bilgisi yukarıda).
- **Site adı yazı tipi: Telma** (Fontshare, ticari kullanım ücretsiz; tüm sayfalarda `api.fontshare.com/v2/css?f[]=telma@700`, `.logo` sınıfında). Türkçe harfler (ı İ ğ ş ç ö ü) tarayıcıda çizilerek kontrol edildi, hepsi var. Bulutlar 3B arka planda %75 saydamlıkta (yazılar okunsun diye).
- **Giriş/kayıt kartı** (topluluk.html, `.hesap-kart`): İç kısım Uiverse login kartından (ikonlu içe gömük alanlar, turuncu→mavi gradyan butonlar); kartın kendisi kullanıcı isteğiyle ana sayfadaki sayaç kartlarıyla aynı yapıda (cam kart, hover'da yeşil→mor #00ff75→#3700ff gradyan kenar + yeşil parıltı + içe küçülme). Üstteki sekmeler kaldırıldı; her formda "gönder" + diğer forma geçen ikincil buton var (ikincil butonlar `.sekme` + `data-mod`, topluluk.js'teki sekme kodu aynen çalışıyor). Input id'leri değişmedi. "Şifremi unuttum" eklenmedi (şifre sıfırlama özelliği yok). Tarayıcı otomatik doldurma rengi (`:-webkit-autofill`) iki tema için ezildi. Kayıttaki kullanıcı adı alanı `autocomplete="nickname"` (önceden "username" idi, tarayıcı oraya e-posta dolduruyordu).
- **Ana sayfa sayaçları: Number Flow** (MIT, vanilla sürüm `number-flow@0.6.2`, index.html'de `esm.sh`'den `type="module"` ile; `<number-flow>` ve `<number-flow-group>`). Kullanıcının getirdiği React örneğinden uyarlandı: büyük gün sayısı + tek satır `SS:DD:ss` (trend -1, iki basamak, dakika/saniye onlar basamağı 0-5), altında hizalı etiketler (`.nf-saat`, `.nf-etiket`). `script.js` → `sayiYaz`: kütüphane yoksa düz rakam yazar. Eski `.kucuk-sayac` kutuları artık kullanılmıyor.
- **Ortak sayı girişi** (`sayi-girdi.js`, şimdilik puan.html'de + number-flow modülü): tüm `<input type="number">` alanları otomatik `− [kayan rakam] +` bileşenine dönüşür (kullanıcının getirdiği Number Flow "Input" React örneğinden). Asıl input yerinde kalır (yazısı şeffaf), üstünde `<number-flow>`; +/− ile değişince kayarak, yazınca animasyonsuz; `input` olayı tetiklenir (puan.js değişmedi). Boş alan soluk 0 gösterir (0 sayılır); yer tutuculu alan (diploma) boşken yer tutucuyu gösterir. Diploma (50-100, ondalıklı) için yazarken anlık reddetme YOK (yoksa "85" yazılamazdı), sadece max aşılırsa sınıra çekilir. Hariç tutmak için `data-yerli`. Başka sayfaya eklenirse number-flow modülü de eklenmeli. HATA DÜZELTİLDİ: koyu temadaki eski `.test-satir input` kuralı asıl girdinin yazısını görünür yapıyordu → kayan rakamın altında sabit rakam üst üste biniyordu; yüksek özgüllüklü `html[data-tema] .sayi-girdi input.sg-girdi` kuralıyla arka plan/kenar/renk sıfırlandı.
- **Telefon düzeni (≤640px, style.css sonunda):** üst kısım 2 bölüm: 1. satır menü + site adı (sol), tema anahtarı + mavi "Giriş yap" (sağ); altında 4 sayfa butonu 2x2 ızgara. "Hesap aç" telefonda gizli (giriş kartında var). Telefonda test: aynı Wi-Fi'da `http://<bilgisayar IP>:8000` (2026-10-11'de 192.168.8.124).
- **Giriş durumuna göre sağ üst butonlar** (`menu.js` → `HesapDurumu.ayarla`): tarayıcıda Supabase oturumu varsa (`sb-…-auth-token`) "Giriş yap" → "Çıkış yap" olur (link `topluluk.html?cikis=1`, topluluk.js orada `signOut` yapar), "Hesap aç" gizlenir. Topluluk sayfasında `onAuthStateChange` da çağırır. Telefonda oda/filtre butonları tek satır; koyu temada seçili olmayan filtre/oda ve `.kucuk-buton` arka planı koyulaştırıldı (bulutta okunsun).
- Ana sayfa sayaç kartları flex düzene alındı (`.kartlar`): masaüstünde satırda 3, son satırda kalan kart(lar) ortada; ≤700px tek sütun.
- **Reklam alanları (2026-10-11): ŞİMDİLİK GİZLİ.** Kullanıcı "şimdilik kaldır, yerlerini unutma, sonra ekleyeceğiz" dedi. HTML'den silinmedi, `style.css` en sonundaki `.reklam { display: none !important; }` ile gizlendi. Geri açmak için o kuralı sil. Yerleri (5 adet, hepsi `<div class="reklam">Reklam alanı</div>`):
  1. `index.html` — filtre butonlarının altı, sayaç kartlarının ÜSTÜ (728x90 banner yeri)
  2. `index.html` — sayaç kartlarının ALTI, "Tahmini" notunun üstü
  3. `kaynaklar.html` — "Resmi kaynaklar" kutusu ile "PDF dokümanlar" kutusu ARASI
  4. `puan.html` — YKS/KPSS bölümlerinin bittiği yer, "Bu puanlar ne kadar doğru?" kutusunun ÜSTÜ
  5. `topluluk.html` — sohbet/giriş alanının altı, "Saygılı olalım" notunun ALTI
  Ayrıca tüm sayfaların `<head>`'inde `<!-- REKLAM: Google AdSense onaylanınca kodu buraya eklenecek -->` yorumu var (AdSense ana kodu buraya).
- **Önbellek:** kullanıcının tarayıcısı eski JS'i önbellekten yükledi. Tüm yerel CSS/JS bağlantılarına `?v=2` eklendi. **CSS/JS değişince bu numarayı tüm sayfalarda artır** (ör. `?v=3`).
- YKS sonuç altındaki bilgi/uyarı yazıları okunur hale getirildi: her biri ayrı satır, ikon + kalın başlık + açıklama; renk türe göre (bilgi mavi, başarı yeşil, uyarı turuncu). `puan.js` `yksHesapla` içinde, stil `.uyari-satir`.
- Kullanıcıya açık kaynak UI kaynakları anlatıldı (Uiverse.io, Lucide/Tabler ikonlar, unDraw, Pico.css, Animate.css; lisans: MIT/CC0 serbest, "ücretsiz" ≠ açık kaynak).

## Açık İşler / Sıradaki Adımlar
0. **AdSense için kalanlar (sırayla):** a) Sitede özgün yazılar olmalı, en az 10-15 tane (çalışma taktikleri, sınav rehberleri). b) Alan adı alınacak. c) Site ücretsiz bir yere yüklenecek (Netlify/Cloudflare Pages). d) Yer tutucular değiştirilecek (ALANADI, iletişim e-postası). e) Google Search Console'a site ve sitemap eklenecek. f) AdSense başvurusu yapılacak, verilen kod tüm sayfaların `<head>` kısmına, pub kimliği `ads.txt` dosyasına yazılacak. g) AdSense panelinde AB kullanıcıları için Google'ın çerez onay mesajı (Privacy & messaging) açılacak. Not: "Reklam alanı" kutuları ve boş PDF bölümü, başvurudan önce gizlenmeli ya da doldurulmalı. Topluluğa şikâyet ve moderasyon özelliği eklenmesi önerilir (kullanıcı içerikli siteler için AdSense kuralı).
1. **Kasım 2026:** ÖSYM 2027 takvimi açıklanınca `sinavlar.js` güncellenecek.
2. **ŞU AN:** Supabase kurulumu ve izinler tamam. Sırada `topluluk.html` üzerinden gerçek kayıt + e-posta onayı + mesaj gönderme testi var. İleride eklenebilecekler: spam sınırı, moderatör/yönetici, profil fotoğrafı.
3. **Faz 3, Yayına alma ve reklam:** alan adı (.com veya .com.tr) alınacak, ücretsiz hosting (Netlify, Cloudflare Pages ya da GitHub Pages) kullanılacak, Gizlilik Politikası ve Hakkımızda sayfaları eklenecek, sonra Google AdSense başvurusu yapılacak.
4. **İleride veritabanı geçişi:** Supabase'den MSSQL ya da MySQL'e geçilecek (hangisi olacağı henüz belli değil). Geçiş sırasında şunlar da değişecek: Supabase'in hazır üyelik sistemi (Auth), canlı sohbet (Realtime) ve güvenlik kuralları (RLS). Bu yüzden ayrıca bir sunucu (backend) yazmak gerekecek. `topluluk.js` yeniden düzenlenecek.
5. **İçerik:** AdSense'in onaylaması için siteye özgün yazılar eklenmeli (çalışma taktikleri, sınav bilgileri vb.).
7. **Puan hesaplayıcı:** Her yıl ÖSYM sonuçları açıklanınca `puan-verileri.js` güncellenecek (KPSS ortalama/standart sapma). Ortaöğretim ve önlisans için güncel veri eksik.
6. **PDF uyarısı:** başkalarının telifli PDF'leri (yayınevi kitapları vb.) siteye yüklenmeyecek. Yalnızca kendi hazırladıklarımız ve resmi linkler kullanılacak.
