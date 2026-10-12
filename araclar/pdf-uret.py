# =====================================================================
#  SINAV BULUTU PDF ÜRETİCİ
#  Çalıştırmak için:  python araclar/pdf-uret.py
#
#  Her PDF önce HTML olarak hazırlanır, sonra Microsoft Edge ile A4 PDF'e
#  çevrilir. Konu listeleri ve sınav bilgileri aşağıdaki sözlüklerde.
#
#  ÇIKTILAR:
#   - pdfler/  -> ÜCRETSİZ PDF'ler (sitede herkes indirir)
#   - satis/   -> ÜCRETLİ PDF'ler (GitHub'a ve siteye YÜKLENMEZ, .gitignore'da)
# =====================================================================
import html
import pathlib
import subprocess
import sys

KOK = pathlib.Path(__file__).resolve().parent.parent
GECICI = KOK / "araclar" / "_html"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
SITE = "Sınav Bulutu"

# ----------------------------------------------------------------- konular
TYT = {
    "Türkçe (40 soru)": [
        "Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Paragrafta Yapı", "Ses Bilgisi",
        "Yazım Kuralları", "Noktalama İşaretleri", "Sözcükte Yapı (Kök, Ek)", "İsim ve Zamir",
        "Sıfat ve Zarf", "Edat, Bağlaç, Ünlem", "Fiiller (Kip, Kişi, Ek Fiil)", "Fiilimsiler",
        "Fiilde Çatı", "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozuklukları",
    ],
    "Matematik (40 soru)": [
        "Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "EBOB - EKOK",
        "Rasyonel Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar",
        "Çarpanlara Ayırma", "Oran - Orantı", "Denklem Çözme", "Sayı ve Kesir Problemleri",
        "Yaş Problemleri", "Yüzde, Kâr - Zarar Problemleri", "Karışım Problemleri",
        "Hareket Problemleri", "İşçi - Havuz Problemleri", "Tablo ve Grafik Problemleri",
        "Kümeler", "Mantık", "Fonksiyonlar", "Polinomlar", "2. Dereceden Denklemler",
        "Permütasyon - Kombinasyon", "Olasılık", "Veri ve İstatistik",
    ],
    "Geometri": [
        "Doğruda ve Üçgende Açılar", "Dik ve Özel Üçgenler", "Açıortay ve Kenarortay",
        "Üçgende Alan", "Üçgende Benzerlik", "Çokgenler", "Dörtgenler",
        "Paralelkenar, Eşkenar Dörtgen", "Dikdörtgen, Kare, Yamuk", "Çember ve Daire",
        "Analitik Geometri (Nokta, Doğru)", "Katı Cisimler",
    ],
    "Fizik (7 soru)": [
        "Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "İş, Güç, Enerji",
        "Isı, Sıcaklık ve Genleşme", "Elektrostatik", "Elektrik Akımı ve Devreler", "Manyetizma",
        "Basınç", "Kaldırma Kuvveti", "Dalgalar", "Optik",
    ],
    "Kimya (7 soru)": [
        "Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler",
        "Maddenin Halleri", "Kimyanın Temel Kanunları", "Mol Kavramı", "Kimyasal Tepkimeler",
        "Karışımlar", "Asitler, Bazlar ve Tuzlar", "Kimya Her Yerde",
    ],
    "Biyoloji (6 soru)": [
        "Canlıların Ortak Özellikleri", "Canlıların Temel Bileşenleri", "Hücre ve Organeller",
        "Canlıların Sınıflandırılması", "Hücre Bölünmeleri", "Kalıtım", "Ekosistem Ekolojisi",
        "Güncel Çevre Sorunları",
    ],
    "Tarih (5 soru)": [
        "Tarih ve Zaman", "İlk Çağ Uygarlıkları", "İlk Türk Devletleri", "İslam Tarihi",
        "Türk - İslam Devletleri", "Osmanlı Kuruluş ve Yükselme", "Osmanlı Duraklama ve Gerileme",
        "20. Yüzyıl Başlarında Osmanlı", "Millî Mücadele", "Atatürk İlke ve İnkılapları",
    ],
    "Coğrafya (5 soru)": [
        "Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Harita Bilgisi", "İklim Bilgisi",
        "Yer Şekilleri", "Nüfus ve Yerleşme", "Ekonomik Faaliyetler", "Bölgeler",
        "Doğal Afetler",
    ],
    "Felsefe (5 soru)": [
        "Felsefeye Giriş", "Bilgi Felsefesi", "Varlık Felsefesi", "Ahlak Felsefesi",
        "Sanat Felsefesi", "Din Felsefesi", "Siyaset Felsefesi", "Bilim Felsefesi",
    ],
    "Din Kültürü (5 soru)": [
        "Bilgi ve İnanç", "İslam ve İbadet", "Ahlak ve Değerler", "Hz. Muhammed'in Hayatı",
        "Vahiy ve Akıl", "İslam Düşüncesinde Yorumlar",
    ],
}

