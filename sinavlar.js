// =====================================================================
//  SINAV TARİHLERİ — Tarihleri değiştirmek için SADECE bu dosyayı düzenle.
//
//  tarih:  "YIL-AY-GÜNTSAAT:DAKİKA:00+03:00"  (+03:00 = Türkiye saati)
//  resmi:  true  -> ÖSYM açıkladı
//          false -> tahmini (sitede "Tahmini" etiketi çıkar)
//
//  ÖSYM 2027 takvimini açıklayınca (Kasım 2026 bekleniyor) buradaki
//  tarihleri güncelle ve resmi: true yap.
// =====================================================================

const SINAVLAR = [
  {
    kod: "TYT",
    ad: "Temel Yeterlilik Testi",
    grup: "YKS",
    tarih: "2027-06-19T10:15:00+03:00",
    resmi: false,
    ikon: "🎓"
  },
  {
    kod: "AYT",
    ad: "Alan Yeterlilik Testleri",
    grup: "YKS",
    tarih: "2027-06-20T10:15:00+03:00",
    resmi: false,
    ikon: "📐"
  },
  {
    kod: "YDT",
    ad: "Yabancı Dil Testi",
    grup: "YKS",
    tarih: "2027-06-20T15:45:00+03:00",
    resmi: false,
    ikon: "🌍"
  },
  {
    kod: "ALES",
    ad: "Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı (ALES/3)",
    grup: "ALES",
    tarih: "2026-11-29T10:15:00+03:00",
    resmi: true,
    ikon: "📚"
  },
  {
    kod: "KPSS Lisans",
    ad: "Kamu Personel Seçme Sınavı — Lisans",
    grup: "KPSS",
    tarih: "2028-07-16T10:15:00+03:00",
    resmi: false,
    ikon: "🏛️"
  },
  {
    kod: "KPSS Önlisans",
    ad: "Kamu Personel Seçme Sınavı — Önlisans",
    grup: "KPSS",
    tarih: "2028-10-01T10:15:00+03:00",
    resmi: false,
    ikon: "📝"
  },
  {
    kod: "KPSS Ortaöğretim",
    ad: "Kamu Personel Seçme Sınavı — Ortaöğretim",
    grup: "KPSS",
    tarih: "2026-10-25T10:15:00+03:00",
    resmi: true,
    ikon: "✏️"
  },
  {
    kod: "LGS",
    ad: "Liselere Geçiş Sistemi Merkezi Sınavı (MEB)",
    grup: "LGS",
    tarih: "2027-06-13T09:30:00+03:00",
    resmi: false,
    ikon: "🏫"
  }
];
