// =====================================================================
//  PUAN HESAPLAMA VERİLERİ
//  Her yıl ÖSYM yeni "sayısal bilgiler"i açıklayınca SADECE burası güncellenir.
//  Puanlar tahminidir: gerçek puan o yıl sınava girenlerin ortalamasına göre hesaplanır.
// =====================================================================

const YKS_VERI = {
  // Yaygın kullanılan yaklaşık katsayılar. Tam net = 500 ham puan olacak şekilde tutarlı.
  // ÖSYM test bazında standart sapma yayınlamadığı için kesin katsayı yoktur (±10 puan sapabilir).
  model: "Önceki yılların ortalama katsayıları (yaklaşık)",
  taban: 100,
  obpKatsayi: 0.12,          // Resmi: OBP × 0,12
  obpKatsayiYerlesen: 0.06,  // Resmi: önceki yıl bir programa yerleşenler için
  testler: {
    // anahtar: [ad, soru sayısı]
    tyt_tr:  ["Türkçe", 40],
    tyt_sos: ["Sosyal Bilimler", 20],
    tyt_mat: ["Temel Matematik", 40],
    tyt_fen: ["Fen Bilimleri", 20],
    ayt_mat: ["Matematik", 40],
    ayt_fiz: ["Fizik", 14],
    ayt_kim: ["Kimya", 13],
    ayt_biy: ["Biyoloji", 13],
    ayt_ede: ["Türk Dili ve Edebiyatı", 24],
    ayt_ta1: ["Tarih-1", 10],
    ayt_co1: ["Coğrafya-1", 6],
    ayt_ta2: ["Tarih-2", 11],
    ayt_co2: ["Coğrafya-2", 11],
    ayt_fel: ["Felsefe Grubu", 12],
    ayt_dkb: ["Din Kültürü", 6],
    ydt:     ["Yabancı Dil (YDT)", 80]
  },
  // Puan türü: { test: net başına katsayı }
  turler: {
    TYT: { tyt_tr: 3.3, tyt_sos: 3.4, tyt_mat: 3.3, tyt_fen: 3.4 },
    SAY: { tyt_tr: 1.32, tyt_sos: 1.36, tyt_mat: 1.32, tyt_fen: 1.36,
           ayt_mat: 3.0, ayt_fiz: 2.85, ayt_kim: 3.07, ayt_biy: 3.07 },
    EA:  { tyt_tr: 1.32, tyt_sos: 1.36, tyt_mat: 1.32, tyt_fen: 1.36,
           ayt_mat: 3.0, ayt_ede: 3.0, ayt_ta1: 2.8, ayt_co1: 3.33 },
    SÖZ: { tyt_tr: 1.32, tyt_sos: 1.36, tyt_mat: 1.32, tyt_fen: 1.36,
           ayt_ede: 3.0, ayt_ta1: 2.8, ayt_co1: 3.33, ayt_ta2: 2.91, ayt_co2: 2.91,
           ayt_fel: 3.0, ayt_dkb: 3.33 },
    DİL: { tyt_tr: 1.32, tyt_sos: 1.36, tyt_mat: 1.32, tyt_fen: 1.36, ydt: 3.0 }
  }
};

// KPSS: ÖSYM'nin standart puan yöntemi.
// SP = 50 + 10 × (net − ortalama) ÷ standart sapma
// Puan = 70 + 30 × [2(ASP − X) − S] ÷ [2(B − X) − S]
const KPSS_VERI = {
  soruSayisi: 60, // GY ve GK ayrı ayrı 60'ar soru
  korelasyon: 0.8, // GY ile GK arasındaki ilişki (ASP standart sapması için varsayım)
  duzeyler: {
    lisans: {
      ad: "Lisans",
      // Kaynak: ÖSYM KPSS GY-GK sayısal bilgileri
      yillar: {
        "2025": { gy: [17.430, 9.108], gk: [14.302, 9.257], not: "ÖSYM 2025 verisi" },
        "2024": { gy: [16.730, 9.098], gk: [18.861, 10.517], not: "ÖSYM 2024 verisi" }
      },
      puanTurleri: { P3: [0.5, 0.5], P1: [0.7, 0.3], P2: [0.6, 0.4] }
    },
    onlisans: {
      ad: "Önlisans",
      yillar: {
        "2018": { gy: [15.69, 8.24], gk: [17.11, 9.98], not: "Bulunabilen en güncel ÖSYM verisi 2018" }
      },
      puanTurleri: { P93: [0.5, 0.5] }
    },
    ortaogretim: {
      ad: "Ortaöğretim",
      yillar: {
        "2018": { gy: [15.69, 8.24], gk: [17.11, 9.98], not: "Ortaöğretim verisi bulunamadı, önlisans 2018 verisiyle yaklaşık hesaplanır" }
      },
      puanTurleri: { P94: [0.5, 0.5] }
    }
  }
};