AYT = {
    "Matematik (30 soru)": [
        "Fonksiyonlar (İleri)", "Polinomlar", "2. Derece Denklem ve Eşitsizlikler", "Parabol",
        "Trigonometri", "Üstel ve Logaritmik Fonksiyonlar", "Diziler", "Limit ve Süreklilik",
        "Türev", "Türev Uygulamaları", "İntegral", "Permütasyon, Kombinasyon, Binom", "Olasılık",
    ],
    "Geometri (10 soru)": [
        "Üçgenler (Tekrar)", "Çokgenler ve Dörtgenler", "Çember ve Daire",
        "Analitik Geometri (Doğru)", "Çemberin Analitik İncelenmesi", "Dönüşüm Geometrisi",
        "Katı Cisimler",
    ],
    "Fizik (14 soru)": [
        "Vektörler", "Kuvvet, Tork ve Denge", "Kütle Merkezi", "Basit Makineler",
        "Newton'un Hareket Yasaları", "Atışlar", "İş, Güç, Enerji", "İtme ve Momentum",
        "Elektrik Alan ve Potansiyel", "Kondansatörler", "Manyetizma ve İndüksiyon",
        "Alternatif Akım ve Transformatörler", "Çembersel Hareket", "Basit Harmonik Hareket",
        "Dalga Mekaniği", "Atom Fiziği ve Radyoaktivite", "Modern Fizik ve Uygulamaları",
    ],
    "Kimya (13 soru)": [
        "Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler ve Çözünürlük",
        "Tepkimelerde Enerji", "Tepkime Hızları", "Kimyasal Denge", "Asit - Baz Dengesi",
        "Çözünürlük Dengesi", "Kimya ve Elektrik", "Karbon Kimyasına Giriş",
        "Organik Bileşikler", "Enerji Kaynakları ve Bilimsel Gelişmeler",
    ],
    "Biyoloji (13 soru)": [
        "Sinir Sistemi", "Endokrin Sistem", "Duyu Organları", "Destek ve Hareket Sistemi",
        "Sindirim Sistemi", "Dolaşım ve Bağışıklık", "Solunum Sistemi", "Boşaltım Sistemi",
        "Üreme Sistemi ve Gelişim", "Komünite ve Popülasyon Ekolojisi", "Genden Proteine",
        "Canlılarda Enerji Dönüşümleri", "Bitki Biyolojisi", "Canlılar ve Çevre",
    ],
    "Türk Dili ve Edebiyatı (24 soru)": [
        "Anlam Bilgisi (Tekrar)", "Şiir Bilgisi (Nazım, Ölçü, Uyak)", "Söz Sanatları",
        "Edebi Türler", "İslamiyet Öncesi ve Geçiş Dönemi", "Halk Edebiyatı", "Divan Edebiyatı",
        "Tanzimat Edebiyatı", "Servet-i Fünun ve Fecr-i Âti", "Millî Edebiyat",
        "Cumhuriyet Dönemi Şiiri", "Cumhuriyet Dönemi Roman ve Hikâye", "Tiyatro",
        "Edebi Akımlar", "Dünya Edebiyatı",
    ],
    "Tarih (Tarih-1 + Tarih-2)": [
        "Tarih Bilimi ve İlk Uygarlıklar", "İlk ve Orta Çağlarda Türk Dünyası",
        "İslam Medeniyetinin Doğuşu", "Türklerin İslamiyet'i Kabulü", "Beylikten Devlete Osmanlı",
        "Dünya Gücü Osmanlı", "Arayış Yılları", "Avrupa ve Osmanlı (18. yy)",
        "En Uzun Yüzyıl (19. yy)", "20. Yüzyıl Başlarında Osmanlı", "Millî Mücadele",
        "Atatürkçülük ve İnkılaplar", "İki Savaş Arası Dünya", "II. Dünya Savaşı",
        "Soğuk Savaş Dönemi", "Yumuşama ve Küreselleşen Dünya",
    ],
    "Coğrafya (Coğrafya-1 + Coğrafya-2)": [
        "Ekosistem ve Madde Döngüleri", "Nüfus Politikaları", "Şehirleşme ve Göç",
        "Ekonomik Faaliyetler ve Doğal Kaynaklar", "Türkiye'de Tarım ve Hayvancılık",
        "Türkiye'de Sanayi, Enerji, Madenler", "Ulaşım, Ticaret, Turizm", "Bölgeler ve Ülkeler",
        "Küresel Ortam ve Uluslararası Örgütler", "Çevre ve Toplum",
    ],
    "Felsefe Grubu ve Din (SÖZ)": [
        "Psikoloji", "Sosyoloji", "Mantık", "Felsefe Tarihi (MÖ 6. yy - 20. yy)",
        "Din Kültürü (AYT konuları)",
    ],
}

KPSS = {
    "Türkçe (GY, 30 soru)": [
        "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Yazım Kuralları",
        "Noktalama İşaretleri", "Sözcük Yapısı", "Sözcük Türleri", "Fiiller ve Fiilimsiler",
        "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozuklukları", "Sözel Mantık",
    ],
    "Matematik (GY, 30 soru)": [
        "Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "EBOB - EKOK",
        "Rasyonel ve Ondalık Sayılar", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma",
        "Oran - Orantı", "Denklemler ve Eşitsizlikler", "Mutlak Değer", "Sayı - Kesir Problemleri",
        "Yaş, İşçi, Hareket Problemleri", "Yüzde, Kâr - Zarar, Faiz", "Kümeler", "Fonksiyon ve İşlem",
        "Permütasyon, Kombinasyon, Olasılık", "Tablo ve Grafik Yorumlama", "Sayısal Mantık",
        "Geometri (Açı, Üçgen, Dörtgen, Çember)",
    ],
    "Tarih (GK, 27 soru)": [
        "İslamiyet Öncesi Türk Tarihi", "İlk Türk - İslam Devletleri", "Osmanlı Siyasi Tarihi",
        "Osmanlı Kültür ve Medeniyeti", "20. Yüzyıl Başlarında Osmanlı",
        "Kurtuluş Savaşı Hazırlık Dönemi", "Kurtuluş Savaşı Muharebeleri",
        "Atatürk İlke ve İnkılapları", "Atatürk Dönemi Dış Politika", "Çağdaş Türk ve Dünya Tarihi",
    ],
    "Coğrafya (GK, 18 soru)": [
        "Türkiye'nin Coğrafi Konumu", "Yer Şekilleri", "İklim ve Bitki Örtüsü",
        "Nüfus ve Yerleşme", "Tarım", "Hayvancılık", "Madenler ve Enerji Kaynakları", "Sanayi",
        "Ulaşım, Ticaret, Turizm", "Bölgesel Coğrafya",
    ],
    "Vatandaşlık (GK, 9 soru)": [
        "Hukukun Temel Kavramları", "Devlet Biçimleri ve Demokrasi", "Türk Anayasa Tarihi",
        "1982 Anayasası Temel İlkeler", "Temel Hak ve Ödevler", "Yasama", "Yürütme", "Yargı",
        "İdare Hukuku",
    ],
    "Güncel Bilgiler (GK, 6 soru)": [
        "Türkiye ve dünyadaki güncel gelişmeler", "Uluslararası kuruluşlar",
        "Kültür, sanat, spor gündemi", "Bilim ve teknoloji gelişmeleri",
    ],
}

# Deneme tablolarının sütunları: (kısa ad, soru sayısı)
DENEME = {
    "TYT": [("Türkçe", 40), ("Sosyal", 20), ("Mat", 40), ("Fen", 20)],
    "AYT (SAY)": [("Mat", 40), ("Fizik", 14), ("Kimya", 13), ("Biyo", 13)],
    "AYT (EA)": [("Mat", 40), ("Edebiyat", 24), ("Tarih-1", 10), ("Coğ-1", 6)],
    "AYT (SÖZ)": [("Edeb.+Sos-1", 40), ("Sosyal-2", 40)],
    "KPSS GY-GK": [("Türkçe", 30), ("Mat", 30), ("Tarih", 27), ("Coğ", 18), ("Vat.", 9), ("Güncel", 6)],
    "LGS": [("Türkçe", 20), ("Mat", 20), ("Fen", 20), ("İnkılap", 10), ("Din", 10), ("İng.", 10)],
}

# ----------------------------------------------------------------- stil
CSS = """
@page { size: A4; margin: 14mm 13mm 16mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Segoe UI", "Nunito", Arial, sans-serif; color: #16324f; font-size: 10.5pt; }
.sayfa { page-break-after: always; }
.sayfa:last-child { page-break-after: auto; }
h1 { font-size: 22pt; font-weight: 900; }
h2 { font-size: 15pt; font-weight: 900; margin-bottom: 3mm; color: #16324f; }
h3 { font-size: 11pt; font-weight: 800; margin: 3mm 0 1.5mm; color: #2a7fd4; }
p { line-height: 1.5; margin-bottom: 2mm; }
.ust { display: flex; justify-content: space-between; align-items: center;
       border-bottom: 2px solid #5eb4f5; padding-bottom: 2mm; margin-bottom: 5mm; }
.ust .marka { font-weight: 900; color: #2a7fd4; }
.ust .bolum { font-size: 9pt; color: #4a6680; }
.alt { margin-top: 5mm; padding-top: 2mm; border-top: 1px solid #d7e8f6; text-align: center;
       font-size: 7.5pt; color: #7b93a8; break-before: avoid; }
.kapak { display: flex; flex-direction: column; justify-content: center; align-items: center;
         text-align: center; height: 262mm;
         background: linear-gradient(180deg, #5eb4f5 0%, #cdeafd 70%, #ffffff 100%);
         border-radius: 8mm; padding: 20mm; }
.kapak .bulut { font-size: 54pt; }
.kapak h1 { font-size: 30pt; margin: 4mm 0; color: #fff; text-shadow: 0 2px 6px rgba(20,60,110,.35); }
.kapak .alt-baslik { font-size: 14pt; font-weight: 700; color: #16324f; }
.kapak .rozet { margin-top: 10mm; display: inline-block; background: #ff8a3d; color: #fff;
                padding: 2mm 6mm; border-radius: 99px; font-weight: 800; }
.kapak .icerik { margin-top: 12mm; text-align: left; background: rgba(255,255,255,.75);
                 border-radius: 5mm; padding: 6mm 9mm; font-size: 10.5pt; line-height: 1.7; }
.kapak .isim { margin-top: 10mm; font-size: 11pt; }
.kapak .isim span { display: inline-block; width: 70mm; border-bottom: 1.5px solid #16324f; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #b9d6ee; padding: 1.6mm 2mm; text-align: left; vertical-align: top; }
th { background: #e8f4fe; font-size: 9pt; font-weight: 800; }
td { font-size: 9.5pt; }
.ortala td, .ortala th { text-align: center; }
.kutucuk { display: inline-block; width: 4mm; height: 4mm; border: 1.3px solid #2a7fd4; border-radius: 1mm; }
.konu td.k { text-align: center; width: 15mm; }
.konu td { padding: 1.1mm 2mm; }
.konu tr { break-inside: avoid; }
h3 { break-after: avoid; }
thead { display: table-header-group; }
.konu td:first-child { width: auto; }
.iki { columns: 2; column-gap: 7mm; }
.iki > div { break-inside: avoid; }
.ipucu { background: #fff4ec; border-left: 4px solid #ff8a3d; padding: 3mm 4mm; border-radius: 2mm;
         margin: 3mm 0; font-size: 9.5pt; }
.ipucu b { color: #d96a1c; }
.evre { border: 1.5px solid #b9d6ee; border-radius: 3mm; padding: 3mm 4mm; margin-bottom: 3mm;
        break-inside: avoid; }
.evre .baslik { display: flex; justify-content: space-between; font-weight: 900; color: #2a7fd4; }
.evre .tarih { background: #2a7fd4; color: #fff; padding: .5mm 3mm; border-radius: 99px; font-size: 8.5pt; }
.evre ul { margin: 1.5mm 0 0 5mm; line-height: 1.55; }
.planlayici td { height: 19mm; }
.planlayici th:first-child, .planlayici td:first-child { width: 18mm; font-weight: 800; background: #f4faff; }
.gunluk td { height: 9mm; }
.cizgi { border-bottom: 1px solid #b9d6ee; height: 8mm; }
.deneme td { height: 7.4mm; font-size: 8.5pt; }
.deneme th { font-size: 8pt; text-align: center; }
.grafik { display: grid; grid-template-columns: 10mm repeat(20, 1fr); gap: 0; margin-top: 2mm; }
.grafik div { border: .5px solid #d7e8f6; height: 5mm; font-size: 6.5pt; color: #7b93a8; }
.grafik .e { border: none; text-align: right; padding-right: 1mm; }
.hedef td { height: 11mm; }
"""


def e(t):
    return html.escape(t)


def ust(bolum):
    return f'<div class="ust"><span class="marka">☁️ {SITE}</span><span class="bolum">{e(bolum)}</span></div>'


def alt(lisans):
    return f'<div class="alt">{e(lisans)}</div>'


def sayfa(bolum, govde, lisans):
    return f'<section class="sayfa">{ust(bolum)}{govde}{alt(lisans)}</section>'


def kapak(baslik, alt_baslik, rozet, icerik):
    maddeler = "".join(f"<div>✔ {e(m)}</div>" for m in icerik)
    return f'''<section class="sayfa"><div class="kapak">
      <div class="bulut">☁️</div>
      <h1>{e(baslik)}</h1>
      <div class="alt-baslik">{e(alt_baslik)}</div>
      <div class="rozet">{e(rozet)}</div>
      <div class="icerik">{maddeler}</div>
      <div class="isim">Ad Soyad: <span></span></div>
      <div class="isim">Hedefim: <span></span></div>
    </div></section>'''


def konu_tablosu(dersler):
    parcalar = []
    for ders, konular in dersler.items():
        satirlar = "".join(
            f'<tr><td>{e(k)}</td>' + '<td class="k"><span class="kutucuk"></span></td>' * 4 + "</tr>"
            for k in konular
        )
        parcalar.append(f'''<div><h3>{e(ders)}</h3><table class="konu">
          <thead><tr><th>Konu</th><th>Anlatım</th><th>Soru</th><th>Tekrar 1</th><th>Tekrar 2</th></tr></thead>
          {satirlar}</table></div>''')
    return parcalar


def konu_sayfalari(baslik, dersler, lisans, _eski=None):
    # Tablolar sayfaya sığmazsa kendiliğinden sonraki sayfaya geçer, başlık satırı tekrar eder.
    aciklama = ('<p>Her konuyu dört adımda bitir: <b>Anlatım</b>ı çalış, en az 100 <b>Soru</b> çöz, '
                'bir hafta sonra <b>Tekrar 1</b>, bir ay sonra <b>Tekrar 2</b> yap. Biten kutuyu doldur.</p>')
    return [sayfa(baslik, f"<h2>{e(baslik)}</h2>{aciklama}" + "".join(konu_tablosu(dersler)), lisans)]


def evreler(liste):
    out = ""
    for ad, tarih, maddeler in liste:
        li = "".join(f"<li>{m}</li>" for m in maddeler)
        out += f'<div class="evre"><div class="baslik"><span>{ad}</span><span class="tarih">{e(tarih)}</span></div><ul>{li}</ul></div>'
    return out


def haftalik_planlayici(lisans, bolum):
    gunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    bloklar = ["1. Blok", "2. Blok", "3. Blok", "4. Blok", "Soru / Deneme", "Tekrar"]
    bas = "".join(f"<th>{g}</th>" for g in gunler)
    satirlar = "".join(f"<tr><td>{b}</td>" + "<td></td>" * 7 + "</tr>" for b in bloklar)
    govde = f'''<h2>Haftalık Planlayıcı</h2>
      <p>Hafta: ______ / ______ &nbsp;&nbsp; Bu haftanın hedefi: ______________________________________</p>
      <table class="planlayici"><tr><th></th>{bas}</tr>{satirlar}
      <tr><td>Soru sayısı</td>{"<td></td>" * 7}</tr>
      <tr><td>Çalışma süresi</td>{"<td></td>" * 7}</tr></table>
      <h3>Hafta sonu değerlendirmesi</h3>
      <div class="cizgi"></div><div class="cizgi"></div><div class="cizgi"></div>
      <p style="font-size:8.5pt;color:#7b93a8;margin-top:2mm">Bu sayfayı her hafta için çoğaltıp kullanabilirsin.</p>'''
    return sayfa(bolum, govde, lisans)


def gunluk_plan(lisans, bolum):
    satirlar = "".join(
        f"<tr><td>{s}</td><td></td><td></td><td></td><td class='k'><span class='kutucuk'></span></td></tr>"
        for s in ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00",
                  "19:00", "20:00", "21:00", "22:00"]
    )
    govde = f'''<h2>Günlük Plan</h2>
      <p>Tarih: ____ / ____ / ________ &nbsp;&nbsp;&nbsp; Bugünün en önemli 3 işi:</p>
      <table><tr><td>1.</td><td>2.</td><td>3.</td></tr></table>
      <h3>Saat saat</h3>
      <table class="gunluk konu"><tr><th style="width:16mm">Saat</th><th>Ders / Konu</th><th style="width:28mm">Kaynak</th>
      <th style="width:22mm">Soru (D/Y)</th><th style="width:13mm">Bitti</th></tr>{satirlar}</table>
      <div class="ipucu"><b>Pomodoro:</b> 40 dakika çalış, 10 dakika mola ver. Mola sırasında telefona bakma; kalk, su iç, biraz yürü.</div>
      <h3>Gün sonu notu (yanlışlarım, yarına kalanlar)</h3>
      <div class="cizgi"></div><div class="cizgi"></div><div class="cizgi"></div>'''
    return sayfa(bolum, govde, lisans)


def deneme_sayfasi(sinav, lisans, bolum, satir=20):
    dersler = DENEME[sinav]
    bas = "".join(f"<th>{e(d)}<br><small>{s} soru</small></th>" for d, s in dersler)
    hucre = "<td></td>" * (len(dersler) + 4)
    satirlar = "".join(f"<tr><td>{i}</td>{hucre}</tr>" for i in range(1, satir + 1))
    toplam = sum(s for _, s in dersler)
    grafik = ""
    for adim in range(10, 0, -1):
        grafik += f'<div class="e">{round(toplam * adim / 10)}</div>' + "<div></div>" * 20
    govde = f'''<h2>{e(sinav)} Deneme Takip Çizelgesi</h2>
      <p>Her kutuya o dersin <b>netini</b> yaz (net = doğru − yanlış ÷ 4). Toplam {toplam} soru.</p>
      <table class="deneme ortala"><tr><th>#</th><th>Tarih</th><th>Yayın</th>{bas}<th>Toplam net</th><th>En çok yanlış</th></tr>{satirlar}</table>
      <h3>Net grafiğin: her denemeden sonra toplam netini işaretle</h3>
      <div class="grafik">{grafik}</div>'''
    return sayfa(bolum, govde, lisans)


def hedef_sayfasi(lisans, bolum, dersler):
    satirlar = "".join(f"<tr><td>{e(d)}</td><td></td><td></td><td></td></tr>" for d in dersler)
    govde = f'''<h2>Hedef Kartım</h2>
      <p>Hedefini somut yaz. "İyi bir yer" değil, "X Üniversitesi Y bölümü, Z puan" gibi.</p>
      <table class="hedef"><tr><td style="width:45mm"><b>Hedef okul / kadro</b></td><td></td></tr>
      <tr><td><b>Geçen yılın puanı / sırası</b></td><td></td></tr>
      <tr><td><b>Neden istiyorum?</b></td><td></td></tr></table>
      <h3>Ders ders net hedeflerim</h3>
      <table class="hedef ortala"><tr><th>Ders</th><th>Şu anki netim</th><th>Ara hedef</th><th>Sınav hedefi</th></tr>{satirlar}</table>
      <div class="ipucu"><b>İpucu:</b> Gereken neti bulmak için sitemizdeki puan hesaplayıcıyı kullan. Netlerini her ay güncelle.</div>'''
    return sayfa(bolum, govde, lisans)


def belge(baslik, sayfalar):
    return (f'<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>{e(baslik)}</title>'
            f'<style>{CSS}</style></head><body>{"".join(sayfalar)}</body></html>')


# ----------------------------------------------------------------- ürünler
UCRETLI = "© 2026 Sınav Bulutu · Kişisel kullanım içindir, çoğaltılıp satılamaz ve paylaşılamaz."
UCRETSIZ = "© 2026 Sınav Bulutu · Ücretsizdir, kişisel kullanım için çoğaltabilirsin. Daha fazlası sitemizde."


def yks():
    b = "YKS 2027 Çalışma Programı"
    s = [kapak("YKS 2027", "TYT + AYT Çalışma Programı ve Takip Seti", "Ekim 2026 → Haziran 2027",
               ["4 evreli 35 haftalık yol haritası", "SAY, EA ve SÖZ için örnek haftalık programlar",
                "TYT ve AYT konu takip listeleri (230+ konu)", "Haftalık planlayıcı ve günlük plan sayfaları",
                "TYT ve AYT deneme takip çizelgeleri + net grafiği", "Hedef kartı"])]
    s.append(sayfa(b, '''<h2>Bu seti nasıl kullanacaksın?</h2>
      <p>Bu set, YKS'ye kalan yaklaşık <b>35 haftayı</b> dört evreye bölüyor. Her evrenin bir amacı var. Önce
      aşağıdaki yol haritasını oku, sonra kendi alanına (SAY, EA, SÖZ) uygun örnek haftalık programı seç ve
      Haftalık Planlayıcı sayfasına uyarla.</p>
      <div class="ipucu"><b>Altın kural:</b> Program, uyduğun sürece işe yarar. İlk hafta hedefleri küçük tut;
      bir hafta boyunca planına %80 uyabiliyorsan yükü artır.</div>''' + evreler([
        ("1. Evre · Temel", "Ekim – Aralık (11 hafta)", [
            "TYT Türkçe, Matematik ve Geometri'nin <b>temel konularını</b> bitir (Konu takip listesinde ilk yarı).",
            "AYT'de alanının en uzun konularına başla: SAY için Fonksiyonlar ve Fizik mekanik, EA için Edebiyat şiir bilgisi.",
            "Her gün en az <b>40 paragraf</b> ve <b>30 problem</b> sorusu. Bunlar her alanda puan getirir.",
            "Ayda 2 TYT denemesi: amaç puan değil, eksiklerini görmek."]),
        ("2. Evre · Yoğunlaşma", "Ocak – Mart (13 hafta)", [
            "AYT konularının büyük kısmını bitir. Sömestr tatilini en zor konulara ayır (Türev, İntegral, Kimyasal Denge, Divan Edebiyatı...).",
            "TYT'de kalan konuları kapat, sosyal ve fen için kısa özet çalış.",
            "<b>Haftada 1 TYT + 1 AYT</b> denemesi. Her denemeden sonra yanlışlarını konu bazında listele.",
            "Mart sonunda TYT konularının tamamı, AYT konularının %80'i bitmiş olmalı."]),
        ("3. Evre · Eksik Kapatma", "Nisan – Mayıs (8 hafta)", [
            "Yeni konu yok denecek kadar az. Deneme analizinde sürekli yanlış çıkan konulara dön.",
            "<b>Haftada 2 TYT + 1-2 AYT</b> denemesi. Sınav saatlerinde (10:15) çözmeye alış.",
            "ÖSYM çıkmış sorularını süre tutarak çöz. Soru tarzını en iyi bunlar gösterir.",
            "Tekrar 2 kutucuklarını doldur: her konu en az iki kez tekrar edilmiş olsun."]),
        ("4. Evre · Son Düzlük", "Haziran (3 hafta)", [
            "Her gün bir deneme, ardından mutlaka analiz. Uyku düzenini sınav saatine göre ayarla.",
            "Yeni kaynak alma. Kendi notlarını, yanlış defterini ve formül listeni tekrar et.",
            "Son 2 gün hafif tekrar, bol dinlenme. Sınav sabahı ÖSYM'nin izinli eşya listesine göz at."]),
    ]), UCRETLI))
    ornek = {
        "SAY": [("Pzt", "TYT Mat", "AYT Mat", "Fizik", "40 paragraf"), ("Sal", "TYT Mat", "Kimya", "Biyoloji", "30 problem"),
                ("Çar", "Türkçe", "AYT Mat", "Fizik", "Geometri"), ("Per", "TYT Mat", "Kimya", "AYT Mat", "40 paragraf"),
                ("Cum", "Türkçe", "Biyoloji", "Geometri", "Sosyal özet"), ("Cmt", "TYT DENEMESİ", "Deneme analizi", "Eksik konu", "—"),
                ("Paz", "AYT DENEMESİ", "Deneme analizi", "Haftalık tekrar", "Dinlen")],
        "EA": [("Pzt", "TYT Mat", "AYT Mat", "Edebiyat", "40 paragraf"), ("Sal", "Türkçe", "Tarih", "AYT Mat", "30 problem"),
               ("Çar", "TYT Mat", "Edebiyat", "Coğrafya", "Geometri"), ("Per", "Türkçe", "AYT Mat", "Tarih", "40 paragraf"),
               ("Cum", "TYT Mat", "Edebiyat", "Geometri", "Fen özet"), ("Cmt", "TYT DENEMESİ", "Deneme analizi", "Eksik konu", "—"),
               ("Paz", "AYT DENEMESİ", "Deneme analizi", "Haftalık tekrar", "Dinlen")],
        "SÖZ": [("Pzt", "Türkçe", "Edebiyat", "Tarih", "40 paragraf"), ("Sal", "TYT Mat", "Coğrafya", "Felsefe grubu", "Edebiyat"),
                ("Çar", "Türkçe", "Tarih", "Edebiyat", "30 problem"), ("Per", "TYT Mat", "Coğrafya", "Din Kültürü", "40 paragraf"),
                ("Cum", "Türkçe", "Felsefe grubu", "Tarih", "Fen özet"), ("Cmt", "TYT DENEMESİ", "Deneme analizi", "Eksik konu", "—"),
                ("Paz", "AYT DENEMESİ", "Deneme analizi", "Haftalık tekrar", "Dinlen")],
    }
    govde = '<h2>Örnek Haftalık Programlar</h2><p>Her blok yaklaşık 80-90 dakikadır (2 pomodoro). Okul günlerinde 2-3 blok, hafta sonu ve tatilde 4 blok hedefle. 1. Evrede AYT bloklarının bir kısmını TYT\'ye ayırabilirsin.</p>'
    for alan, gunler in ornek.items():
        satir = "".join("<tr>" + "".join(f"<td>{e(h)}</td>" for h in g) + "</tr>" for g in gunler)
        govde += f'<h3>{alan} öğrencisi</h3><table><tr><th>Gün</th><th>1. Blok</th><th>2. Blok</th><th>3. Blok</th><th>4. Blok</th></tr>{satir}</table>'
    s.append(sayfa(b, govde, UCRETLI))
    s.append(hedef_sayfasi(UCRETLI, b, ["TYT Türkçe", "TYT Sosyal", "TYT Matematik", "TYT Fen", "AYT ders 1", "AYT ders 2", "AYT ders 3", "AYT ders 4"]))
    s += konu_sayfalari("TYT Konu Takip Listesi", TYT, UCRETLI, 3)
    s += konu_sayfalari("AYT Konu Takip Listesi", AYT, UCRETLI, 3)
    s.append(haftalik_planlayici(UCRETLI, b))
    s.append(gunluk_plan(UCRETLI, b))
    s.append(deneme_sayfasi("TYT", UCRETLI, b))
    s.append(deneme_sayfasi("AYT (SAY)", UCRETLI, b))
    s.append(deneme_sayfasi("AYT (EA)", UCRETLI, b))
    s.append(deneme_sayfasi("AYT (SÖZ)", UCRETLI, b))
    return "satis/sinav-bulutu-yks-2027-calisma-programi.pdf", belge(b, s)


def kpss():
    b = "KPSS Genel Yetenek - Genel Kültür Çalışma Programı"
    s = [kapak("KPSS GY - GK", "Çalışma Programı ve Takip Seti", "Lisans · Ön Lisans · Ortaöğretim",
               ["12 aylık 4 evreli yol haritası", "Çalışan ve çalışmayan aday için örnek haftalık programlar",
                "GY - GK konu takip listesi (60+ konu)", "Haftalık planlayıcı ve günlük plan sayfaları",
                "KPSS deneme takip çizelgesi + net grafiği", "Hedef kartı"])]
    s.append(sayfa(b, '''<h2>Bu seti nasıl kullanacaksın?</h2>
      <p>KPSS Genel Yetenek (Türkçe, Matematik) ve Genel Kültür (Tarih, Coğrafya, Vatandaşlık, Güncel) testlerinden
      oluşur. Bu set yaklaşık <b>12 aylık</b> bir hazırlık için tasarlandı. Sınavına daha az süre kaldıysa evreleri
      orantılı olarak kısalt.</p>
      <div class="ipucu"><b>Bilmen gereken:</b> Genel Kültür'de en çok soru Tarih'ten (27) gelir. Genel Yetenek'te ise
      paragraf ve problemler puanını en çok etkileyen konulardır. Programı buna göre ağırlıklandırdık.</div>''' + evreler([
        ("1. Evre · Temel", "1. – 3. ay", [
            "Matematik temel kavramlardan problemlere kadar. Her gün en az 30 matematik sorusu.",
            "Türkçe dil bilgisi konuları ve her gün <b>30 paragraf</b>.",
            "Tarih: İslamiyet öncesinden Osmanlı'ya kadar. Kronolojik çalış, zaman çizelgesi çıkar.",
            "Ayda 1 deneme: başlangıç netini öğrenmek için."]),
        ("2. Evre · Genel Kültür", "4. – 7. ay", [
            "Tarih'in kalanı (Kurtuluş Savaşı, İnkılaplar, Çağdaş Tarih) ve Coğrafya'nın tamamı.",
            "Vatandaşlık: Anayasa'yı madde madde değil, kurumlar üzerinden çalış (Yasama, Yürütme, Yargı).",
            "Matematik'te sayısal mantık ve geometri. Paragraf her gün devam.",
            "<b>2 haftada 1</b> deneme ve detaylı yanlış analizi."]),
        ("3. Evre · Pekiştirme", "8. – 10. ay", [
            "Konu takip listesinde Tekrar 1 ve Tekrar 2 kutucuklarını doldur.",
            "ÖSYM çıkmış sorularını yıllara göre süre tutarak çöz.",
            "Güncel bilgiler için haftada 1 saat ayır, notlarını tek sayfada topla.",
            "<b>Haftada 1</b> deneme."]),
        ("4. Evre · Deneme Dönemi", "Son 2 ay", [
            "Haftada 2-3 deneme, her denemeden sonra analiz.",
            "Sınav saatinde (genelde 10:15) çöz. GY ve GK oturum düzenine alış.",
            "Son hafta yeni konu yok; yanlış defteri ve özetler."]),
    ]), UCRETLI))
    calisan = [("Pzt", "30 paragraf", "Tarih (1 saat)"), ("Sal", "Matematik (1 saat)", "Coğrafya (1 saat)"),
               ("Çar", "30 paragraf", "Tarih (1 saat)"), ("Per", "Matematik (1 saat)", "Vatandaşlık (45 dk)"),
               ("Cum", "Dil bilgisi (45 dk)", "Haftalık tekrar"), ("Cmt", "Matematik + Tarih (4 saat)", "Coğrafya (2 saat)"),
               ("Paz", "DENEME + analiz", "Güncel bilgiler")]
    tam = [("Pzt", "Matematik", "Tarih", "Paragraf", "Tekrar"), ("Sal", "Türkçe", "Coğrafya", "Matematik", "Soru"),
           ("Çar", "Matematik", "Tarih", "Paragraf", "Tekrar"), ("Per", "Türkçe", "Vatandaşlık", "Matematik", "Soru"),
           ("Cum", "Matematik", "Tarih", "Coğrafya", "Tekrar"), ("Cmt", "DENEME", "Analiz", "Eksik konu", "—"),
           ("Paz", "Güncel", "Haftalık tekrar", "Dinlen", "—")]
    govde = '<h2>Örnek Haftalık Programlar</h2>'
    govde += '<h3>Çalışan aday (günde 2-2,5 saat, hafta sonu yoğun)</h3><table><tr><th>Gün</th><th>1. Blok</th><th>2. Blok</th></tr>' + \
        "".join("<tr>" + "".join(f"<td>{e(h)}</td>" for h in g) + "</tr>" for g in calisan) + "</table>"
    govde += '<h3>Tam zamanlı aday (günde 4 blok, her blok 80-90 dakika)</h3><table><tr><th>Gün</th><th>1. Blok</th><th>2. Blok</th><th>3. Blok</th><th>4. Blok</th></tr>' + \
        "".join("<tr>" + "".join(f"<td>{e(h)}</td>" for h in g) + "</tr>" for g in tam) + "</table>"
    govde += '<div class="ipucu"><b>İpucu:</b> Tarih ve Coğrafya\'yı aynı gün art arda koyma; sözel dersleri sayısal derslerle dönüşümlü çalışmak akılda kalıcılığı artırır.</div>'
    s.append(sayfa(b, govde, UCRETLI))
    s.append(hedef_sayfasi(UCRETLI, b, ["Türkçe", "Matematik", "Tarih", "Coğrafya", "Vatandaşlık", "Güncel"]))
    s += konu_sayfalari("KPSS Konu Takip Listesi", KPSS, UCRETLI, 3)
    s.append(haftalik_planlayici(UCRETLI, b))
    s.append(gunluk_plan(UCRETLI, b))
    s.append(deneme_sayfasi("KPSS GY-GK", UCRETLI, b, 25))
    return "satis/sinav-bulutu-kpss-calisma-programi.pdf", belge(b, s)


def lgs():
    b = "LGS Çalışma Programı"
    s = [kapak("LGS", "8. Sınıf Çalışma Programı ve Takip Seti", "Ekim → Haziran",
               ["Okulla uyumlu 4 evreli yol haritası", "Örnek haftalık program (okul günleri + hafta sonu)",
                "Ders ders soru takip tablosu", "Haftalık planlayıcı ve günlük plan sayfaları",
                "LGS deneme takip çizelgesi + net grafiği", "Hedef lise kartı"])]
    s.append(sayfa(b, '''<h2>Bu seti nasıl kullanacaksın?</h2>
      <p>LGS'de sorular 8. sınıf müfredatından gelir; bu yüzden en iyi program <b>okulu takip eden</b> programdır.
      Okulda o hafta işlenen konuyu aynı hafta evde tekrar et ve soru çöz. Bu set, okul temposuna eklenecek şekilde hazırlandı.</p>
      <div class="ipucu"><b>Veliler için:</b> Günlük 2-3 saatlik düzenli çalışma, hafta sonu yapılan 8 saatlik çalışmadan çok daha verimlidir.
      Haftalık planlayıcıyı birlikte doldurmak çocuğun sorumluluk almasını kolaylaştırır.</div>''' + evreler([
        ("1. Evre · Okulla Birlikte", "Ekim – Ocak", [
            "Okulda işlenen her konuyu aynı hafta tekrar et, konu başına en az 40 soru çöz.",
            "Her gün <b>20 paragraf</b> ve <b>15 yeni nesil matematik</b> sorusu.",
            "İngilizce kelimeleri her gün 10 dakika tekrar et.",
            "Ayda 2 deneme."]),
        ("2. Evre · Yarıyıl Tatili", "Ocak – Şubat (2 hafta)", [
            "1. dönemin tüm konularını hızlı tekrar et; deneme analizinde zayıf çıkan konulara odaklan.",
            "Günde 1 branş denemesi (sadece Matematik ya da sadece Fen)."]),
        ("3. Evre · 2. Dönem", "Şubat – Mayıs", [
            "Yeni konuları okulla birlikte çalışmaya devam et.",
            "<b>Haftada 1</b> genel deneme. Sözel ve sayısal oturumun süresine alış.",
            "MEB'in yayımladığı örnek soruları ve çıkmış LGS sorularını çöz."]),
        ("4. Evre · Son Ay", "Mayıs – Haziran", [
            "Haftada 2-3 deneme ve analiz. Yeni kaynak alma.",
            "Uyku düzenini sınav saatine göre ayarla; son iki gün hafif tekrar ve dinlenme."]),
    ]), UCRETLI))
    ornek = [("Pzt", "Okul konusu tekrarı", "Matematik (15 yeni nesil)", "20 paragraf"),
             ("Sal", "Okul konusu tekrarı", "Fen Bilimleri", "İngilizce kelime"),
             ("Çar", "Okul konusu tekrarı", "Matematik", "20 paragraf"),
             ("Per", "Okul konusu tekrarı", "İnkılap Tarihi + Din", "İngilizce"),
             ("Cum", "Hafif tekrar", "Fen Bilimleri", "Serbest"),
             ("Cmt", "DENEME", "Deneme analizi", "Eksik konu"),
             ("Paz", "Matematik + Fen soru", "Haftalık tekrar", "Dinlen")]
    satir = "".join("<tr>" + "".join(f"<td>{e(h)}</td>" for h in g) + "</tr>" for g in ornek)
    govde = f'<h2>Örnek Haftalık Program</h2><p>Okul günlerinde her blok 40-50 dakika, hafta sonu 60-80 dakika.</p><table><tr><th>Gün</th><th>1. Blok</th><th>2. Blok</th><th>3. Blok</th></tr>{satir}</table>'
    dersler = [("Türkçe", 20), ("Matematik", 20), ("Fen Bilimleri", 20), ("T.C. İnkılap Tarihi", 10), ("Din Kültürü", 10), ("İngilizce", 10)]
    ay = ["Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May"]
    govde += '<h2 style="margin-top:6mm">Aylık Soru Takip Tablosu</h2><p>Her ayın sonunda o derste çözdüğün toplam soru sayısını yaz.</p>'
    govde += '<table class="ortala hedef"><tr><th>Ders</th>' + "".join(f"<th>{a}</th>" for a in ay) + "</tr>" + \
        "".join(f"<tr><td style='text-align:left'>{d}</td>" + "<td></td>" * len(ay) + "</tr>" for d, _ in dersler) + "</table>"
    s.append(sayfa(b, govde, UCRETLI))
    s.append(hedef_sayfasi(UCRETLI, b, [d for d, _ in dersler]))
    s.append(haftalik_planlayici(UCRETLI, b))
    s.append(gunluk_plan(UCRETLI, b))
    s.append(deneme_sayfasi("LGS", UCRETLI, b, 25))
    return "satis/sinav-bulutu-lgs-calisma-programi.pdf", belge(b, s)


def ucretsiz_deneme():
    b = "Deneme Takip Çizelgeleri"
    s = [kapak("Deneme Takip", "Çizelgeleri", "ÜCRETSİZ",
               ["TYT ve AYT (SAY, EA, SÖZ) çizelgeleri", "KPSS GY-GK çizelgesi", "LGS çizelgesi",
                "Her çizelgede 20 deneme + net grafiği", "Yazdır, masana as, netlerinin yükselişini izle"])]
    s.append(sayfa(b, '''<h2>Deneme analizi nasıl yapılır?</h2>
      <p>Deneme çözmek tek başına netleri artırmaz; artıran şey <b>denemeden sonra yaptığın analizdir</b>.</p>
      <h3>Her denemeden sonra 4 adım</h3>
      <table><tr><th style="width:10mm">1</th><td><b>Netleri yaz.</b> Çizelgeye her dersin netini, en altta grafiğe toplam netini işle.</td></tr>
      <tr><th>2</th><td><b>Yanlışları ayır.</b> Bilmediğin konu mu, dikkat hatası mı, süre yetmedi mi? Üçü farklı çözüm ister.</td></tr>
      <tr><th>3</th><td><b>Konuya dön.</b> Bilmediğin konudan çıkan yanlışlar için o konudan 30-40 soru çöz.</td></tr>
      <tr><th>4</th><td><b>Yanlış defterine yaz.</b> Bir ay sonra o soruları tekrar çöz. Hâlâ yapamıyorsan konu bitmemiştir.</td></tr></table>
      <div class="ipucu"><b>Unutma:</b> Netler düz bir çizgide artmaz. Grafiğinde iniş çıkış görmen normal; önemli olan
      genel eğilimin yukarı doğru olması.</div>
      <div class="ipucu"><b>Daha fazlası:</b> Tam çalışma programı, konu takip listeleri ve günlük planlayıcı sayfaları
      Sınav Bulutu çalışma setlerinde.</div>''', UCRETSIZ))
    for sinav in DENEME:
        s.append(deneme_sayfasi(sinav, UCRETSIZ, b))
    return "pdfler/sinav-bulutu-deneme-takip-cizelgeleri.pdf", belge(b, s)


def pdf_yap(cikti, icerik):
    GECICI.mkdir(parents=True, exist_ok=True)
    hedef = KOK / cikti
    hedef.parent.mkdir(parents=True, exist_ok=True)
    kaynak = GECICI / (hedef.stem + ".html")
    kaynak.write_text(icerik, encoding="utf-8")
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={hedef}", kaynak.as_uri()], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    print("✔", cikti, f"({hedef.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    for uret in (ucretsiz_deneme, yks, kpss, lgs):
        pdf_yap(*uret())
